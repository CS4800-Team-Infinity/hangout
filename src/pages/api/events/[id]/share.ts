import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connect';
import Hangout from '@/models/Hangout';

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
    const event = await Hangout.findOne({
      $or: [{ _id: id }, { uuid: id }]
    }).populate('host', 'name username email');

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        userId = decoded.userId;
      } catch (tokenError) {
      }
    }

    const isHost = userId && event.host._id.toString() === userId;
    const isPublic = event.isPublic;

    if (!isPublic && !isHost) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only the host can generate share links for private events' 
      });
    }

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://gethangout.app' 
      : 'http://localhost:3000';

    const shareUrls = {
      event: `${baseUrl}/events/${event.uuid}`,
      
      share: `${baseUrl}/events/${event.uuid}/share`,
      
      rsvp: isPublic ? `${baseUrl}/events/${event.uuid}/rsvp` : null
    };

    const shareMetadata = {
      title: `Join "${event.title}" on HangOut`,
      description: event.description.length > 150 
        ? `${event.description.substring(0, 150)}...` 
        : event.description,
      image: event.imageUrl || `${baseUrl}/images/events/default-event.jpg`,
      url: shareUrls.event,
      
      social: {
        twitter: {
          text: `Join me at "${event.title}" on ${new Date(event.date).toLocaleDateString()}!`,
          url: shareUrls.event,
          hashtags: ['HangOut', 'Event', 'MeetUp']
        },
        facebook: {
          url: shareUrls.share,
          quote: `Join "${event.title}" - ${event.description}`
        },
        whatsapp: {
          text: `Hey! I'm organizing "${event.title}" on ${new Date(event.date).toLocaleDateString()}. Want to join? ${shareUrls.event}`
        },
        email: {
          subject: `Invitation: ${event.title}`,
          body: `Hi!\n\nYou're invited to join "${event.title}" on ${new Date(event.date).toLocaleDateString()} at ${event.location.address}.\n\n${event.description}\n\nRSVP here: ${shareUrls.event}\n\nSee you there!\n- ${event.host.name}`
        }
      }
    };

    const eventInfo = {
      id: event._id,
      uuid: event.uuid,
      title: event.title,
      description: event.description,
      date: event.date,
      location: {
        address: event.location.address,
        coordinates: event.location.coordinates
      },
      host: {
        name: event.host.name,
        username: event.host.username
      },
      isPublic: event.isPublic,
      maxParticipants: event.maxParticipants,
      status: event.status
    };

    res.status(200).json({
      success: true,
      shareUrls,
      shareMetadata,
      eventInfo,
      canShare: isPublic || isHost,
      isHost,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Generate share link error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}