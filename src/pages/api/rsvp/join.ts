import connect from "@/lib/connect";
import RSVP from "@/models/RSVP";
import Hangout from "@/models/Hangout";
import { sendNotification } from "@/lib/notificationUtils";
import Notification from "@/models/Notification";
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

    // Create a persistent notification in the database so the client menu
    // will show the item immediately. Attempt to create it synchronously
    // and include it in the response so clients can refresh UI instantly.
    let createdNotification = null;
    try {
      const hangout = await Hangout.findById(hangoutObjectId).lean();
      const title = "You're in — RSVP accepted";
      const hangoutTitle = (hangout as any)?.title;
      const body = hangoutTitle
        ? `You're RSVP'd to "${hangoutTitle}" — see event details for more.`
        : "You're RSVP'd to the event.";

      // Persist to DB so NotificationsMenu sees it immediately
      try {
        createdNotification = await Notification.create({ userId: String(userObjectId), title, body, read: false });
      } catch (dbErr) {
        console.warn('Failed to persist notification to DB:', dbErr);
      }

      // Best-effort: also call the server notification API (non-blocking)
      try {
        await sendNotification(String(userObjectId), title, body);
      } catch (e) {
        console.warn('Failed to send RSVP notification via API:', e);
      }
    } catch (e) {
      console.warn('Failed to prepare RSVP notification payload:', e);
    }

    return res.status(200).json({
      message: "Joined event successfully",
      rsvp: newRSVP,
      notification: createdNotification,
    });
  } catch (err) {
    console.error("RSVP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
