import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';

export default async function logoutRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  
  // Log the logout activity (you could store this in a database)
  if (session.user) {
    console.log(`User ${session.user.username} logged out at ${new Date().toISOString()}`);
  }
  
  session.destroy();
  res.status(200).json({ message: 'Logged out successfully' });
}