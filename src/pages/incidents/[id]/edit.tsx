// src/pages/incidents/[id]/edit.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser, canEdit } from '@/lib/session';
import { getAllIncidents, getAllHelpers } from '@/lib/sheets';

// Type for the incident prop we'll pass in
interface IncidentProp {
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

interface HelperProp {
  id: string;
  name: string;
  currentEmployer: string;
}

interface FormData {
  helperId: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution: string;
}

interface Props {
  user: SessionUser;
  incident: IncidentProp;
  helpers: HelperProp[];
}

const EditIncidentPage: NextPage<Props> = ({ incident, helpers }) => {
  const router = useRouter();
  const returnTo = (router.query.returnTo as string) || `/incidents/${incident.id}`;
  const [form, setForm] = useState<FormData>({
    helperId: incident.helperId,
    incidentDate: incident.incidentDate,
    description: incident.description,
    severity: incident.severity,
    reportedBy: incident.reportedBy,
    status: incident.status,
    resolution: incident.resolution || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedHelper = helpers.find(h => h.id === form.helperId);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.helperId) errs.helperId = 'Helper is required';
    if (!form.incidentDate) errs.incidentDate = 'Incident date is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.severity) errs.severity = 'Severity is required';
    if (!form.reportedBy.trim()) errs.reportedBy = 'Reported by is required';
    if (!form.status) errs.status = 'Status is required';
    
    // If status is Resolved, resolution should be provided
    if (form.status === 'Resolved' && !form.resolution.trim()) {
      errs.resolution = 'Resolution is required when status is Resolved';
    }

    // Validate incident date is not in the future
    if (form.incidentDate) {
      const incDate = new Date(form.incidentDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      if (incDate > today) {
        errs.incidentDate = 'Incident date cannot be in the future';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helperId: form.helperId,
          incidentDate: form.incidentDate,
          description: form.description,
          severity: form.severity,
          reportedBy: form.reportedBy,
          status: form.status,
          resolution: form.resolution || undefined,
        }),
      });
      
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to update incident');
      }
      
      toast.success('Incident updated successfully!');
      router.push(returnTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    router.push(returnTo);
  };

  return (
    <DashboardLayout>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }} elevation={1}>
        <Typography variant="h5" gutterBottom>
          Edit Incident
        </Typography>

        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* Helper Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Helper Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={helpers}
                getOptionLabel={(option) => `${option.name} - ${option.currentEmployer}`}
                value={selectedHelper || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setForm({ ...form, helperId: newValue.id });
                    setErrors({ ...errors, helperId: undefined });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Helper"
                    error={!!errors.helperId}
                    helperText={errors.helperId || 'The helper cannot be changed'}
                    required
                  />
                )}
                disabled
                fullWidth
              />
            </Grid>

            {/* Incident Details */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                Incident Details
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Incident Date"
                type="date"
                value={form.incidentDate}
                onChange={onChange('incidentDate')}
                error={!!errors.incidentDate}
                helperText={errors.incidentDate}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl required fullWidth error={!!errors.severity}>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={form.severity}
                  label="Severity"
                  onChange={(e) => {
                    setForm(f => ({ ...f, severity: e.target.value as FormData['severity'] }));
                    setErrors(errs => ({ ...errs, severity: undefined }));
                  }}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
                {errors.severity && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.severity}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                value={form.description}
                onChange={onChange('description')}
                error={!!errors.description}
                helperText={errors.description}
                fullWidth
                required
                multiline
                rows={4}
              />
            </Grid>

            {/* Reporting Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                Reporting Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Reported By"
                value={form.reportedBy}
                onChange={onChange('reportedBy')}
                error={!!errors.reportedBy}
                helperText={errors.reportedBy}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl required fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  label="Status"
                  onChange={(e) => {
                    setForm(f => ({ ...f, status: e.target.value as FormData['status'] }));
                    setErrors(errs => ({ ...errs, status: undefined }));
                  }}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                </Select>
                {errors.status && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Resolution (only show if status is Resolved) */}
            {form.status === 'Resolved' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Resolution"
                  value={form.resolution}
                  onChange={onChange('resolution')}
                  error={!!errors.resolution}
                  helperText={errors.resolution || 'Describe how the incident was resolved'}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
            <Button onClick={onCancel} disabled={loading} size="large">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              size="large"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res, params }) => {
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  if (!session.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  // Check if user can edit
  if (!canEdit(session.user.role)) {
    return { 
      redirect: { 
        destination: `/incidents/${params?.id}`, 
        permanent: false 
      } 
    };
  }

  const { id } = params as { id: string };
  
  try {
    const [allIncidents, allHelpers] = await Promise.all([
      getAllIncidents(),
      getAllHelpers(),
    ]);
    
    const incident = allIncidents.find((i) => i.id === id);
    if (!incident) {
      return { notFound: true };
    }

    // Map helpers to simpler structure
    const helpersList = allHelpers.map(h => ({
      id: h.id,
      name: h.name,
      currentEmployer: h.currentEmployer,
    }));

    return {
      props: {
        user: session.user,
        incident: {
          id: incident.id,
          helperId: incident.helperId,
          incidentDate: incident.incidentDate,
          description: incident.description,
          severity: incident.severity as 'Low' | 'Medium' | 'High' | 'Critical',
          reportedBy: incident.reportedBy,
          status: incident.status as 'Open' | 'Resolved' | 'Under Review',
          resolution: incident.resolution,
          createdAt: incident.createdAt,
        },
        helpers: helpersList,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { notFound: true };
  }
};

export default EditIncidentPage;