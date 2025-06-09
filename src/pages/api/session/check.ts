import type { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '@/lib/sessionMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const result = await validateSession(req, res);
  
  if (!result.valid) {
    return res.status(401).json({ 
      valid: false, 
      expired: result.expired || false 
    });
  }

  return res.status(200).json({
    valid: true,
    user: {
      username: result.user?.username,
      lastActivity: result.user?.lastActivity,
      sessionTimeout: result.user?.sessionTimeout,
    },
  });
}