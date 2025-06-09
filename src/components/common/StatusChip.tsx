import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { IncidentSeverity, IncidentStatus } from '@/types';

interface StatusChipProps {
  type: 'severity' | 'status' | 'loan';
  value: string;
  size?: ChipProps['size'];
}

const severityConfig: Record<IncidentSeverity, ChipProps> = {
  Low: { color: 'success' },
  Medium: { color: 'warning' },
  High: { color: 'error' },
  Critical: { color: 'error' },
};

const statusConfig: Record<IncidentStatus, ChipProps> = {
  Open: { color: 'error' },
  'Under Review': { color: 'warning' },
  Resolved: { color: 'success' },
};

export const StatusChip: React.FC<StatusChipProps> = ({ type, value, size = 'small' }) => {
  const config = type === 'severity' 
    ? severityConfig[value as IncidentSeverity]
    : statusConfig[value as IncidentStatus];

  return <Chip label={value} size={size} {...config} />;
};