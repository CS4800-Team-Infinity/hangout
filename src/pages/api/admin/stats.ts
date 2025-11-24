import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connect';
import User from '@/models/User';
import Hangout from '@/models/Hangout';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = (await User.findById(decoded.userId).lean()) as any;
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });

    const [totalUsers, totalEvents] = await Promise.all([
      User.countDocuments({}),
      Hangout.countDocuments({}),
    ]);

    return res.status(200).json({ success: true, totalUsers, totalEvents });
  } catch (err: any) {
    console.error('admin/stats error', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
