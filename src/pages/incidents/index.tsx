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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser } from '@/lib/session';
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

const IncidentsPage: NextPage<Props> = ({ helpers }) => {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

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
    router.push('/incidents/add');
  };

  const handleViewHelper = (helperId: string) => {
    router.push(`/helpers/${helperId}`);
  };

  const handleViewIncident = (incidentId: string) => {
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
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddIncident}
            size="large"
          >
            Add Incident
          </Button>
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
            />
          </Grid>

          <Grid>
            <FormControl size="small" sx={{ width: 110 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                label="Severity"
                onChange={(e) => setSeverityFilter(e.target.value)}
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

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : filteredIncidents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }} elevation={1}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {incidents.length === 0 ? 'No incidents found' : 'No incidents match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {incidents.length === 0 
              ? 'Start by adding your first incident report to track helper issues.'
              : 'Try adjusting your search criteria or clearing the filters.'
            }
          </Typography>
          {incidents.length === 0 ? (
            <Button variant="contained" onClick={handleAddIncident}>
              Add First Incident
            </Button>
          ) : (
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredIncidents.map((incident) => (
            <Grid key={incident.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleViewIncident(incident.id)}
              >
                <CardContent sx={{ flex: 1, p: 3 }}>
                  {/* Header with chips and action */}
                  <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
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
                    <Tooltip title="View Helper Profile">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewHelper(incident.helperId)}
                        sx={{ ml: 1 }}
                      >
                        <PersonIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Helper Info */}
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {getHelperName(incident.helperId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Employer: {getHelperEmployer(incident.helperId)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Incident Details */}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Date:</strong> {new Date(incident.incidentDate).toLocaleDateString()}
                  </Typography>

                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 2, 
                      display: '-webkit-box', 
                      '-webkit-line-clamp': 3, 
                      '-webkit-box-orient': 'vertical', 
                      overflow: 'hidden',
                      lineHeight: 1.5,
                    }}
                  >
                    {incident.description}
                  </Typography>

                  {/* Footer */}
                  <Box mt="auto">
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" justifyContent="between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        <strong>Reporter:</strong> {incident.reportedBy}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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