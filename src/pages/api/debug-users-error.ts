// src/pages/api/debug-users-error.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers } from '@/lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('1. Starting getAllUsers...');
    const users = await getAllUsers();
    console.log('2. Users retrieved:', users);
    console.log('3. Users type:', typeof users);
    console.log('4. Is array:', Array.isArray(users));
    
    return res.status(200).json({
      success: true,
      users,
      count: users.length,
      type: typeof users,
      isArray: Array.isArray(users)
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}