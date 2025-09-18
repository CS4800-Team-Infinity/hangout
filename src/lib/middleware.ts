import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, getTokenFromRequest } from './auth';
import User from '../models/User';
import connect from './connect';

// extend NextApiRequest to include user information
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
}

// authenticate jwt tokens
export const authenticate = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next?: () => void
) => {
  try {
    // token from request
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'access token required'
      });
    }

    const decoded = verifyToken(token);

    await connect();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'user not found or inactive'
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email!,
      name: user.name
    };

    if (next) {
      next();
    }

  } catch (error) {
    console.error('authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'invalid or expired token'
    });
  }
};

// check if user has required role
export const requireRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'authentication required'
      });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'insufficient permissions'
      });
    }

    next();
  };
};

// function to protect API routes
export const withAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // first authenticate the user
    await authenticate(req, res, () => {
      // if authentication succeeds => run the handler
      handler(req, res);
    });
  };
};