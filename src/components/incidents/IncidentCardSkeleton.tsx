import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

export const IncidentCardSkeleton: React.FC = () => (
  <Card sx={{ height: 380 }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" gap={1} mb={2}>
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={72} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
      <Box display="flex" justifyContent="space-between">
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="30%" height={16} />
      </Box>
    </CardContent>
  </Card>
);