import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllUsers, createUser, NewUser, getUserByUsername } from '@/lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  
  if (!session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const users = await getAllUsers();
      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      // Only admins can create users
      const currentUser = await getUserByUsername(session.user.username);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const userData: NewUser = {
        ...req.body,
        createdBy: session.user.username,
      };
      
      const newUser = await createUser(userData);
      return res.status(201).json(newUser);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}