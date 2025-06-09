import React from 'react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteIncidentDialog: React.FC<Props> = ({ open, onClose, onConfirm }) => (
  <ConfirmDialog
    open={open}
    title="Delete Incident"
    message="Are you sure you want to delete this incident? This action cannot be undone."
    confirmLabel="Delete"
    confirmColor="error"
    onConfirm={onConfirm}
    onCancel={onClose}
  />
);