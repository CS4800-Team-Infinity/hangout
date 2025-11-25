/**
 * Cron job to send event reminders
 * Sends notifications for events:
 * - 1 day before event starts
 * - 1 hour before event starts
 */

import connect from "@/lib/connect";
import { sendNotificationToMultiple } from "@/lib/notificationUtils";
import Hangout from "@/models/Hangout";
import RSVP from "@/models/RSVP";
import type { NextApiRequest, NextApiResponse } from "next";

const CRON_SECRET = process.env.CRON_SECRET;

type Response = {
  success?: boolean;
  message?: string;
  error?: string;
  notificationsSent?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  // Verify secret
  if (!CRON_SECRET || req.headers["x-cron-secret"] !== CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connect();

    let totalNotificationsSent = 0;

    // Check for events happening in about 1 day
    totalNotificationsSent += await checkAndNotifyEventReminder(
      "1_day",
      23 * 60,
      25 * 60
    ); // 23-25 hours, convert hours to minutes

    // Check for events happening in about 1 hour
    totalNotificationsSent += await checkAndNotifyEventReminder(
      "1_hour",
      50,
      70
    ); // 50-70 minutes

    return res.status(200).json({
      success: true,
      message: "Cron job completed",
      notificationsSent: totalNotificationsSent,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function checkAndNotifyEventReminder(
  reminderType: "1_day" | "1_hour",
  minMinutesFromNow: number,
  maxMinutesFromNow: number
): Promise<number> {
  const now = new Date();
  const minTime = new Date(now.getTime() + minMinutesFromNow * 60 * 1000);
  const maxTime = new Date(now.getTime() + maxMinutesFromNow * 60 * 1000);

  const query: any = {
    date: { $gte: minTime, $lte: maxTime },
    status: "upcoming",
  };

  // Prevent duplicates
  if (reminderType === "1_day") {
    query.sentReminder1Day = { $ne: true };
  } else {
    query.sentReminder1Hour = { $ne: true };
  }

  const events = await Hangout.find(query);

  let notificationsSent = 0;

  for (const event of events) {
    // Find all accepted RSVPs for this event
    const acceptedRSVPs = await RSVP.find({
      hangout: event._id,
      status: "accepted",
    }).select("user");

    const userIds = acceptedRSVPs.map((rsvp) => rsvp.user.toString());

    if (userIds.length > 0) {
      const title =
        reminderType === "1_day"
          ? "Event Reminder - Tomorrow!"
          : "Event Reminder - In 1 Hour!";
      const body = `"${event.title}" is starting ${
        reminderType === "1_day" ? "tomorrow" : "in 1 hour"
      }!`;

      // Check if we already sent this reminder to avoid duplicates
      await sendNotificationToMultiple(userIds, title, body);
      notificationsSent += userIds.length;

      // Mark reminder as sent
      await Hangout.updateOne(
        { _id: event._id },
        {
          $set:
            reminderType === "1_day"
              ? { sentReminder1Day: true }
              : { sentReminder1Hour: true },
        }
      );
    }
  }

  return notificationsSent;
}
