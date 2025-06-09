import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SessionUser } from '@/lib/session';

interface IncidentsHeaderProps {
  user: SessionUser;
  userCanCreate: boolean;
  onAddIncident: () => void;
  addingIncident: boolean;
}

export const IncidentsHeader: React.FC<IncidentsHeaderProps> = ({
  user,
  userCanCreate,
  onAddIncident,
  addingIncident,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Incident Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage all helper incidents
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Logged in as <strong>{user.username}</strong> ({user.role})
          </Typography>
        </Box>
        {userCanCreate && (
          <Button 
            variant="contained" 
            startIcon={addingIncident ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            onClick={onAddIncident}
            size="large"
            disabled={addingIncident}
          >
            {addingIncident ? 'Loading...' : 'Add Incident'}
          </Button>
        )}
      </Box>
    </Box>
  );
};