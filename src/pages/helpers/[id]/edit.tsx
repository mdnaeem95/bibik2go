// src/pages/helpers/[id]/edit.tsx
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
import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllHelpers } from '@/lib/sheets';
import { COMMON_PT_AGENCIES, TRANSFER_STATUS_OPTIONS, TransferStatus } from '@/types';

// Type for the helper prop we’ll pass in
interface HelperProp {
  id: string;
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: number;
  eaOfficer: string;
  outstandingLoan: number;
  employmentStartDate: string;
  pt: string;
  transferStatus: TransferStatus;
  lodgingStartDate?: string;
  lodgingEndDate?: string;
}

interface FormData {
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: string;
  eaOfficer: string;
  outstandingLoan: string;
  employmentStartDate: string;
  pt: string;
  transferStatus: TransferStatus;
  lodgingStartDate: string;
  lodgingEndDate: string;
}

interface Props {
  user: SessionUser;
  helper: HelperProp;
}

const EditHelperPage: NextPage<Props> = ({ helper }) => {
  const router = useRouter();
  const returnTo = (router.query.returnTo as string) || '/helpers';
  const [form, setForm] = useState<FormData>({
    name: helper.name,
    currentEmployer: helper.currentEmployer,
    problem: helper.problem,
    totalEmployers: String(helper.totalEmployers),
    eaOfficer: helper.eaOfficer,
    outstandingLoan: String(helper.outstandingLoan),
    employmentStartDate: helper.employmentStartDate,
    pt: helper.pt,
    transferStatus: helper.transferStatus,
    lodgingStartDate: helper.lodgingStartDate || '',
    lodgingEndDate: helper.lodgingEndDate || '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.currentEmployer.trim()) errs.currentEmployer = 'Employer is required';
    if (!form.problem.trim()) errs.problem = 'Problem description is required';
    if (!/^\d+$/.test(form.totalEmployers)) errs.totalEmployers = 'Must be a number';
    if (!form.eaOfficer.trim()) errs.eaOfficer = 'EA Officer is required';
    if (!/^\d+$/.test(form.outstandingLoan)) errs.outstandingLoan = 'Must be a number';
    if (!form.employmentStartDate) errs.employmentStartDate = 'Employment start date is required';
    if (!form.pt.trim()) errs.pt = 'PT/Agency is required';
    if (!form.transferStatus) errs.transferStatus = 'New';

    // Validate lodging dates if provided
    if (form.lodgingStartDate && form.lodgingEndDate) {
      const startDate = new Date(form.lodgingStartDate);
      const endDate = new Date(form.lodgingEndDate);
      if (endDate < startDate) {
        errs.lodgingEndDate = 'End date must be after start date';
      }
    }

    // Validate employment start date is not in the future
    if (form.employmentStartDate) {
      const startDate = new Date(form.employmentStartDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      if (startDate > today) {
        errs.employmentStartDate = 'Employment start date cannot be in the future';
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
      const res = await fetch(`/api/helpers/${helper.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          currentEmployer: form.currentEmployer,
          problem: form.problem,
          totalEmployers: Number(form.totalEmployers),
          eaOfficer: form.eaOfficer,
          outstandingLoan: Number(form.outstandingLoan),
          employmentStartDate: form.employmentStartDate,
          pt: form.pt,
          transferStatus: form.transferStatus
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to update helper');
      }
      toast.success(`Record for ${helper.name} edited successfully!`);
      router.push('/helpers');
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
          Edit Helper: {helper.name}
        </Typography>

        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Personal Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Name"
                value={form.name}
                onChange={onChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="EA Officer"
                value={form.eaOfficer}
                onChange={onChange('eaOfficer')}
                error={!!errors.eaOfficer}
                helperText={errors.eaOfficer}
                fullWidth
                required
              />
            </Grid>

            {/* NEW: PT and Transfer Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={COMMON_PT_AGENCIES}
                value={form.pt}
                onChange={(_, newValue) => setForm(f => ({ ...f, pt: newValue || '' }))}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="PT / Agency"
                    value={form.pt}
                    onChange={onChange('pt')}
                    error={!!errors.pt}
                    helperText={errors.pt || 'Agency or PT the helper came from'}
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl required fullWidth>
                <InputLabel>Transfer Status</InputLabel>
                <Select
                  value={form.transferStatus}
                  label="Transfer Status"
                  onChange={(e) => setForm(f => ({ ...f, transferStatus: e.target.value as TransferStatus }))}
                >
                  {TRANSFER_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Employment Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                Employment Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Current Employer"
                value={form.currentEmployer}
                onChange={onChange('currentEmployer')}
                error={!!errors.currentEmployer}
                helperText={errors.currentEmployer}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Employment Start Date"
                type="date"
                value={form.employmentStartDate}
                onChange={onChange('employmentStartDate')}
                error={!!errors.employmentStartDate}
                helperText={errors.employmentStartDate}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Total Employers"
                value={form.totalEmployers}
                onChange={onChange('totalEmployers')}
                error={!!errors.totalEmployers}
                helperText={errors.totalEmployers}
                fullWidth
                required
                type="number"
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Problem and Financial Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                Current Status & Financial Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Problem/Latest Issue"
                value={form.problem}
                onChange={onChange('problem')}
                error={!!errors.problem}
                helperText={errors.problem}
                fullWidth
                required
                multiline
                rows={3}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Outstanding Loan"
                value={form.outstandingLoan}
                onChange={onChange('outstandingLoan')}
                error={!!errors.outstandingLoan}
                helperText={errors.outstandingLoan}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
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

  const { id } = params as { id: string };
  const rawRows = await getAllHelpers();
  const row = rawRows.find((r) => r.id === id);
  if (!row) {
    return { notFound: true };
  }

  return {
    props: {
      user: session.user,
      helper: {
        id: row.id,
        name: row.name,
        currentEmployer: row.currentEmployer,
        problem: row.problem,
        totalEmployers: Number(row.totalEmployers),
        eaOfficer: row.eaOfficer,
        outstandingLoan: Number(row.outstandingLoan),
        employmentStartDate: row.employmentStartDate,
        pt: row.pt || '',
        transferStatus: (row.transferStatus as TransferStatus) || 'New',
      },
    },
  };
};

export default EditHelperPage;
