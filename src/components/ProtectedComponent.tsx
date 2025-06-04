import React from 'react';
import { Alert, Paper } from '@mui/material';
import { hasPermission, UserRole } from '@/lib/auth';

interface ProtectedComponentProps {
  userRole: UserRole;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  userRole,
  requiredRole,
  allowedRoles,
  children,
  fallback
}) => {
  const hasAccess = () => {
    if (requiredRole && !hasPermission(userRole, requiredRole)) {
      return false;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return false;
    }
    return true;
  };

  if (!hasAccess()) {
    return fallback || (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          You don&apos;t have permission to access this content.
        </Alert>
      </Paper>
    );
  }

  return <>{children}</>;
};

// Usage example in a component:
/*
<ProtectedComponent userRole={user.role} requiredRole="staff">
  <Button onClick={handleEdit}>Edit Helper</Button>
</ProtectedComponent>
*/