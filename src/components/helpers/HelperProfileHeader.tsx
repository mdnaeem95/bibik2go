import React from 'react';
import { Box, Typography, Paper, Chip, Button, Tooltip, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Helper } from '@/lib/sheets';
import { SessionUser, canEdit, canCreate } from '@/lib/session';
import { Incident } from '@/types';

interface Props {
  helper: Helper;
  user: SessionUser;
  incidents: Incident[];
  onEditProfile: () => void;
  onAddIncident: () => void;
  navigationLoading: {
    editProfile: boolean;
    addIncident: boolean;
  };
}

export const HelperProfileHeader: React.FC<Props> = ({
  helper,
  user,
  incidents,
  onEditProfile,
  onAddIncident,
  navigationLoading,
}) => {
  const userCanEdit = canEdit(user.role);
  const userCanCreate = canCreate(user.role);

  return (
    <Paper sx={{ p: 4, mb: 3 }} elevation={2}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            {helper.name}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
            <Chip 
              icon={<WorkIcon />}
              label={`${incidents.length} Incidents`}
              color={incidents.length > 0 ? 'warning' : 'success'}
              variant="outlined"
            />
            <Chip 
              icon={<AttachMoneyIcon />}
              label={`$${Number(helper.outstandingLoan || 0).toLocaleString()} Outstanding`}
              color={Number(helper.outstandingLoan || 0) > 0 ? 'error' : 'success'}
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Viewing as <strong>{user.username}</strong> ({user.role})
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          {userCanEdit ? (
            <Button 
              variant="outlined" 
              startIcon={navigationLoading.editProfile ? <CircularProgress size={20} /> : <EditIcon />}
              onClick={onEditProfile}
              disabled={navigationLoading.editProfile}
            >
              {navigationLoading.editProfile ? 'Loading...' : 'Edit Profile'}
            </Button>
          ) : (
            <Tooltip title="Edit (Staff/Admin Only)">
              <span>
                <Button variant="outlined" startIcon={<EditIcon />} disabled>
                  Edit Profile
                </Button>
              </span>
            </Tooltip>
          )}
          
          {userCanCreate ? (
            <Button
              variant="contained"
              startIcon={navigationLoading.addIncident ? <CircularProgress size={20} /> : <AddIcon />}
              onClick={onAddIncident}
              disabled={navigationLoading.addIncident}
            >
              {navigationLoading.addIncident ? 'Loading...' : 'Add Incident'}
            </Button>
          ) : (
            <Tooltip title="Add Incident (Staff/Admin Only)">
              <span>
                <Button variant="contained" startIcon={<AddIcon />} disabled>
                  Add Incident
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  );
};