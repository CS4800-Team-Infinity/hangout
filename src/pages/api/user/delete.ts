import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connect';
import User from '@/models/User';
import Hangout from '@/models/Hangout';
import RSVP from '@/models/RSVP';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await RSVP.deleteMany({ user: userId });
    await Hangout.deleteMany({ creator: userId });
    await Hangout.updateMany(
      { attendees: userId },
      { $pull: { attendees: userId } }
    );

    await User.findByIdAndDelete(userId);

    res.status(200).json({ 
      success: true, 
      message: 'Account deleted successfully'
    });

  } catch (error: any) {
    console.error('Account deletion error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}