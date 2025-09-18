import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import connect from '../../../lib/connect';
import User from '../../../models/User';

interface MeResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    profilePicture?: string;
    bio?: string;
    createdAt: Date;
    lastActive: Date;
  };
  error?: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<MeResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'method not allowed'
    });
  }

  try {
    await connect();

    // get full user details
    const user = await User.findById(req.user!.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'user not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email!,
        username: user.username!,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      }
    });

  } catch (error) {
    console.error('get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

export default withAuth(handler);