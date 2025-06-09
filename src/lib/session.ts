/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SessionOptions } from 'iron-session';
import type { UserRole, UserStatus } from '@/lib/users';

export type SessionUser = {
  isLoggedIn: true;
  username: string;
  role: UserRole;
  email: string;
  status: UserStatus;
  id: string;
  lastActivity: number; // timestamp
  sessionTimeout: number; // hours
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
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

// Permission helper functions based on your role definitions
export const canView = (role: UserRole): boolean => {
  return true; // All roles can view
};

export const canCreate = (role: UserRole): boolean => {
  return role === 'admin' || role === 'staff';
};

export const canEdit = (role: UserRole): boolean => {
  return role === 'admin' || role === 'staff';
};

export const canDelete = (role: UserRole): boolean => {
  return role === 'admin' || role === 'staff';
};

export const canUploadMedia = (role: UserRole): boolean => {
  return role === 'admin' || role === 'staff';
};

export const canManageUsers = (role: UserRole): boolean => {
  return role === 'admin';
};

export const canAccessSettings = (role: UserRole): boolean => {
  return role === 'admin';
};

// Helper function to check if session is expired
export function isSessionExpired(user: SessionUser): boolean {
  if (!user.lastActivity || !user.sessionTimeout) return false;
  
  const timeoutMs = user.sessionTimeout * 60 * 60 * 1000; // Convert hours to milliseconds
  const timeSinceLastActivity = Date.now() - user.lastActivity;
  
  return timeSinceLastActivity > timeoutMs;
}

// Helper function to update last activity
export function updateLastActivity(user: SessionUser): SessionUser {
  return {
    ...user,
    lastActivity: Date.now(),
  };
}

// Helper function to get default session timeout (24 hours)
export function getDefaultSessionTimeout(): number {
  return 24; // hours
}