import React from 'react';
import { Paper, Divider, Grid, Box, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Helper } from '@/lib/sheets';

interface Props {
  helper: Helper;
}

export const HelperProfileDetails: React.FC<Props> = ({ helper }) => (
  <Paper sx={{ p: 4, mb: 3 }} elevation={2}>
    <Divider sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      <Grid>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom 
            sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
            Employment Details
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BusinessIcon fontSize="small" color="action" />
              <strong>Current Employer:</strong> {helper.currentEmployer}
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WorkIcon fontSize="small" color="action" />
              <strong>Total Employers:</strong> {helper.totalEmployers}
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <strong>EA Officer:</strong> {helper.eaOfficer}
            </Typography>
          </Box>
        </Box>
      </Grid>
      
      <Grid>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom
            sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
            Financial & Status
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AttachMoneyIcon fontSize="small" color="action" />
              <strong>Outstanding Loan:</strong> ${Number(helper.outstandingLoan || 0).toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Latest Issue:</strong> {helper.problem}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Paper>
);