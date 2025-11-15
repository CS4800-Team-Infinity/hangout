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

  if (req.method === "POST") {
    return handleCreateRSVP(req, res, id);
  } else if (req.method === "DELETE") {
    return handleDeleteRSVP(req, res, id);
  } else if (req.method === "PUT") {
    return handleUpdateRSVP(req, res, id);
  } else if (req.method === "GET") {
    return handleCheckRSVP(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }
}

async function handleCreateRSVP(
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const event = await Hangout.findOne({
      $or: [{ _id: eventId }, { uuid: eventId }],
    });

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    // Date invalid or event canceled
    if (new Date(event.date) <= new Date()) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot RSVP to past events" });
    }

    if (event.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, error: "Cannot RSVP to cancelled events" });
    }

    // Host auto-attends
    if (event.host.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: "Event host is automatically attending",
      });
    }

    const { status = "accepted", notes } = req.body;

    if (!["pending", "accepted", "declined"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid RSVP status" });
    }

    // Capacity check
    if (status === "accepted" && event.maxParticipants) {
      const currentAttendees = await RSVP.countDocuments({
        hangout: event._id,
        status: "accepted",
      });

      if (currentAttendees >= event.maxParticipants) {
        return res
          .status(400)
          .json({ success: false, error: "Event is at maximum capacity" });
      }
    }

    let rsvp = await RSVP.findOne({ hangout: event._id, user: userId });

    if (rsvp) {
      rsvp.status = status;
      rsvp.respondedAt = new Date();
      if (notes !== undefined) rsvp.notes = notes;
      await rsvp.save();
    } else {
      rsvp = new RSVP({
        hangout: event._id,
        user: userId,
        status,
        respondedAt: new Date(),
        notes,
      });
      await rsvp.save();
    }

    await rsvp.populate("user", "name username email");

    res.status(200).json({
      success: true,
      message: `RSVP ${status} successfully`,
      rsvp,
    });
  } catch (error: any) {
    console.error("Create RSVP error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function handleUpdateRSVP(
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

    const rsvp = await RSVP.findOne({
      hangout: { $in: [eventId] },
      user: userId,
    });

    if (!rsvp) {
      return res.status(404).json({ success: false, error: "RSVP not found" });
    }

    const { status, notes } = req.body;

    if (!["pending", "accepted", "declined"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid RSVP status" });
    }

    if (status === "accepted" && rsvp.status !== "accepted") {
      const event = await Hangout.findById(rsvp.hangout);
      if (event && event.maxParticipants) {
        const currentAttendees = await RSVP.countDocuments({
          hangout: event._id,
          status: "accepted",
        });

        if (currentAttendees >= event.maxParticipants) {
          return res
            .status(400)
            .json({ success: false, error: "Event is at maximum capacity" });
        }
      }
    }

    rsvp.status = status;
    rsvp.respondedAt = new Date();
    if (notes !== undefined) rsvp.notes = notes;
    await rsvp.save();

    await rsvp.populate("user", "name username email");

    res.status(200).json({
      success: true,
      message: `RSVP updated to ${status}`,
      rsvp,
    });
  } catch (error: any) {
    console.error("Update RSVP error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function handleDeleteRSVP(
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

    const rsvp = await RSVP.findOneAndDelete({
      hangout: { $in: [eventId] },
      user: userId,
    });

    if (!rsvp) {
      return res.status(404).json({ success: false, error: "RSVP not found" });
    }

    res.status(200).json({
      success: true,
      message: "RSVP removed successfully",
    });
  } catch (error: any) {
    console.error("Delete RSVP error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function handleCheckRSVP(req: NextApiRequest, res: NextApiResponse) {
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

    const { eventId } = req.query; // or req.body, depends on your usage
    const userId = decoded.userId;

    const event = await Hangout.findOne({
      $or: [{ _id: eventId }, { uuid: eventId }],
    });

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    const rsvp = await RSVP.findOne({
      hangout: event._id,
      user: userId,
    });

    return res.status(200).json({
      success: true,
      already: !!rsvp,
      status: rsvp?.status || null,
    });
  } catch (error) {
    console.error("Check RSVP error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
