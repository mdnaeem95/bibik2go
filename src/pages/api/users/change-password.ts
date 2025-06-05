/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/api/users/change-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcrypt';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getUserByUsername, updateUser } from '@/lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  
  if (!session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    console.log('🔑 Password change request for:', session.user.username);

    // Get user record
    const userRecord = await getUserByUsername(session.user.username);
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('👤 User found:', userRecord.username);

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userRecord.hashedPassword);
    if (!isValidPassword) {
      console.log('❌ Current password verification failed');
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    console.log('✅ Current password verified');

    // Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔐 New password hashed');

    // Update user record - use the exact field name from your sheets
    await updateUser(session.user.username, { hashedPassword: newHashedPassword } as any);
    console.log('💾 Password updated in sheets');

    // Destroy session to force re-login
    session.destroy();
    console.log('🚪 Session destroyed');

    return res.status(200).json({ message: 'Password updated successfully', logout: true });
  } catch (error) {
    console.error('❌ Change password API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}