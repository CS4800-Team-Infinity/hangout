#!/usr/bin/env ts-node

/**
 * scripts/trigger-reminder.ts
 *
 * Usage:
 *  npx ts-node scripts/trigger-reminder.ts           # find an event within next hour and notify
 *  npx ts-node scripts/trigger-reminder.ts <EVENT_ID>  # notify RSVPs for a specific event
 *
 * This script connects to the project's MongoDB (using MONGODB_URI from .env.local)
 * and sends reminder notifications to users who RSVP'd to an event. It uses the
 * server-side helper `sendNotificationToMultiple`, which requires
 * NOTIFICATIONS_SERVER_TOKEN to be set in the environment.
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import connect from '../src/lib/connect';
import Hangout from '../src/models/Hangout';
import RSVP from '../src/models/RSVP';
import { sendNotificationToMultiple } from '../src/lib/notificationUtils';

async function main() {
  const arg = process.argv[2];

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set in environment. Set it in .env.local');
    process.exit(1);
  }

  const SERVER_TOKEN = process.env.NOTIFICATIONS_SERVER_TOKEN;
  if (!SERVER_TOKEN) {
    console.warn('NOTIFICATIONS_SERVER_TOKEN not set — sendNotification will be skipped');
  }

  await connect();

  let hangout: any = null;

  if (arg) {
    // Use provided event id
    hangout = await Hangout.findById(arg).lean();
    if (!hangout) {
      console.error('No event found with id', arg);
      process.exit(1);
    }
  } else {
    // Find next event starting within the next hour
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    hangout = await Hangout.findOne({
      startTime: { $gte: now, $lte: inOneHour },
    })
      .sort({ startTime: 1 })
      .lean();

    if (!hangout) {
      console.error('No upcoming events within the next hour found. You can pass an EVENT_ID as argument.');
      process.exit(1);
    }
  }

  console.log('Triggering reminders for event:', hangout._id, hangout.title || hangout.name || 'Untitled');

  // Find RSVPs for this event
  const rsvps = await RSVP.find({ hangout: hangout._id }).lean();
  const userIds = rsvps.map((r: any) => r.user.toString()).filter(Boolean);

  if (userIds.length === 0) {
    console.log('No RSVPs for this event — nothing to notify.');
    process.exit(0);
  }

  const title = `Reminder: ${hangout.title || hangout.name || 'Event'} starts soon`;
  const body = `Your event "${hangout.title || hangout.name || 'Event'}" starts at ${new Date(
    hangout.startTime
  ).toLocaleString()}.`;

  console.log(`Sending notification to ${userIds.length} users...`);

  try {
    await sendNotificationToMultiple(userIds, title, body);
    console.log('Notifications sent (or attempted).');
  } catch (err) {
    console.error('Error while sending notifications:', err);
  } finally {
    process.exit(0);
  }
}

main();
