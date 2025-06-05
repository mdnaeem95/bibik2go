// src/pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcrypt';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getUserByUsername } from '@/lib/users';

export default async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: SessionUser }>(
    req, res, sessionOptions
  );

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Get user from Google Sheets using your existing function
    const user = await getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: 'Username not found' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is deactivated. Please contact administrator.' });
    }

    // Verify password using the hashedPassword from your user system
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Set session using your user structure
    session.user = { 
      isLoggedIn: true, 
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      status: user.status
    };
    
    await session.save();
    
    return res.status(200).json({ 
      message: 'Logged in successfully', 
      role: user.role,
      username: user.username 
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
}