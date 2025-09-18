import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../../lib/connect';
import User from '../../../models/User';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
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

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'user id is required'
      });
    }

    await connect();

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'cannot delete your own account'
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'user not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `user ${deletedUser.name} has been deleted`,
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });

  } catch (error) {
    console.error('error deleting user:', error);
    return res.status(500).json({
      success: false,
      error: 'failed to delete user'
    });
  }
}

export default withAuth(handler);