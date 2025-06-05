/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getIronSession } from 'iron-session';
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
  Alert,
  Breadcrumbs,
  Link,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { getAllHelpers, Helper } from '@/lib/sheets';
import { sessionOptions, SessionUser, canEdit, canDelete, canCreate } from '@/lib/session';

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
  user: SessionUser;
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
  const { req, res } = context;
  const id = context.params?.id as string;
  
  // Check authentication
  const session = await getIronSession<{ user?: SessionUser }>(
    req,
    res,
    sessionOptions
  );
  if (!session.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  
  const allHelpers = await getAllHelpers();
  const helper = allHelpers.find((h) => h.id === id) || null;

  if (!helper) {
    return { notFound: true };
  }

  return {
    props: { helper, user: session.user },
  };
};

export default function HelperProfile({ helper, user }: Props) {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; incidentId: string | null }>({
    open: false,
    incidentId: null,
  });

  // Check user permissions
  const userCanEdit = canEdit(user.role);
  const userCanDelete = canDelete(user.role);
  const userCanCreate = canCreate(user.role);

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
    if (!userCanCreate) {
      toast.error('You need Staff or Admin role to add incidents');
      return;
    }
    router.push(`/incidents/add?helperId=${helper?.id}`);
  };

  const handleEditProfile = () => {
    if (!userCanEdit) {
      toast.error('You need Staff or Admin role to edit profiles');
      return;
    }
    router.push(`/helpers/${helper?.id}/edit?returnTo=/helpers/${helper?.id}`);
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (!userCanDelete) {
      toast.error('You need Staff or Admin role to delete incidents');
      return;
    }
    
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

  const openIncidents = incidents.filter(i => i.status === 'Open');
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved');
  const underReviewIncidents = incidents.filter(i => i.status === 'Under Review');

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
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/helpers" 
          onClick={(e) => { e.preventDefault(); router.push('/helpers'); }}
          sx={{ cursor: 'pointer' }}
        >
          Helpers
        </Link>
        <Typography color="text.primary">{helper?.name}</Typography>
      </Breadcrumbs>

      {/* Helper Basic Info */}
      <Paper sx={{ p: 4, mb: 3 }} elevation={2}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              {helper?.name}
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
                label={`$${Number(helper?.outstandingLoan || 0).toLocaleString()} Outstanding`}
                color={Number(helper?.outstandingLoan || 0) > 0 ? 'error' : 'success'}
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
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            ) : (
              <Tooltip title="Edit (Staff/Admin Only)">
                <span>
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    disabled
                  >
                    Edit Profile
                  </Button>
                </span>
              </Tooltip>
            )}
            
            {userCanCreate ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddIncident}
              >
                Add Incident
              </Button>
            ) : (
              <Tooltip title="Add Incident (Staff/Admin Only)">
                <span>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled
                  >
                    Add Incident
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Employment Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <strong>Current Employer:</strong> {helper?.currentEmployer}
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WorkIcon fontSize="small" color="action" />
                  <strong>Total Employers:</strong> {helper?.totalEmployers}
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <strong>EA Officer:</strong> {helper?.eaOfficer}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Financial & Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoneyIcon fontSize="small" color="action" />
                  <strong>Outstanding Loan:</strong> ${Number(helper?.outstandingLoan || 0).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Latest Issue:</strong> {helper?.problem}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Incident Statistics */}
      {incidents.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid>
            <Card sx={{ bgcolor: '#fff3e0', border: '1px solid #ffcc02' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" color="#e65100" fontWeight={600}>
                  {openIncidents.length}
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
                  {underReviewIncidents.length}
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
                  {resolvedIncidents.length}
                </Typography>
                <Typography variant="body2" color="#388e3c">
                  Resolved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Incidents Section */}
      <Paper sx={{ p: 4 }} elevation={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Incident History
          </Typography>
          {incidents.length > 0 && userCanCreate && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddIncident}
            >
              Add Incident
            </Button>
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
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
              <Button variant="contained" onClick={handleAddIncident}>
                Report First Incident
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No incidents to display.
              </Typography>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {incidents.map((incident) => (
              <Grid key={incident.id}>
                <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1}>
                        <Box display="flex" gap={1} mb={2} flexWrap="wrap" alignItems="center">
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
                          <Chip 
                            label={new Date(incident.incidentDate).toLocaleDateString()}
                            variant="outlined"
                            size="small"
                          />
                          {userCanDelete ? (
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, incidentId: incident.id })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <Tooltip title="Delete (Staff/Admin Only)">
                              <span>
                                <IconButton size="small" disabled>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {incident.description}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ color: 'text.secondary' }}>
                      <Typography variant="body2">
                        Reported by: <strong>{incident.reportedBy}</strong>
                      </Typography>
                      <Typography variant="body2">
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
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      {userCanDelete && (
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
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
          </Dialog>
      )}
    </DashboardLayout>
  );
}