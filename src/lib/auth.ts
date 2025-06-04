// src/lib/auth.ts (NEW FILE)
import { GetServerSidePropsContext } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getUserByUsername } from '@/lib/users';

export type UserRole = 'admin' | 'staff' | 'viewer';

export interface AuthConfig {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export async function withAuth(
  context: GetServerSidePropsContext,
  config: AuthConfig = {}
) {
  const { req, res } = context;
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);

  // Check if user is logged in
  if (!session.user) {
    return {
      redirect: {
        destination: config.redirectTo || '/login',
        permanent: false,
      },
    };
  }

  // Get full user data with role
  const currentUser = await getUserByUsername(session.user.username);
  if (!currentUser || currentUser.status !== 'active') {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Check role permissions
  if (config.requiredRole && currentUser.role !== config.requiredRole) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  if (config.allowedRoles && !config.allowedRoles.includes(currentUser.role)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    user: {
      ...session.user,
      role: currentUser.role,
    },
  };
}

// Helper functions for role checking
export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = { viewer: 0, staff: 1, admin: 2 };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

export const canEditHelpers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'staff');
};

export const canViewHelpers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'viewer');
};

// Updated example usage in a page:
// src/pages/users/index.tsx (ADD AUTH CHECK)
/*
export const getServerSideProps: GetServerSideProps = async (context) => {
  const authResult = await withAuth(context, { 
    requiredRole: 'admin' 
  });
  
  if ('redirect' in authResult) {
    return authResult;
  }

  return { 
    props: { 
      user: authResult.user 
    } 
  };
};
*/