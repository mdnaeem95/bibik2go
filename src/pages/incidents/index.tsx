/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser, canCreate, canEdit, canDelete } from '@/lib/session';
import { getAllHelpers } from '@/lib/sheets';

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

interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
}

interface Props {
  user: SessionUser;
  helpers: Helper[];
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

// Loading skeleton component for incident cards
const IncidentCardSkeleton = () => (
  <Card sx={{ height: 380 }}> {/* Match the fixed height */}
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" gap={1} mb={2}>
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={72} sx={{ mb: 2 }} /> {/* Match description height */}
      <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 2 }} />
      <Box display="flex" justifyContent="space-between">
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="30%" height={16} />
      </Box>
    </CardContent>
  </Card>
);

const IncidentsPage: NextPage<Props> = ({ user, helpers }) => {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingHelperFromIncidentId, setViewingHelperFromIncidentId] = useState<string | null>(null);
  const [viewingIncidentId, setViewingIncidentId] = useState<string | null>(null);

  // Check user permissions
  const userCanCreate = canCreate(user.role);
  const userCanEdit = canEdit(user.role);
  const userCanDelete = canDelete(user.role);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (Array.isArray(data)) {
        setIncidents(data);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const getHelperName = (helperId: string) => {
    const helper = helpers.find(h => h.id === helperId);
    return helper ? helper.name : 'Unknown Helper';
  };

  const getHelperEmployer = (helperId: string) => {
    const helper = helpers.find(h => h.id === helperId);
    return helper ? helper.currentEmployer : '';
  };

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    const helperName = getHelperName(incident.helperId).toLowerCase();
    const matchesSearch = search === '' || 
      helperName.includes(search.toLowerCase()) ||
      incident.description.toLowerCase().includes(search.toLowerCase()) ||
      incident.reportedBy.toLowerCase().includes(search.toLowerCase());
    
    const matchesSeverity = severityFilter === '' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === '' || incident.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAddIncident = () => {
    if (!userCanCreate) {
      toast.error('You need Staff or Admin role to add incidents');
      return;
    }
    router.push('/incidents/add');
  };

  const handleEditIncident = (incidentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!userCanEdit) {
      toast.error('You need Staff or Admin role to edit incidents');
      return;
    }
    router.push(`/incidents/${incidentId}/edit`);
  };

  const handleDeleteIncident = async (incidentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!userCanDelete) {
      toast.error('You need Staff or Admin role to delete incidents');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this incident?')) return;
    
    setDeletingId(incidentId);
    try {
      await fetch(`/api/incidents/${incidentId}`, { method: 'DELETE' });
      toast.success('Incident deleted successfully!');
      setIncidents(prev => prev.filter(i => i.id !== incidentId));
    } catch (err) {
      console.error('Error deleting incident:', err);
      toast.error('Failed to delete incident');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewHelper = (helperId: string, incidentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setViewingHelperFromIncidentId(incidentId);
    router.push(`/helpers/${helperId}`);
  };

  const handleViewIncident = (incidentId: string) => {
    setViewingIncidentId(incidentId);
    router.push(`/incidents/${incidentId}`);
  };

  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = search !== '' || severityFilter !== '' || statusFilter !== '';

  return (
    <DashboardLayout>
      {/* Header */}
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
              startIcon={<AddIcon />}
              onClick={handleAddIncident}
              size="large"
            >
              Add Incident
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterListIcon color="action" />
          <Typography variant="h6">Filters</Typography>
          {hasActiveFilters && (
            <Button size="small" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </Box>
        
        <Grid container spacing={2}>
          <Grid>
            <TextField
              label="Search incidents..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              placeholder="Helper name, description, or reporter..."
              disabled={loading}
            />
          </Grid>

          <Grid>
            <FormControl size="small" sx={{ width: 110 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                label="Severity"
                onChange={(e) => setSeverityFilter(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">All Severities</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid>
            <FormControl size="small" sx={{ width: 110 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      {!loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredIncidents.length}</strong> of <strong>{incidents.length}</strong> incidents
            {hasActiveFilters && (
              <Chip 
                label="Filtered" 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
                onDelete={clearFilters}
              />
            )}
          </Typography>
        </Box>
      )}

      {/* Content */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid key={index}>
              <IncidentCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredIncidents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }} elevation={1}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {incidents.length === 0 ? 'No incidents found' : 'No incidents match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {incidents.length === 0 
              ? (userCanCreate 
                  ? 'Start by adding your first incident report to track helper issues.'
                  : 'No incident reports have been created yet.'
                )
              : 'Try adjusting your search criteria or clearing the filters.'
            }
          </Typography>
          {incidents.length === 0 && userCanCreate ? (
            <Button variant="contained" onClick={handleAddIncident}>
              Add First Incident
            </Button>
          ) : incidents.length > 0 ? (
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters
            </Button>
          ) : null}
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 3
        }}>
          {filteredIncidents.map((incident) => (
            <Card 
              key={incident.id}
              sx={{ 
                height: 380, // Fixed height for all cards
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => handleViewIncident(incident.id)}
            >
              <CardContent sx={{ 
                flex: 1, 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%'
              }}>
                {/* Header with chips and actions */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" gap={1} flexWrap="wrap">
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
                  <Box display="flex" gap={0.5}>
                    {/* View Helper */}
                    <Tooltip title="View Helper Profile">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleViewHelper(incident.helperId, incident.id, e)}
                        disabled={viewingHelperFromIncidentId === incident.id}
                      >
                        {viewingHelperFromIncidentId === incident.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <PersonIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    
                    {/* Edit - only show if user can edit */}
                    {userCanEdit ? (
                      <Tooltip title="Edit Incident">
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleEditIncident(incident.id, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Edit (Staff/Admin Only)">
                        <span>
                          <IconButton size="small" disabled>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    
                    {/* Delete - only show if user can delete */}
                    {userCanDelete ? (
                      <Tooltip title="Delete Incident">
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleDeleteIncident(incident.id, e)}
                          disabled={deletingId === incident.id}
                        >
                          {deletingId === incident.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Delete (Staff/Admin Only)">
                        <span>
                          <IconButton size="small" disabled>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    
                    {/* View - always available */}
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewIncident(incident.id)}
                        disabled={viewingIncidentId === incident.id}
                      >
                        {viewingIncidentId === incident.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Helper Info */}
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getHelperName(incident.helperId)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Employer: {getHelperEmployer(incident.helperId)}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Incident Details */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Date:</strong> {new Date(incident.incidentDate).toLocaleDateString()}
                </Typography>

                {/* Description with fixed height */}
                <Box sx={{ 
                  height: '100px', // Fixed height for description
                  overflow: 'hidden',
                  mb: 2
                }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      display: '-webkit-box', 
                      '-webkit-line-clamp': 4, 
                      '-webkit-box-orient': 'vertical', 
                      overflow: 'hidden',
                      lineHeight: 1.5,
                    }}
                  >
                    {incident.description}
                  </Typography>
                </Box>

                {/* Footer - push to bottom */}
                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '120px'
                      }}
                    >
                      <strong>Reporter:</strong> {incident.reportedBy}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{ user?: SessionUser }>(
    req,
    res,
    sessionOptions
  );
  if (!session.user) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  try {
    const helpersData = await getAllHelpers();
    const helpers = helpersData.map(h => ({
      id: h.id,
      name: h.name,
      currentEmployer: h.currentEmployer,
    }));

    return { 
      props: { 
        user: session.user,
        helpers,
      } 
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { 
      props: { 
        user: session.user,
        helpers: [],
      } 
    };
  }
};

export default IncidentsPage;