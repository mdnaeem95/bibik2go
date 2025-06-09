// src/components/helpers/LoanStatusChip.tsx
import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { LOAN_THRESHOLDS } from '@/types';

interface LoanStatusChipProps {
  amount: number;
}

export const LoanStatusChip: React.FC<LoanStatusChipProps> = ({ amount }) => {
  if (amount < LOAN_THRESHOLDS.MINIMAL) {
    return <Chip label="Minimal" color="success" size="small" />;
  }
  
  if (amount >= LOAN_THRESHOLDS.URGENT_FOLLOWUP) {
    return (
      <Tooltip title="Urgent follow-up required (≥$3,300)">
        <Chip 
          icon={<WarningIcon />}
          label="Urgent" 
          color="error" 
          size="small" 
        />
      </Tooltip>
    );
  }
  
  if (amount >= LOAN_THRESHOLDS.MEDIUM_VALUE) {
    return (
      <Tooltip title="High value customer ($2,200-$3,299)">
        <Chip 
          icon={<TrendingUpIcon />}
          label="High Value" 
          color="warning" 
          size="small" 
        />
      </Tooltip>
    );
  }
  
  if (amount >= LOAN_THRESHOLDS.LOW_VALUE) {
    return (
      <Tooltip title="Medium value customer ($1,100-$2,199)">
        <Chip 
          icon={<AttachMoneyIcon />}
          label="Medium Value" 
          color="info" 
          size="small" 
        />
      </Tooltip>
    );
  }
  
  if (amount >= LOAN_THRESHOLDS.MINIMAL) {
    return (
      <Tooltip title="Low value customer ($550-$1,099)">
        <Chip 
          label="Low Value" 
          color="default" 
          size="small" 
        />
      </Tooltip>
    );
  }
  
  return <Chip label="Minimal" color="success" size="small" variant="outlined" />;
};