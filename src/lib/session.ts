// src/lib/session.ts
import type { SessionOptions } from 'iron-session';

export type SessionUser = {
  isLoggedIn: true;
  username: string;
};

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
