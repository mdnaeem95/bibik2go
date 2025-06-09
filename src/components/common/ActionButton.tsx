import React from 'react';
import { Button, ButtonProps, Tooltip, CircularProgress } from '@mui/material';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types';

interface ActionButtonProps extends Omit<ButtonProps, 'action'> {
  permission: 'view' | 'create' | 'edit' | 'delete';
  userRole: UserRole;
  tooltip?: string;
  loading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  permission,
  userRole,
  tooltip,
  loading = false,
  children,
  startIcon,
  ...props
}) => {
  const permissions = usePermissions(userRole);
  
  const hasPermission = {
    view: permissions.canView,
    create: permissions.canCreate,
    edit: permissions.canEdit,
    delete: permissions.canDelete,
  }[permission];

  const permissionText = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
  }[permission];

  const button = (
    <Button
      {...props}
      disabled={!hasPermission || loading || props.disabled}
      startIcon={loading ? <CircularProgress size={20} /> : startIcon}
    >
      {loading ? 'Processing...' : children}
    </Button>
  );

  if (!hasPermission && tooltip) {
    return (
      <Tooltip title={`${permissionText} (Staff/Admin Only)`}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  if (tooltip) {
    return <Tooltip title={tooltip}>{button}</Tooltip>;
  }

  return button;
};