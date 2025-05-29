// src/pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcrypt';
import { sessionOptions, SessionUser } from '@/lib/session';

const ADMIN_USER = 'admin';
// paste your full bcrypt hash here (including all $ characters)
const ADMIN_HASH = '$2b$10$1Z3MThBzrcPUfxfTaANFEeEUH0/9Z8eIwhbGGHDSyCk1pGhgEMnDe';

export default async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: SessionUser }>(
    req, res, sessionOptions
  );

  const { username, password } = req.body;

  if (username !== ADMIN_USER) {
    return res.status(404).json({ message: 'Username not found' });
  }
  if (!(await bcrypt.compare(password, ADMIN_HASH))) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  session.user = { isLoggedIn: true, username };
  await session.save();
  return res.status(200).json({ message: 'Logged in' });
}
