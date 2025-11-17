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

    // Fetch public upcoming events sorted by viewCount, viewsLast24, rsvpLast24, or createdAt
    const events = await Hangout.find({
      isPublic: true,
      status: "upcoming",
      date: { $gte: new Date() },
    })
      .populate("host", "name username email")
      .sort({
        viewCount: -1,
        viewsLast24h: -1,
        rsvpsLast24h: -1,
        createdAt: -1,
      }) // Sort by popularity
      .limit(limitNum)
      .lean();

    // Get RSVPs with user details for all events
    const eventIds = events.map((e) => e._id);
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
      rsvpMap.get(eventId).push({
        _id: rsvp.user._id,
        name: rsvp.user.name,
        username: rsvp.user.username,
        email: rsvp.user.email,
        avatarUrl:
          rsvp.user.profilePicture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            rsvp.user.name
          )}&background=random`,
      });
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
    console.error("Hot today events error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
