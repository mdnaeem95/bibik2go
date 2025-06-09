// src/components/common/LoadingState.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  fullHeight = true 
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: fullHeight ? 0 : 8,
      minHeight: fullHeight ? '50vh' : 'auto',
    }}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
);

// src/components/common/ActionButton.tsx
