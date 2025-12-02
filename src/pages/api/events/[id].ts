import connectDB from "@/lib/connect";
import Hangout from "@/models/Hangout";
import RSVP from "@/models/RSVP";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ success: false, error: "Event ID is required" });
  }

  if (req.method === "GET") {
    return handleGetEvent(req, res, id);
  } else if (req.method === "PUT") {
    return handleUpdateEvent(req, res, id);
  } else if (req.method === "DELETE") {
    return handleDeleteEvent(req, res, id);
  } else {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }
}

async function handleGetEvent(
  req: NextApiRequest,
  res: NextApiResponse,
  eventId: string
) {
  try {
    // Check if eventId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);

    // Build query based on ID format
    const query = isValidObjectId
      ? { $or: [{ _id: eventId }, { uuid: eventId }] }
      : { uuid: eventId };

    let event = await Hangout.findOne(query).populate(
      "host",
      "name username email bio"
    );

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    // increment counters
    try {
      const beforeUpdate = await Hangout.findById(event._id).lean();
      console.log("🔍 Before update:", beforeUpdate);

      await Hangout.updateOne(
        { _id: event._id },
        {
          $inc: {
            viewCount: 1,
            viewsLast24h: 1,
          },
        }
      );

      const afterUpdate = await Hangout.findById(event._id)
        .select("viewCount viewsLast24h")
        .lean();
      console.log("🔍 After update:", afterUpdate);
    } catch (err) {
      console.error("❌ Error updating view counts:", err);
    }

    // reload updated version
    event = await Hangout.findById(event._id).populate(
      "host",
      "name username email bio"
    );

    console.log("viewsLast24h AFTER UPDATE:", event.viewsLast24h);

    if (!event.isPublic) {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Authentication required for private events",
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: string;
        };
        const userId = decoded.userId;

        const isHost = event.host._id.toString() === userId;
        const hasRSVP = await RSVP.findOne({
          hangout: event._id,
          user: userId,
        });

        if (!isHost && !hasRSVP) {
          return res.status(403).json({
            success: false,
            error: "Access denied to this private event",
          });
        }
      } catch (tokenError) {
        return res.status(401).json({ success: false, error: "Invalid token" });
      }
    }

    const rsvpCount = await RSVP.countDocuments({
      hangout: event._id,
      status: "accepted",
    });

    const attendees = await RSVP.find({
      hangout: event._id,
      status: "accepted",
    })
      .populate("user", "name username email")
      .lean();

    const eventTags = Array.isArray(event.tags) ? event.tags : [];

    // related events query
    const relatedQuery = {
      _id: { $ne: event._id },
      isPublic: true,
      status: "upcoming",
      $or: [
        { host: event.host._id },
        ...(eventTags.length > 0 ? [{ tags: { $in: eventTags } }] : []),
      ],
    };

    const relatedEventsRaw = await Hangout.find(relatedQuery)
      .populate("host", "name username email")
      .sort({ date: 1 })
      .limit(4)
      .lean();

    const relatedRSVPs = await RSVP.find({
      hangout: { $in: relatedEventsRaw.map((e) => e._id) },
      status: "accepted",
    })
      .populate("user", "name username profilePicture")
      .lean();

    const rsvpByEvent: Record<string, any[]> = {};
    for (const r of relatedRSVPs) {
      const key = r.hangout.toString();
      if (!rsvpByEvent[key]) rsvpByEvent[key] = [];
      rsvpByEvent[key].push(r.user);
    }

    const relatedEvents = relatedEventsRaw.map((e: any) => {
      const attendees = (rsvpByEvent[e._id.toString()] || []).map((u: any) => ({
        id: u._id?.toString(),
        name: u.name,
        avatarUrl:
          u.profilePicture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            u.name
          )}&background=random`,
      }));

      return {
        id: e._id.toString(),
        title: e.title,
        datetime: e.date,
        location: e.location?.address || "",
        host: e.host?.name || "",
        imageUrl: e.imageUrl,
        price: e.price,
        attendees,
      };
    });

    // response with event + related
    res.status(200).json({
      success: true,
      event: {
        ...event.toJSON(),
        attendeeCount: rsvpCount,
        attendees: attendees.map((r) => r.user),
      },
      relatedEvents,
    });
  } catch (error: any) {
    console.error("Get event error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function handleUpdateEvent(
  req: NextApiRequest,
  res: NextApiResponse,
  eventId: string
) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const userId = decoded.userId;

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);

    const query = isValidObjectId
      ? { $or: [{ _id: eventId }, { uuid: eventId }] }
      : { uuid: eventId };

    let event = await Hangout.findOne(query);

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    await Hangout.findByIdAndUpdate(event._id, {
      $inc: {
        viewCount: 1,
        viewsLast24h: 1,
      },
    });

    // allow event host or admin users to update
    const requestingUser = await User.findById(userId).select("role");
    if (event.host.toString() !== userId && requestingUser?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only the event host or an admin can update this event",
      });
    }

    const {
      title,
      description,
      overview,
      lineup,
      hostInfo,
      tags,
      date,
      location,
      maxParticipants,
      isPublic,
      imageUrl,
      price,
      status,
    } = req.body;

    if (date) {
      const eventDate = new Date(date);
      if (eventDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: "Event date must be in the future",
        });
      }
      event.date = eventDate;
    }

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (location) {
      if (location.address) event.location.address = location.address.trim();
      if (location.coordinates && Array.isArray(location.coordinates)) {
        event.location.coordinates = location.coordinates;
      }
    }
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    if (isPublic !== undefined) event.isPublic = isPublic;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (status) event.status = status;
    if (price !== undefined) event.price = price;
    if (overview !== undefined) event.overview = overview.trim();
    if (lineup !== undefined) event.lineup = lineup.trim();
    if (hostInfo !== undefined) event.hostInfo = hostInfo.trim();
    if (tags !== undefined) event.tags = Array.isArray(tags) ? tags : [];

    const updatedEvent = await event.save();
    await updatedEvent.populate("host", "name username email");

    console.log("viewsLast24h AFTER UPDATE:", updatedEvent.viewsLast24h);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error("Update event error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0] as any;
      return res.status(400).json({
        success: false,
        error: firstError?.message || "Validation error",
      });
    }

    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function handleDeleteEvent(
  req: NextApiRequest,
  res: NextApiResponse,
  eventId: string
) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const userId = decoded.userId;

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);

    const query = isValidObjectId
      ? { $or: [{ _id: eventId }, { uuid: eventId }] }
      : { uuid: eventId };

    const event = await Hangout.findOne(query);

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    // allow event host or admins to delete
    const requestingUser = await User.findById(userId).select("role");
    if (event.host.toString() !== userId && requestingUser?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only the event host or an admin can delete this event",
      });
    }

    await RSVP.deleteMany({ hangout: event._id });

    await Hangout.findByIdAndDelete(event._id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete event error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
