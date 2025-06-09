import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

interface Props {
  stats: {
    open: number;
    underReview: number;
    resolved: number;
  };
}

export const IncidentStatistics: React.FC<Props> = ({ stats }) => (
  <Grid container spacing={2} sx={{ mb: 3 }}>
    <Grid>
      <Card sx={{ bgcolor: '#fff3e0', border: '1px solid #ffcc02' }}>
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h3" color="#e65100" fontWeight={600}>
            {stats.open}
          </Typography>
          <Typography variant="body2" color="#e65100">
            Open Issues
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid>
      <Card sx={{ bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h3" color="#1976d2" fontWeight={600}>
            {stats.underReview}
          </Typography>
          <Typography variant="body2" color="#1976d2">
            Under Review
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid>
      <Card sx={{ bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h3" color="#388e3c" fontWeight={600}>
            {stats.resolved}
          </Typography>
          <Typography variant="body2" color="#388e3c">
            Resolved
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);