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
} from '@mui/material';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllHelpers } from '@/lib/sheets';

// Type for the helper prop we’ll pass in
interface HelperProp {
  id: string;
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: number;
  eaOfficer: string;
  outstandingLoan: number;
}

interface FormData {
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: string;
  eaOfficer: string;
  outstandingLoan: string;
}

interface Props {
  user: SessionUser;
  helper: HelperProp;
}

const EditHelperPage: NextPage<Props> = ({ helper }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: helper.name,
    currentEmployer: helper.currentEmployer,
    problem: helper.problem,
    totalEmployers: String(helper.totalEmployers),
    eaOfficer: helper.eaOfficer,
    outstandingLoan: String(helper.outstandingLoan),
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
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to update helper');
      }
      router.push('/helpers');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    router.push('/helpers');
  };

  return (
    <DashboardLayout>
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }} elevation={1}>
        <Typography variant="h5" gutterBottom>
          Edit Helper
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
      },
    },
  };
};

export default EditHelperPage;
