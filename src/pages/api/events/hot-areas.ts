import connectDB from "@/lib/connect";
import Hangout from "@/models/Hangout";
import RSVP from "@/models/RSVP";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { limit = "12" } = req.query;
    const limitNum = parseInt(limit as string);

    // Aggregate to find the most searched/popular locations
    // This groups events by location and counts them
    const popularLocations = await Hangout.aggregate([
      {
        $match: {
          isPublic: true,
          status: "upcoming",
          date: { $gte: new Date() },
        },
      },
      {
        $group: {
          _id: "$location.address",
          count: { $sum: 1 },
          events: { $push: "$_id" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5, // Get top 5 hot areas
      },
    ]);

    // Get event IDs from hot areas
    const hotAreaEventIds = popularLocations.flatMap((loc) => loc.events);

    // Fetch actual events from these hot areas
    const events = await Hangout.find({
      _id: { $in: hotAreaEventIds },
      isPublic: true,
      status: "upcoming",
      date: { $gte: new Date() },
    })
      .populate("host", "name username email")
      .sort({ date: 1 })
      .limit(limitNum)
      .lean();

    // Get RSVPs with user details for all events
    const eventIds = events.map((e: any) => e._id);
    const rsvps = await RSVP.find({
      hangout: { $in: eventIds },
      status: "accepted",
    })
      .populate("user", "name username email profilePicture profileImage")
      .lean();

    // Group RSVPs by event
    const rsvpMap = new Map();
    rsvps.forEach((rsvp: any) => {
      const eventId = rsvp.hangout.toString();
      if (!rsvpMap.has(eventId)) {
        rsvpMap.set(eventId, []);
      }

      const attendeeData = {
        _id: rsvp.user._id,
        name: rsvp.user.name || "Unknown User",
        username: rsvp.user.username,
        email: rsvp.user.email,
        avatarUrl:
          rsvp.user.profilePicture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            rsvp.user.name
          )}&background=random`,
      };

      rsvpMap.get(eventId).push(attendeeData);
    });

    const eventsWithAttendees = events.map((event: any) => {
      const attendees = rsvpMap.get(event._id.toString()) || [];
      return {
        ...event,
        _id: event._id.toString(),
        attendees: attendees,
        attendeeCount: attendees.length,
      };
    });

    res.status(200).json({
      success: true,
      events: eventsWithAttendees,
    });
  } catch (error: any) {
    console.error("Hot areas events error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
