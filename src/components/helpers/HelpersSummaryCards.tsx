// src/components/helpers/HelpersSummaryCards.tsx
import React from 'react';
import { Grid, Paper, Box, Typography, Alert } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { Helper, LOAN_THRESHOLDS } from '@/types';
import { isNewEmployee } from '@/utils/helpers';

interface HelpersSummaryCardsProps {
  helpers: Helper[];
}

interface SummaryCardProps {
  icon: React.ReactElement;
  iconColor: string;
  value: number | string;
  label: string;
  bgColor: string;
  borderColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  iconColor,
  value,
  label,
  bgColor,
  borderColor,
}) => (
  <Paper sx={{ p: 2, bgcolor: bgColor, border: `1px solid ${borderColor}` }}>
    <Box display="flex" alignItems="center" gap={1}>
      <Box sx={{ color: iconColor }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ color: iconColor }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export const HelpersSummaryCards: React.FC<HelpersSummaryCardsProps> = ({ helpers }) => {
  // Calculate statistics
  const totalOutstandingLoans = helpers.reduce((sum, h) => sum + h.outstandingLoan, 0);
  const urgentFollowUps = helpers.filter(h => h.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP).length;
  const highValueCustomers = helpers.filter(h => 
    h.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE && 
    h.outstandingLoan < LOAN_THRESHOLDS.HIGH_VALUE
  ).length;
  const mediumValueCustomers = helpers.filter(h => 
    h.outstandingLoan >= LOAN_THRESHOLDS.LOW_VALUE && 
    h.outstandingLoan < LOAN_THRESHOLDS.MEDIUM_VALUE
  ).length;
  const newEmployees = helpers.filter(h => isNewEmployee(h.employmentStartDate)).length;

  const summaryCards = [
    {
      icon: <AttachMoneyIcon />,
      iconColor: '#0284c7',
      value: `$${totalOutstandingLoans.toLocaleString()}`,
      label: 'Total Outstanding Loans',
      bgColor: '#f0f9ff',
      borderColor: '#0284c7',
    },
    {
      icon: <WarningIcon />,
      iconColor: '#dc2626',
      value: urgentFollowUps,
      label: 'Urgent Follow-ups ($3,300+)',
      bgColor: '#fee2e2',
      borderColor: '#dc2626',
    },
    {
      icon: <TrendingUpIcon />,
      iconColor: '#f59e0b',
      value: highValueCustomers,
      label: 'High Value ($2,200-$3,299)',
      bgColor: '#fef3c7',
      borderColor: '#f59e0b',
    },
    {
      icon: <AttachMoneyIcon />,
      iconColor: '#0284c7',
      value: mediumValueCustomers,
      label: 'Medium Value ($1,100-$2,199)',
      bgColor: '#e0f2fe',
      borderColor: '#0284c7',
    },
    {
      icon: <NewReleasesIcon />,
      iconColor: '#1976d2',
      value: newEmployees,
      label: 'New Employees (< 3 months)',
      bgColor: '#e3f2fd',
      borderColor: '#1976d2',
    },
  ];

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card, index) => (
          <Grid key={index}>
            <SummaryCard {...card} />
          </Grid>
        ))}
      </Grid>

      {urgentFollowUps > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>{urgentFollowUps} helper(s)</strong> have loans ≥ $3,300 and require urgent follow-up for loan management.
          </Typography>
        </Alert>
      )}

      {newEmployees > 0 && (
        <Alert severity="info" icon={<NewReleasesIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>{newEmployees} helper(s)</strong> are new employees (less than 3 months) and may need additional support and monitoring.
          </Typography>
        </Alert>
      )}
    </>
  );
};