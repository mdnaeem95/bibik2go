import React from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';

interface EmptyStateProps {
  icon?: React.ReactElement;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <Paper sx={{ p: 6, textAlign: 'center' }} elevation={1}>
    {icon && (
      <Box 
        sx={{ 
          mb: 2, 
          color: 'text.secondary',
          '& > *': { fontSize: 48 }
        }}
      >
        {icon}
      </Box>
    )}
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
    )}
    {action && (
      <Button 
        variant="contained" 
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        startIcon={action.loading ? <CircularProgress size={20} color="inherit" /> : undefined}
      >
        {action.loading ? 'Loading...' : action.label}
      </Button>
    )}
  </Paper>
);