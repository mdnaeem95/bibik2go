// src/pages/api/user/profile.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getUserByUsername, updateUser } from '@/lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  
  if (!session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const userRecord = await getUserByUsername(session.user.username);
      if (!userRecord) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profile = {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        role: userRecord.role,
        status: userRecord.status,
        createdAt: userRecord.createdAt,
        createdBy: userRecord.createdBy,
      };
      
      return res.status(200).json(profile);
    }

    if (req.method === 'PUT') {
      const { email } = req.body;
      
      await updateUser(session.user.username, { email });
      return res.status(200).json({ message: 'Profile updated' });
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('User profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}