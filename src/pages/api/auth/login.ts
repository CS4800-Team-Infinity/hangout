import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../../lib/connect';
import User from '../../../models/User';
import { generateToken, validateEmail } from '../../../lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  };
  token?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'method not allowed'
    });
  }

  try {
    await connect();

    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'email and password are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'invalid email format'
      });
    }

    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'invalid email or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'invalid email or password'
      });
    }

    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    return res.status(200).json({
      success: true,
      message: 'login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email!,
        username: user.username!,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('login error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'internal server error'
    });
  }
}