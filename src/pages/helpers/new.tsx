// src/pages/helpers/new.tsx
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
} from '@mui/material';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser } from '@/lib/session';

interface FormData {
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: string;     // keep as string for easy TextField binding
  eaOfficer: string;
  outstandingLoan: string;
}

const NewHelperPage: NextPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: '',
    currentEmployer: '',
    problem: '',
    totalEmployers: '',
    eaOfficer: '',
    outstandingLoan: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.currentEmployer.trim()) errs.currentEmployer = 'Employer is required';
    if (!form.problem.trim()) errs.problem = 'Problem description is required';
    if (!/^\d+$/.test(form.totalEmployers))
      errs.totalEmployers = 'Must be a number';
    if (!form.eaOfficer.trim()) errs.eaOfficer = 'EA Officer is required';
    if (!/^\d+$/.test(form.outstandingLoan))
      errs.outstandingLoan = 'Must be a number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

    const onCancel = () => {
    router.push('/helpers');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/helpers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          currentEmployer: form.currentEmployer,
          problem: form.problem,
          totalEmployers: Number(form.totalEmployers),
          eaOfficer: form.eaOfficer,
          outstandingLoan: Number(form.outstandingLoan),
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to create helper');
      }
      // On success, go back to the list
      toast.success('Helper added successfully!')
      router.push('/helpers');
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
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }} elevation={1}>
        <Typography variant="h5" gutterBottom>
          Add New Helper
        </Typography>

        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={onChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <TextField
            label="Current Employer"
            value={form.currentEmployer}
            onChange={onChange('currentEmployer')}
            error={!!errors.currentEmployer}
            helperText={errors.currentEmployer}
            fullWidth
          />

          <TextField
            label="Problem"
            value={form.problem}
            onChange={onChange('problem')}
            error={!!errors.problem}
            helperText={errors.problem}
            fullWidth
          />

          <TextField
            label="Total Employers"
            value={form.totalEmployers}
            onChange={onChange('totalEmployers')}
            error={!!errors.totalEmployers}
            helperText={errors.totalEmployers}
            fullWidth
          />

          <TextField
            label="EA Officer"
            value={form.eaOfficer}
            onChange={onChange('eaOfficer')}
            error={!!errors.eaOfficer}
            helperText={errors.eaOfficer}
            fullWidth
          />

          <TextField
            label="Outstanding Loan"
            value={form.outstandingLoan}
            onChange={onChange('outstandingLoan')}
            error={!!errors.outstandingLoan}
            helperText={errors.outstandingLoan}
            fullWidth
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
            <Button onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Helper'}
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
  return { props: {} };
};

export default NewHelperPage;
