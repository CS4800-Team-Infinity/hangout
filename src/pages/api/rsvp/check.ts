import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '@/lib/connect';
import RSVP from '@/models/RSVP';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId, userId } = req.query as { eventId?: string; userId?: string };

  if (!eventId || !userId) {
    return res.status(400).json({ error: 'eventId and userId are required' });
  }

  try {
    await connect();

    const rsvp = await RSVP.findOne({ user: userId, hangout: eventId }).lean();

    // Return a 200 with a consistent payload even when there's no RSVP.
    // This avoids 404-driven control flow in clients and is easier to consume.
    if (!rsvp) {
      return res.status(200).json({ success: true, already: false, status: null });
    }

    const rsvpStatus = (rsvp as any)?.status ?? null;
    return res.status(200).json({ success: true, already: true, status: rsvpStatus, rsvp });
  } catch (err) {
    console.error('rsvp/check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
