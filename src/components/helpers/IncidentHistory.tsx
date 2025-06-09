import React from 'react';
import { Paper, Box, Typography, Button, Alert, Grid, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { IncidentCard } from './IncidentCard';
import { LoadingState } from '@/components/common/LoadingState';
import { SessionUser, canCreate } from '@/lib/session';

interface Incident {
  id: string;
  helperId: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution?: string;
  createdAt: string;
}

interface Props {
  incidents: Incident[];
  loading: boolean;
  user: SessionUser;
  onAddIncident: () => void;
  onDeleteIncident: (id: string) => void;
  navigationLoading: {
    addIncident: boolean;
  };
}

export const IncidentHistory: React.FC<Props> = ({
  incidents,
  loading,
  user,
  onAddIncident,
  onDeleteIncident,
  navigationLoading,
}) => {
  const userCanCreate = canCreate(user.role);

  return (
    <Paper sx={{ p: 4 }} elevation={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Incident History
        </Typography>
        {incidents.length > 0 && userCanCreate && (
          <Button
            variant="outlined"
            startIcon={navigationLoading.addIncident ? <CircularProgress size={20} /> : <AddIcon />}
            onClick={onAddIncident}
            disabled={navigationLoading.addIncident}
          >
            {navigationLoading.addIncident ? 'Loading...' : 'Add Incident'}
          </Button>
        )}
      </Box>

      {loading ? (
        <LoadingState message="Loading incidents..." fullHeight={false} />
      ) : incidents.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              No incidents recorded
            </Typography>
            <Typography variant="body2">
              This helper has a clean record with no reported incidents.
            </Typography>
          </Alert>
          {userCanCreate ? (
            <Button 
              variant="contained" 
              onClick={onAddIncident}
              startIcon={navigationLoading.addIncident ? <CircularProgress size={20} /> : undefined}
              disabled={navigationLoading.addIncident}
            >
              {navigationLoading.addIncident ? 'Loading...' : 'Report First Incident'}
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No incidents to display.
            </Typography>
          )}
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click on any incident card to view full details
          </Typography>
          <Grid container spacing={3}>
            {incidents.map((incident) => (
              <Grid key={incident.id}>
                <IncidentCard
                  incident={incident}
                  user={user}
                  onDelete={() => onDeleteIncident(incident.id)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Paper>
  );
};