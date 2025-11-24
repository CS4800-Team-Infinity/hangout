// pages/api/notifications.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '@/lib/connect';
import NotificationModel from '@/models/Notification';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

/**
 * API Handler for notifications
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const SERVER_TOKEN = process.env.NOTIFICATIONS_SERVER_TOKEN;

  // ---------------------------------------------------------
  // 1. Server-to-server creation (Admin / Backend)
  // ---------------------------------------------------------
  if (
    req.method === 'POST' &&
    req.headers.authorization &&
    SERVER_TOKEN &&
    req.headers.authorization === `Bearer ${SERVER_TOKEN}`
  ) {
    await connect();

    const { userId, title, body } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    const notif = await NotificationModel.create({
      userId,
      title,
      body,
      read: false,
    });

    return res.status(201).json({ notification: notif });
  }

  // ---------------------------------------------------------
  // 2. User token authentication for all other routes
  // ---------------------------------------------------------
  let userId: string | null = null;

  try {
    const token = getTokenFromRequest(req);
    if (!token) throw new Error('No token provided');

    const payload = verifyToken(token);
    userId = payload.userId;

    if (!userId) throw new Error('Token missing userId');
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connect();

  // ---------------------------------------------------------
  // 3. GET: Fetch notifications for the authenticated user
  // ---------------------------------------------------------
  if (req.method === 'GET') {
    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  }

  // ---------------------------------------------------------
  // 4. PATCH: Mark notifications as read
  // ---------------------------------------------------------
  if (req.method === 'PATCH') {
    const { ids } = req.body as { ids?: string[] };

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'An array "ids" is required' });
    }

    const result = await NotificationModel.updateMany(
      { _id: { $in: ids }, userId },
      { $set: { read: true } }
    );

    const updatedCount =
      (result as any).modifiedCount ||
      (result as any).nModified ||
      0;

    return res.status(200).json({ updatedCount });
  }

  // ---------------------------------------------------------
  // 5. POST (user-level): User creates a notification
  // ---------------------------------------------------------
  if (req.method === 'POST') {
    const { title, body } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const notif = await NotificationModel.create({
      userId,
      title,
      body,
      read: false,
    });

    return res.status(201).json({ notification: notif });
  }

  // ---------------------------------------------------------
  // 6. Unsupported method
  // ---------------------------------------------------------
  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
