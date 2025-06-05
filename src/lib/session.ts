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