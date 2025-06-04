// src/lib/session.ts (CORRECTED)
import type { SessionOptions } from 'iron-session';

export type SessionUser = {
  isLoggedIn: true;
  username: string;
  role: 'admin' | 'staff' | 'viewer';
  email: string;
};

// This extends iron-session to include our custom user property
declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser;
  }
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'helper-tracker-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};