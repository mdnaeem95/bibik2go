// src/pages/incidents/add.tsx
import { useState, useEffect } from 'react';
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
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllHelpers } from '@/lib/sheets';

interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
}

interface FormData {
  helperId: string;
  helperName: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution: string;
}

interface Props {
  user: SessionUser;
  helpers: Helper[];
}

const AddIncidentPage: NextPage<Props> = ({ user, helpers }) => {
  const router = useRouter();
  const { helperId: preselectedHelperId } = router.query;

  const [form, setForm] = useState<FormData>({
    helperId: preselectedHelperId as string || '',
    helperName: '',
    incidentDate: new Date().toISOString().split('T')[0], // Today's date
    description: '',
    severity: 'Medium',
    reportedBy: user.username,
    status: 'Open',
    resolution: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // Find helper name when helperId changes
  useEffect(() => {
    if (form.helperId) {
      const helper = helpers.find(h => h.id === form.helperId);
      setForm(prev => ({ ...prev, helperName: helper?.name || '' }));
    }
  }, [form.helperId, helpers]);

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.helperId) errs.helperId = 'Helper is required';
    if (!form.incidentDate) errs.incidentDate = 'Incident date is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.reportedBy.trim()) errs.reportedBy = 'Reporter is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const onHelperChange = (helper: Helper | null) => {
    setForm(prev => ({ 
      ...prev, 
      helperId: helper?.id || '',
      helperName: helper?.name || ''
    }));
    setErrors((errs) => ({ ...errs, helperId: undefined }));
  };

  const onCancel = () => {
    router.back();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
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
        throw new Error(error || 'Failed to create incident');
      }
      toast.success('Incident added successfully!');
      router.push(`/helpers/${form.helperId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }} elevation={1}>
        <Typography variant="h5" gutterBottom>
          Add New Incident
        </Typography>

        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            options={helpers}
            getOptionLabel={(option) => `${option.name} (${option.currentEmployer})`}
            value={helpers.find(h => h.id === form.helperId) || null}
            onChange={(_, newValue) => onHelperChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Helper"
                error={!!errors.helperId}
                helperText={errors.helperId || 'Search and select a helper'}
                required
              />
            )}
          />

          <TextField
            label="Incident Date"
            type="date"
            value={form.incidentDate}
            onChange={onChange('incidentDate')}
            error={!!errors.incidentDate}
            helperText={errors.incidentDate}
            required
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={onChange('description')}
            error={!!errors.description}
            helperText={errors.description}
            required
            multiline
            rows={4}
            placeholder="Describe what happened..."
          />

          <FormControl required>
            <InputLabel>Severity</InputLabel>
            <Select
              value={form.severity}
              label="Severity"
              onChange={(e) => setForm(prev => ({ ...prev, severity: e.target.value as FormData['severity'] }))}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Reported By"
            value={form.reportedBy}
            onChange={onChange('reportedBy')}
            error={!!errors.reportedBy}
            helperText={errors.reportedBy}
            required
          />

          <FormControl required>
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as FormData['status'] }))}
            >
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </FormControl>

          {form.status === 'Resolved' && (
            <TextField
              label="Resolution"
              value={form.resolution}
              onChange={onChange('resolution')}
              multiline
              rows={3}
              placeholder="How was this incident resolved?"
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
            <Button onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Incident'}
            </Button>
          </Box>
        </Box>
      </Paper>
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
    return { redirect: { destination: '/login', permanent: false } };
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
    console.error('Error fetching helpers:', error);
    return { 
      props: { 
        user: session.user,
        helpers: [],
      } 
    };
  }
};

export default AddIncidentPage;