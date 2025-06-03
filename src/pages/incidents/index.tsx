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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';

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

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">All Incidents</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddIncident}
        >
          Add Incident
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search incidents..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 300 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={severityFilter}
            label="Severity"
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Under Review">Under Review</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredIncidents.length} of {incidents.length} incidents
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredIncidents.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {incidents.length === 0 ? 'No incidents found' : 'No incidents match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {incidents.length === 0 
              ? 'Start by adding your first incident report.'
              : 'Try adjusting your search or filter criteria.'
            }
          </Typography>
          <Button variant="outlined" onClick={handleAddIncident}>
            Add Incident
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredIncidents.map((incident) => (
            <Grid key={incident.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  {/* Header with chips */}
                  <Box display="flex" justifyContent="between" mb={2}>
                    <Box display="flex" gap={1}>
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
                      >
                        <PersonIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Helper Info */}
                  <Typography variant="h6" gutterBottom>
                    {getHelperName(incident.helperId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {getHelperEmployer(incident.helperId)}
                  </Typography>

                  {/* Incident Details */}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Date:</strong> {new Date(incident.incidentDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 2, display: '-webkit-box', '-webkit-line-clamp': 3, '-webkit-box-orient': 'vertical', overflow: 'hidden' }}>
                    {incident.description}
                  </Typography>

                  {/* Footer */}
                  <Box display="flex" justifyContent="between" alignItems="center" mt="auto">
                    <Typography variant="body2" color="text.secondary">
                      By: {incident.reportedBy}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </Typography>
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