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
import { getAllStaff } from '@/lib/sheets';

// Type for the helper prop we’ll pass in
interface StaffProp {
  id: string;
  name: string;
  role: string;
  email: string;
  contact: string;
}

interface FormData {
  name: string;
  role: string;
  email: string;
  contact: string;
}

interface Props {
  user: SessionUser;
  staff: StaffProp;
}

const EditStaffPage: NextPage<Props> = ({ staff }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: staff.name,
    role: staff.role,
    email: staff.email,
    contact: staff.contact,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.role.trim()) errs.role = 'Role is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.contact.trim()) errs.contact = 'Contact is required';
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
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          email: form.email,
          contact: form.contact,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to update staff');
      }
      router.push('/staff');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    router.push('/staff');
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
            label="Role"
            value={form.role}
            onChange={onChange('role')}
            error={!!errors.role}
            helperText={errors.role}
            fullWidth
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={onChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
          />

          <TextField
            label="Contact"
            value={form.contact}
            onChange={onChange('contact')}
            error={!!errors.contact}
            helperText={errors.contact}
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
  const rawRows = await getAllStaff();
  const row = rawRows.find((r) => r.id === id);
  if (!row) {
    return { notFound: true };
  }

  return {
    props: {
      user: session.user,
      staff: {
        id: row.id,
        name: row.name,
        role: row.role,
        email: row.email,
        contact: row.contact
      },
    },
  };
};

export default EditStaffPage;
