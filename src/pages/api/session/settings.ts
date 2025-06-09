import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);

  if (!session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // Return current session settings
    return res.status(200).json({
      sessionTimeout: session.user.sessionTimeout || 24,
      lastActivity: session.user.lastActivity,
    });
  }

  if (req.method === 'PUT') {
    const { sessionTimeout } = req.body;

    // Validate session timeout (1 hour to 1 week)
    if (!sessionTimeout || sessionTimeout < 1 || sessionTimeout > 168) {
      return res.status(400).json({ 
        error: 'Session timeout must be between 1 and 168 hours' 
      });
    }

    // Update session with new timeout
    session.user.sessionTimeout = sessionTimeout;
    await session.save();

    return res.status(200).json({ 
      message: 'Session timeout updated successfully',
      sessionTimeout 
    });
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}