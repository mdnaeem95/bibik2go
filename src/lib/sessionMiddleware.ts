// src/lib/sessionMiddleware.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser, isSessionExpired, updateLastActivity } from './session';

export async function validateSession(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  
  if (!session.user) {
    return { valid: false, user: null };
  }

  // Check if session has expired due to inactivity
  if (isSessionExpired(session.user)) {
    // Session expired, destroy it
    session.destroy();
    return { valid: false, user: null, expired: true };
  }

  // Update last activity timestamp
  session.user = updateLastActivity(session.user);
  await session.save();

  return { valid: true, user: session.user };
}

// Wrapper for pages that require authentication
export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const result = await validateSession(req, res);
  
  if (!result.valid) {
    if (result.expired) {
      return res.status(401).json({ 
        error: 'Session expired due to inactivity',
        code: 'SESSION_EXPIRED'
      });
    }
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  return result.user;
}