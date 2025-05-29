// src/pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export default async function logoutRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();
  res.status(200).json({ message: 'Logged out' });
}
