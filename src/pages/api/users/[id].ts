import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
import { updateUserStatus, updateUserRole, deleteUser, getUserByUsername } from '@/lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  if (!session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query as { id: string };

  try {
    // Only admins can manage users
    const currentUser = await getUserByUsername(session.user.username);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'PUT') {
      const { status, role } = req.body;
      
      if (status) {
        await updateUserStatus(id, status);
      }
      if (role) {
        await updateUserRole(id, role);
      }
      
      return res.status(200).json({ message: 'User updated' });
    }

    if (req.method === 'DELETE') {
      await deleteUser(id);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}