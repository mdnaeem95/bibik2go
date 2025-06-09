import { UserRole } from '@/types';
import { canView, canCreate, canEdit, canDelete, canManageUsers } from '@/lib/session';

export function usePermissions(userRole: UserRole) {
  return {
    canView: canView(userRole),
    canCreate: canCreate(userRole),
    canEdit: canEdit(userRole),
    canDelete: canDelete(userRole),
    canManageUsers: canManageUsers(userRole),
  };
}