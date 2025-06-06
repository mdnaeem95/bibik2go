/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if SESSION_PASSWORD exists
    if (!process.env.SESSION_PASSWORD) {
      return res.status(500).json({ 
        error: 'SESSION_PASSWORD not found',
        step: 'environment_check'
      });
    }

    // Check if SESSION_PASSWORD is long enough
    if (process.env.SESSION_PASSWORD.length < 32) {
      return res.status(500).json({ 
        error: 'SESSION_PASSWORD too short (minimum 32 characters)',
        length: process.env.SESSION_PASSWORD.length,
        step: 'password_length_check'
      });
    }

    // Test session creation
    try {
      const session = await getIronSession(req, res, sessionOptions);
      return res.status(200).json({ 
        success: true,
        message: 'Session creation successful',
        sessionOptions: {
          cookieName: sessionOptions.cookieName,
          hasPassword: !!sessionOptions.password,
          passwordLength: sessionOptions.password?.length
        }
      });
    } catch (sessionError) {
      return res.status(500).json({ 
        error: 'Session creation failed',
        details: sessionError instanceof Error ? sessionError.message : String(sessionError),
        step: 'session_creation'
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error),
      step: 'general_error'
    });
  }
}