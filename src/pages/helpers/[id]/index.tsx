/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  CircularProgress, 
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { getAllHelpers, Helper } from '@/lib/sheets';

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
  helper: Helper | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Low': return 'success';
    case 'Medium': return 'warning';
    case 'High': return 'error';
    case 'Critical': return 'error';
    default: return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open': return 'error';
    case 'Under Review': return 'warning';
    case 'Resolved': return 'success';
    default: return 'default';
  }
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  const allHelpers = await getAllHelpers();
  const helper = allHelpers.find((h) => h.id === id) || null;

  if (!helper) {
    return { notFound: true };
  }

  return {
    props: { helper },
  };
};

export default function HelperProfile({ helper }: Props) {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; incidentId: string | null }>({
    open: false,
    incidentId: null,
  });

  const fetchIncidents = async () => {
    if (!helper) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents?helperId=${helper.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIncidents(data);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [helper]);

  const handleAddIncident = () => {
    router.push(`/incidents/add?helperId=${helper?.id}`);
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      await fetch(`/api/incidents/${incidentId}`, { method: 'DELETE' });
      toast.success('Incident deleted successfully!');
      setIncidents(prev => prev.filter(i => i.id !== incidentId));
    } catch (err) {
      console.log('Error deleting incident: ', err);
      toast.error('Failed to delete incident');
    }
    setDeleteDialog({ open: false, incidentId: null });
  };

  if (router.isFallback) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Helper Basic Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{helper?.name}</Typography>
          <Button variant="contained" onClick={() => router.push(`/helpers/${helper?.id}/edit?returnTo=/helpers/${helper?.id}`)}>
            Edit Profile
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid>
            <Typography variant="subtitle1"><strong>Current Employer:</strong> {helper?.currentEmployer}</Typography>
            <Typography variant="subtitle1"><strong>Total Employers:</strong> {helper?.totalEmployers}</Typography>
            <Typography variant="subtitle1"><strong>EA Officer:</strong> {helper?.eaOfficer}</Typography>
          </Grid>
          <Grid>
            <Typography variant="subtitle1"><strong>Outstanding Loan:</strong> ${Number(helper?.outstandingLoan || 0).toLocaleString()}</Typography>
            <Typography variant="subtitle1"><strong>Latest Issue:</strong> {helper?.problem}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Incidents Section */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Incident History</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddIncident}
          >
            Add Incident
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : incidents.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No incidents recorded
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              This helper has a clean record with no reported incidents.
            </Typography>
            <Button variant="outlined" onClick={handleAddIncident}>
              Report First Incident
            </Button>
          </Box>
        ) : (
          <Box>
            {incidents.map((incident) => (
              <Card key={incident.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="flex-start" mb={1}>
                    <Box flex={1}>
                      <Box display="flex" gap={1} mb={1}>
                        <Chip 
                          label={incident.severity} 
                          color={getSeverityColor(incident.severity) as any}
                          size="small" 
                        />
                        <Chip 
                          label={incident.status} 
                          color={getStatusColor(incident.status) as any}
                          size="small" 
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {new Date(incident.incidentDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => setDeleteDialog({ open: true, incidentId: incident.id })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body1" mb={2}>
                    {incident.description}
                  </Typography>

                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Reported by: <strong>{incident.reportedBy}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {incident.resolution && (
                    <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Resolution:</strong>
                      </Typography>
                      <Typography variant="body2">
                        {incident.resolution}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, incidentId: null })}>
        <DialogTitle>Delete Incident</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this incident? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, incidentId: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => deleteDialog.incidentId && handleDeleteIncident(deleteDialog.incidentId)} 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}