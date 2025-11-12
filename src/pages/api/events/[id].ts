import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connect';
import Hangout from '@/models/Hangout';
import RSVP from '@/models/RSVP';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Event ID is required' });
  }

  if (req.method === 'GET') {
    return handleGetEvent(req, res, id);
  } else if (req.method === 'PUT') {
    return handleUpdateEvent(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDeleteEvent(req, res, id);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGetEvent(req: NextApiRequest, res: NextApiResponse, eventId: string) {
  try {
    // Check if eventId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);

    // Build query based on ID format
    const query = isValidObjectId
      ? { $or: [{ _id: eventId }, { uuid: eventId }] }
      : { uuid: eventId };

    const event = await Hangout.findOne(query).populate('host', 'name username email bio');

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

        const isHost = event.host._id.toString() === userId;
        const hasRSVP = await RSVP.findOne({ hangout: event._id, user: userId });

        if (!isHost && !hasRSVP) {
          return res.status(403).json({ success: false, error: 'Access denied to this private event' });
        }
      } catch (tokenError) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }
    }

    const rsvpCount = await RSVP.countDocuments({ 
      hangout: event._id, 
      status: 'accepted' 
    });

    const attendees = await RSVP.find({ 
      hangout: event._id, 
      status: 'accepted' 
    })
    .populate('user', 'name username email')
    .lean();

    res.status(200).json({
      success: true,
      event: {
        ...event.toJSON(),
        attendeeCount: rsvpCount,
        attendees: attendees.map(rsvp => rsvp.user)
      }
    });

  } catch (error: any) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleUpdateEvent(req: NextApiRequest, res: NextApiResponse, eventId: string) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // Check if eventId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);

    // Build query based on ID format
    const query = isValidObjectId
      ? { $or: [{ _id: eventId }, { uuid: eventId }] }
      : { uuid: eventId };

    const event = await Hangout.findOne(query);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.host.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Only the event host can update this event' });
    }

    const { title, description, date, location, maxParticipants, isPublic, imageUrl, status } = req.body;

    if (date) {
      const eventDate = new Date(date);
      if (eventDate <= new Date()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Event date must be in the future' 
        });
      }
      event.date = eventDate;
    }

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (location) {
      if (location.address) event.location.address = location.address.trim();
      if (location.coordinates && Array.isArray(location.coordinates)) {
        event.location.coordinates = location.coordinates;
      }
    }
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    if (isPublic !== undefined) event.isPublic = isPublic;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (status) event.status = status;

    const updatedEvent = await event.save();
    await updatedEvent.populate('host', 'name username email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error: any) {
    console.error('Update event error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0] as any;
      return res.status(400).json({ 
        success: false, 
        error: firstError?.message || 'Validation error'
      });
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleDeleteEvent(req: NextApiRequest, res: NextApiResponse, eventId: string) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // Check if eventId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);

    // Build query based on ID format
    const query = isValidObjectId
      ? { $or: [{ _id: eventId }, { uuid: eventId }] }
      : { uuid: eventId };

    const event = await Hangout.findOne(query);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.host.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Only the event host can delete this event' });
    }

    await RSVP.deleteMany({ hangout: event._id });

    await Hangout.findByIdAndDelete(event._id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete event error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}