import React from 'react';
import { Box, Grid } from '@mui/material';
import { Incident } from '@/types';
import { IncidentCard } from './IncidentCard';
import { IncidentCardSkeleton } from './IncidentCardSkeleton';

interface IncidentsGridProps {
  incidents: Incident[];
  loading: boolean;
  getHelperName: (helperId: string) => string;
  getHelperEmployer: (helperId: string) => string;
  onViewHelper: (helperId: string, incidentId: string, e: React.MouseEvent) => void;
  onEdit: (incidentId: string, e: React.MouseEvent) => void;
  onDelete: (incidentId: string, e: React.MouseEvent) => void;
  onView: (incidentId: string) => void;
  userCanEdit: boolean;
  userCanDelete: boolean;
  deletingId: string | null;
  navigationLoading: {
    viewHelper: string;
    viewIncident: string;
    editIncident: string;
  };
}

export const IncidentsGrid: React.FC<IncidentsGridProps> = ({
  incidents,
  loading,
  getHelperName,
  getHelperEmployer,
  onViewHelper,
  onEdit,
  onDelete,
  onView,
  userCanEdit,
  userCanDelete,
  deletingId,
  navigationLoading,
}) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
            <IncidentCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 3
    }}>
      {incidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          helperName={getHelperName(incident.helperId)}
          helperEmployer={getHelperEmployer(incident.helperId)}
          onViewHelper={(e) => onViewHelper(incident.helperId, incident.id, e)}
          onEdit={(e) => onEdit(incident.id, e)}
          onDelete={(e) => onDelete(incident.id, e)}
          onView={() => onView(incident.id)}
          userCanEdit={userCanEdit}
          userCanDelete={userCanDelete}
          isDeleting={deletingId === incident.id}
          navigationLoading={navigationLoading}
        />
      ))}
    </Box>
  );
};