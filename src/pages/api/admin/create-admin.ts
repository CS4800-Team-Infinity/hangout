import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../../lib/connect';
import User from '../../../models/User';
import { generateToken } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  try {
    await connect();

    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({ error: 'all fields required' });
    }

    const existingAdmin = await User.findOne({ 
      $or: [{ email }, { username }, { role: 'admin' }] 
    });

    if (existingAdmin) {
      return res.status(409).json({ error: 'admin user already exists or email/username taken' });
    }

    const admin = new User({
      name,
      email,
      username,
      password,
      role: 'admin'
    });

    await admin.save();

    const token = generateToken(admin._id.toString(), admin.role);

    return res.status(201).json({
      success: true,
      message: 'admin user created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role
      },
      token
    });

  } catch (error) {
    console.error('error creating admin:', error);
    return res.status(500).json({ error: 'failed to create admin user' });
  }
}