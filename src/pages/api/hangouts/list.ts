import { NextApiRequest, NextApiResponse } from 'next';
import connect from '@/lib/connect';
import Hangout from '@/models/Hangout';
import RSVP from '@/models/RSVP';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connect();

    const { status = 'upcoming', isPublic } = req.query;

    // Build query
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    // Fetch hangouts with populated host
    const hangouts = await Hangout.find(query)
      .populate('host', 'name profilePicture')
      .sort({ date: 1 })
      .lean();

    // Get RSVPs for all hangouts
    const hangoutIds = hangouts.map(h => h._id);
    const rsvps = await RSVP.find({
      hangout: { $in: hangoutIds },
      status: 'accepted'
    })
      .populate('user', 'name profilePicture')
      .lean();

    // Map hangouts to event card format
    const events = hangouts.map(hangout => {
      const hangoutRSVPs = rsvps.filter(
        rsvp => rsvp.hangout.toString() === hangout._id.toString()
      );

      const attendees = hangoutRSVPs.map(rsvp => ({
        id: (rsvp.user as any)._id.toString(),
        name: (rsvp.user as any).name,
        avatarUrl: (rsvp.user as any).profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent((rsvp.user as any).name)}&background=random`
      }));

      const date = new Date(hangout.date);
      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = date.getDate().toString();
      const datetime = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      return {
        eventId: hangout.uuid,
        month,
        day,
        title: hangout.title,
        location: hangout.location.address,
        datetime,
        host: (hangout.host as any).name,
        status: 'Just Viewed' as const,
        price: 'Free',
        imageUrl: (hangout as any).imageUrl || `https://source.unsplash.com/800x600/?event,${encodeURIComponent(hangout.title)}`,
        attendees,
        registrationUrl: `/events/${hangout.uuid}`,
        coordinates: hangout.location.coordinates
      };
    });

    return res.status(200).json({
      success: true,
      events
    });

  } catch (error) {
    console.error('Error fetching hangouts:', error);
    return res.status(500).json({
      error: 'Failed to fetch hangouts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
