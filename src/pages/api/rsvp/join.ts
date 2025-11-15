import connect from "@/lib/connect";
import RSVP from "@/models/RSVP";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, hangoutId } = req.body;

  if (!userId || !hangoutId) {
    return res.status(400).json({ message: "Missing userId or hangoutId" });
  }

  try {
    await connect();

    const userObjectId = userId;
    const hangoutObjectId = hangoutId;

    // Check if RSVP already exists
    const existing = await RSVP.findOne({
      user: userObjectId,
      hangout: hangoutObjectId,
    });

    // If already joined, return existing RSVP
    if (existing) {
      return res.status(409).json({
        message: "You have already joined this event",
        rsvp: existing,
      });
    }

    // Create new RSVP
    const newRSVP = await RSVP.create({
      user: userObjectId,
      hangout: hangoutObjectId,
      status: "accepted",
      respondedAt: new Date(),
    });

    return res.status(200).json({
      message: "Joined event successfully",
      rsvp: newRSVP,
    });
  } catch (err) {
    console.error("RSVP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
