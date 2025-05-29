// src/pages/helpers/index.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser } from '@/lib/session';
import type { Helper } from '../api/helpers/index';
import { useRouter } from 'next/router';

interface Props {
  user: SessionUser;
}

const Helpers: NextPage<Props> = () => {
  const router = useRouter();
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHelpers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/helpers', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setHelpers(data);
      } else {
        console.error('Unexpected payload:', data);
      }
    } catch (err) {
      console.error('Failed to fetch helpers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHelpers();
  }, []);

  const handleAdd = () => {
    router.push('/helpers/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/helpers/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this helper?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/helpers/${id}`, { method: 'DELETE' });
      toast.success(`Helper record has been deleted!`)
      // Remove from local state
      setHelpers((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Now safe because helpers is always an array
  const filtered = helpers.filter((h) => {
    if (typeof h.name !== 'string') return false;
    return h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.currentEmployer.toLowerCase().includes(search.toLowerCase()) ||
    h.eaOfficer.toLowerCase().includes(search.toLowerCase()) ||
    h.problem.toLowerCase().includes(search.toLowerCase())
  });

  return (
    <DashboardLayout>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Helpers</Typography>
        <Button variant="contained" onClick={handleAdd}>
          Add Helper
        </Button>
      </Box>

      <TextField
        label="Search Helpers"
        variant="outlined"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Current Employer</TableCell>
                <TableCell>Problem</TableCell>
                <TableCell>Total Employers</TableCell>
                <TableCell>EA Officer</TableCell>
                <TableCell align="right">Outstanding Loan</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((h) => (
                <TableRow key={h.id} hover>
                  <TableCell>{h.name}</TableCell>
                  <TableCell>{h.currentEmployer}</TableCell>
                  <TableCell>{h.problem}</TableCell>
                  <TableCell>{h.totalEmployers}</TableCell>
                  <TableCell>{h.eaOfficer}</TableCell>
                  <TableCell align="right">
                    ${h.outstandingLoan.toLocaleString()}
                  </TableCell>
                  <TableCell align='center'>
                    <IconButton size="small" onClick={() => handleEdit(h.id)}>
                      <EditIcon fontSize='inherit' />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(h.id)} disabled={deletingId === h.id}>
                      {deletingId === h.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon fontSize='inherit' />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No helpers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
  return { props: { user: session.user } };
};

export default Helpers;
