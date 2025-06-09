import React from 'react';
import { Paper, Divider, Grid, Box, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Helper } from '@/lib/sheets';
import { TransferStatusDisplay } from './TransferStatusDisplay';
import { TransferStatus } from '@/types';

interface Props {
  helper: Helper;
}

export const HelperProfileDetails: React.FC<Props> = ({ helper }) => (
  <Paper sx={{ p: 4, mb: 3 }} elevation={2}>
    <Typography variant="h6" gutterBottom fontWeight={600}>
      Helper Details
    </Typography>
    <Divider sx={{ mb: 3 }} />
    
    <Grid container spacing={4}>
      {/* Personal & Agency Information */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom 
            sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
            Personal & Agency Information
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <strong>EA Officer:</strong> {helper.eaOfficer}
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BusinessIcon fontSize="small" color="action" />
              <strong>PT / Agency:</strong> {helper.pt || 'Not specified'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <SwapHorizIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  <strong>Transfer Status:</strong>
                </Typography>
                <TransferStatusDisplay status={(helper.transferStatus || 'New') as TransferStatus} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
      
      {/* Employment Information */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom
            sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
            Employment Information
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
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WorkIcon fontSize="small" color="action" />
              <strong>Employment Start:</strong> {new Date(helper.employmentStartDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Financial & Status Information */}
      <Grid size={{ xs: 12 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom
            sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
            Financial & Status Information
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