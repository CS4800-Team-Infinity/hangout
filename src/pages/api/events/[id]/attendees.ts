import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connect';
import Hangout from '@/models/Hangout';
import RSVP from '@/models/RSVP';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Event ID is required' });
  }

  try {
    // Find event
    const event = await Hangout.findOne({
      $or: [{ _id: id }, { uuid: id }]
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (!event.isPublic) {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required for private events' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const userId = decoded.userId;

        const isHost = event.host.toString() === userId;
        const hasRSVP = await RSVP.findOne({ hangout: event._id, user: userId });

        if (!isHost && !hasRSVP) {
          return res.status(403).json({ success: false, error: 'Access denied to this private event' });
        }
      } catch (tokenError) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }
    }

    const { status = 'accepted' } = req.query;

    const rsvpQuery: any = { hangout: event._id };
    if (status && status !== 'all') {
      rsvpQuery.status = status;
    }

    const rsvps = await RSVP.find(rsvpQuery)
      .populate('user', 'name username email bio profilePicture')
      .sort({ respondedAt: -1 })
      .lean();

    const host = await event.populate('host', 'name username email bio profilePicture');

    const attendeesByStatus = {
      accepted: rsvps.filter(rsvp => rsvp.status === 'accepted'),
      pending: rsvps.filter(rsvp => rsvp.status === 'pending'),
      declined: rsvps.filter(rsvp => rsvp.status === 'declined')
    };

    const totals = {
      accepted: attendeesByStatus.accepted.length,
      pending: attendeesByStatus.pending.length,
      declined: attendeesByStatus.declined.length,
      total: rsvps.length,
      capacity: event.maxParticipants || null,
      spotsLeft: event.maxParticipants ? Math.max(0, event.maxParticipants - attendeesByStatus.accepted.length) : null
    };

    res.status(200).json({
      success: true,
      host: host.host,
      attendees: status === 'all' ? attendeesByStatus : rsvps.map(rsvp => ({
        ...rsvp.user,
        rsvpStatus: rsvp.status,
        respondedAt: rsvp.respondedAt,
        notes: rsvp.notes
      })),
      totals
    });

  } catch (error: any) {
    console.error('Get attendees error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}