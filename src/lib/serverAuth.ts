
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetServerSidePropsContext } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser, isSessionExpired, updateLastActivity } from './session';
import { validateSession } from './sessionMiddleware';

export interface AuthResult {
  user: SessionUser | null;
  redirect?: {
    destination: string;
    permanent: boolean;
  };
}

export async function getAuthenticatedUser(
  context: GetServerSidePropsContext
): Promise<AuthResult> {
  const session = await getIronSession<{ user?: SessionUser }>(
    context.req,
    context.res,
    sessionOptions
  );

  // No user in session
  if (!session.user) {
    return {
      user: null,
      redirect: { destination: '/login', permanent: false },
    };
  }

  // Check if session has expired
  if (isSessionExpired(session.user)) {
    // Session expired, destroy it
    session.destroy();
    return {
      user: null,
      redirect: { destination: '/login?expired=true', permanent: false },
    };
  }

  // Update last activity and save session
  session.user = updateLastActivity(session.user);
  await session.save();

  return {
    user: session.user,
  };
}

// Utility to create authenticated API handlers
export function withAuth<T = any>(
  handler: (req: any, res: any, user: SessionUser) => Promise<T>
) {
  return async (req: any, res: any) => {
    const sessionResult = await validateSession(req, res);
    
    if (!sessionResult.valid) {
      return res.status(401).json({ 
        error: sessionResult.expired 
          ? 'Session expired due to inactivity' 
          : 'Authentication required',
        code: sessionResult.expired ? 'SESSION_EXPIRED' : 'AUTH_REQUIRED',
      });
    }

    return handler(req, res, sessionResult.user!);
  };
}