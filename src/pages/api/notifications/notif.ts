import type { NextApiRequest, NextApiResponse } from 'next';
// Just a place holder this will be expanded on for notifications
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Placeholder for notifications and me showing I can do task 3 in 3A' });
}
