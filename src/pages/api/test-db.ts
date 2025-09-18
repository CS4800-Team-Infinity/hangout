import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../lib/connect';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const connection = await connect();
    
    return res.status(200).json({
      success: true,
      message: 'connected to mongodb successfully!',
      database: connection.connection.db?.databaseName,
      connectionState: connection.connection.readyState
    });
  } catch (error) {
    console.error('db connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'failed to connect to mongodb',
      error: error instanceof Error ? error.message : 'unknown error'
    });
  }
}