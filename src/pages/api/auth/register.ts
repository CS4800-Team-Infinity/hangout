import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../../lib/connect';
import User from '../../../models/User';
import { generateToken, validateEmail, validatePassword } from '../../../lib/auth';

interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

interface RegisterResponse {
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
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'method not allowed'
    });
  }

  try {
    await connect();

    const { name, email, username, password }: RegisterRequest = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'all fields are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'invalid email format'
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.message
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        error: `user with this ${field} already exists`
      });
    }

    const user = new User({
      name,
      email,
      username,
      password,
      role: 'user'
    });

    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    return res.status(201).json({
      success: true,
      message: 'user registered successfully',
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
    console.error('registration error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'internal server error'
    });
  }
}