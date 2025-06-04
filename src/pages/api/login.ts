import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcrypt';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getUserByUsername } from '@/lib/users';

export default async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  const { username, password } = req.body;

  // Get user from database
  const user = await getUserByUsername(username);
  
  if (!user) {
    return res.status(404).json({ message: 'Username not found' });
  }

  if (user.status !== 'active') {
    return res.status(401).json({ message: 'Account is inactive' });
  }

  if (!(await bcrypt.compare(password, user.hashedPassword))) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  // Set the user in session
  session.user = { 
    isLoggedIn: true, 
    username: user.username,
    role: user.role,
    email: user.email 
  };
  
  await session.save();
  return res.status(200).json({ message: 'Logged in' });
}