/**
 * Cron job to send event reminders
 * Sends notifications for events:
 * - 1 day before event starts
 * - 1 hour before event starts
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '@/lib/connect';
import Hangout from '@/models/Hangout';
import RSVP from '@/models/RSVP';
import { sendNotificationToMultiple } from '@/lib/notificationUtils';

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
  if (!CRON_SECRET || req.headers['x-cron-secret'] !== CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connect();

    let totalNotificationsSent = 0;

    // Check for events happening in about 1 day 
    totalNotificationsSent += await checkAndNotifyEventReminder('1_day', 23, 25); // 23-25 hours 

    // Check for events happening in about 1 hour
    totalNotificationsSent += await checkAndNotifyEventReminder('1_hour', 50, 70); // 50-70 minutes 

    return res.status(200).json({
      success: true,
      message: 'Cron job completed',
      notificationsSent: totalNotificationsSent,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function checkAndNotifyEventReminder(
  reminderType: '1_day' | '1_hour',
  minHoursFromNow: number,
  maxHoursFromNow: number
): Promise<number> {
  const now = new Date();
  const minTime = new Date(now.getTime() + minHoursFromNow * 60 * 60 * 1000);
  const maxTime = new Date(now.getTime() + maxHoursFromNow * 60 * 60 * 1000);

  // Find upcoming events
  const events = await Hangout.find({
    date: { $gte: minTime, $lte: maxTime },
    status: 'upcoming',
  }).lean();

  let notificationsSent = 0;

  for (const event of events) {
    // Find all accepted RSVPs for this event
    const acceptedRSVPs = await RSVP.find({
      hangout: event._id,
      status: 'accepted',
    }).select('user');

    const userIds = acceptedRSVPs.map((rsvp) => rsvp.user.toString());

    if (userIds.length > 0) {
      const title = reminderType === '1_day' ? 'Event Reminder - Tomorrow!' : 'Event Reminder - In 1 Hour!';
      const body = `"${event.title}" is starting ${reminderType === '1_day' ? 'tomorrow' : 'in 1 hour'}!`;

      // Check if we already sent this reminder to avoid duplicates
      await sendNotificationToMultiple(userIds, title, body);
      notificationsSent += userIds.length;
    }
  }

  return notificationsSent;
}
