import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../../lib/connect';
import User from '../../../models/User';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'method not allowed' 
    });
  }

  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'admin access required'
      });
    }

    await connect();
    
    const users = await User.find({})
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        passwordHash: user.password,
        friends: user.friends,
        profilePicture: user.profilePicture,
        bio: user.bio,
        guestId: user.guestId,
        tempEmail: user.tempEmail,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        isActive: user.isActive
      }))
    });

  } catch (error) {
    console.error('error fetching admin users:', error);
    return res.status(500).json({
      success: false,
      error: 'failed to fetch users'
    });
  }
}

export default withAuth(handler);