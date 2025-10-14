import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connect';
import Hangout from '@/models/Hangout';
import RSVP from '@/models/RSVP';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ success: false, error: 'User ID is required' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let requestingUserId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        requestingUserId = decoded.userId;
      } catch (tokenError) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }
    }

    const isOwnProfile = requestingUserId === userId;
    
    const targetUser = await User.findById(userId, 'name username email');
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { 
      page = '1', 
      limit = '10', 
      type = 'all', // 'hosted', 'attending', 'all'
      status = 'upcoming' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let hostedEvents: any[] = [];
    let attendingEvents: any[] = [];

    if (type === 'hosted' || type === 'all') {
      const hostedQuery: any = { host: userId };
      
      if (status !== 'all') {
        hostedQuery.status = status;
      }

      if (!isOwnProfile) {
        hostedQuery.isPublic = true;
      }

      const hostedEventsQuery = Hangout.find(hostedQuery)
        .populate('host', 'name username email')
        .sort({ date: status === 'upcoming' ? 1 : -1 });

      if (type === 'hosted') {
        hostedEvents = await hostedEventsQuery
          .skip(skip)
          .limit(limitNum)
          .lean();
      } else {
        hostedEvents = await hostedEventsQuery.lean();
      }
    }

    if (type === 'attending' || type === 'all') {
      const rsvpQuery: any = { user: userId, status: 'accepted' };
      
      const rsvps = await RSVP.find(rsvpQuery)
        .populate({
          path: 'hangout',
          populate: {
            path: 'host',
            select: 'name username email'
          }
        })
        .lean();

      attendingEvents = rsvps
        .map(rsvp => rsvp.hangout)
        .filter(event => {
          if (!event) return false;
          
          if (status !== 'all' && event.status !== status) return false;
          
          if (!isOwnProfile && !event.isPublic) return false;
          
          return true;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return status === 'upcoming' ? dateA - dateB : dateB - dateA;
        });

      if (type === 'attending') {
        attendingEvents = attendingEvents.slice(skip, skip + limitNum);
      }
    }

    let allEvents: any[] = [];
    let totalCount = 0;

    if (type === 'all') {
      allEvents = [...hostedEvents, ...attendingEvents]
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return status === 'upcoming' ? dateA - dateB : dateB - dateA;
        });
      
      totalCount = allEvents.length;
      allEvents = allEvents.slice(skip, skip + limitNum);
    } else {
      allEvents = type === 'hosted' ? hostedEvents : attendingEvents;
      
      if (type === 'hosted') {
        const hostedQuery: any = { host: userId };
        if (status !== 'all') hostedQuery.status = status;
        if (!isOwnProfile) hostedQuery.isPublic = true;
        totalCount = await Hangout.countDocuments(hostedQuery);
      } else {
        totalCount = attendingEvents.length;
      }
    }

    const eventsWithRSVP = await Promise.all(
      allEvents.map(async (event) => {
        const isHost = event.host._id.toString() === userId;
        let userRSVP = null;

        if (!isHost && requestingUserId) {
          userRSVP = await RSVP.findOne({ 
            hangout: event._id, 
            user: requestingUserId 
          }, 'status respondedAt');
        }

        return {
          ...event,
          isHost,
          userRSVP: userRSVP ? {
            status: userRSVP.status,
            respondedAt: userRSVP.respondedAt
          } : null
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
        email: isOwnProfile ? targetUser.email : undefined
      },
      events: eventsWithRSVP,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        type,
        status
      },
      isOwnProfile
    });

  } catch (error: any) {
    console.error('Get user events error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}