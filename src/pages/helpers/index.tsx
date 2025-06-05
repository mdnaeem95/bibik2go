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
  Chip,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableSortLabel from '@mui/material/TableSortLabel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser, canEdit, canDelete, canCreate } from '@/lib/session';
import type { Helper } from '../api/helpers/index';
import { useRouter } from 'next/router';

interface Props {
  user: SessionUser;
}

// Loan threshold configurations - you can adjust these based on business needs
const LOAN_THRESHOLDS = {
  HIGH_VALUE: 1000,    // $1000+ = High value customer
  MEDIUM_VALUE: 500,   // $500-$999 = Medium value customer
  LOW_VALUE: 100,      // $100-$499 = Low value customer
  URGENT_FOLLOWUP: 800, // $800+ = Needs urgent follow-up
};

const Helpers: NextPage<Props> = ({ user }) => {
  const router = useRouter();
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof Helper>('outstandingLoan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default to highest loans first
  const [loanFilter, setLoanFilter] = useState<string>('all');

  // Check user permissions
  const userCanEdit = canEdit(user.role);
  const userCanDelete = canDelete(user.role);
  const userCanCreate = canCreate(user.role);

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
    if (!userCanCreate) {
      toast.error('You need Staff or Admin role to add helpers');
      return;
    }
    router.push('/helpers/new');
  };

  const handleEdit = (id: string) => {
    if (!userCanEdit) {
      toast.error('You need Staff or Admin role to edit helpers');
      return;
    }
    setEditingId(id);
    router.push(`/helpers/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!userCanDelete) {
      toast.error('You need Staff or Admin role to delete helpers');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this helper?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/helpers/${id}`, { method: 'DELETE' });
      toast.success(`Helper record has been deleted!`)
      setHelpers((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (id: string) => {
    setViewingId(id);
    router.push(`/helpers/${id}`);
  };

  const handleSort = (column: keyof Helper) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'outstandingLoan' ? 'desc' : 'asc'); // Default to desc for loans
    }
  };

  // Get loan status chip
  const getLoanChip = (amount: number) => {
    if (amount === 0) {
      return <Chip label="No Loan" color="success" size="small" />;
    }
    if (amount >= LOAN_THRESHOLDS.URGENT_FOLLOWUP) {
      return (
        <Tooltip title="High value customer - urgent follow-up recommended">
          <Chip 
            icon={<TrendingUpIcon />}
            label="High Priority" 
            color="error" 
            size="small" 
          />
        </Tooltip>
      );
    }
    if (amount >= LOAN_THRESHOLDS.HIGH_VALUE) {
      return (
        <Tooltip title="High value customer">
          <Chip 
            icon={<AttachMoneyIcon />}
            label="High Value" 
            color="warning" 
            size="small" 
          />
        </Tooltip>
      );
    }
    if (amount >= LOAN_THRESHOLDS.MEDIUM_VALUE) {
      return <Chip label="Medium Value" color="info" size="small" />;
    }
    if (amount >= LOAN_THRESHOLDS.LOW_VALUE) {
      return <Chip label="Active Loan" color="default" size="small" />;
    }
    return <Chip label="Minimal Loan" color="success" size="small" variant="outlined" />;
  };

  // Filter helpers based on search and loan filter
  const filtered = helpers.filter((h) => {
    if (typeof h.name !== 'string') return false;
    
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.currentEmployer.toLowerCase().includes(search.toLowerCase()) ||
      h.eaOfficer.toLowerCase().includes(search.toLowerCase()) ||
      h.problem.toLowerCase().includes(search.toLowerCase());

    const matchesLoanFilter = (() => {
      switch (loanFilter) {
        case 'high': return h.outstandingLoan >= LOAN_THRESHOLDS.HIGH_VALUE;
        case 'medium': return h.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE && h.outstandingLoan < LOAN_THRESHOLDS.HIGH_VALUE;
        case 'low': return h.outstandingLoan >= LOAN_THRESHOLDS.LOW_VALUE && h.outstandingLoan < LOAN_THRESHOLDS.MEDIUM_VALUE;
        case 'none': return h.outstandingLoan === 0;
        case 'urgent': return h.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP;
        default: return true;
      }
    })();

    return matchesSearch && matchesLoanFilter;
  });

  // Sort filtered helpers
  const sortedHelpers = [...filtered].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Special handling for numeric fields
    if (sortBy === 'outstandingLoan' || sortBy === 'totalEmployers') {
      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    // String comparison for other fields
    return sortOrder === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Calculate summary stats
  const totalOutstandingLoans = helpers.reduce((sum, h) => sum + h.outstandingLoan, 0);
  const highValueCustomers = helpers.filter(h => h.outstandingLoan >= LOAN_THRESHOLDS.HIGH_VALUE).length;
  const urgentFollowUps = helpers.filter(h => h.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP).length;

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4">Helpers</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Logged in as <strong>{user.username}</strong> ({user.role})
            </Typography>
          </Box>
          {userCanCreate && (
            <Button variant="contained" onClick={handleAdd}>
              Add Helper
            </Button>
          )}
        </Box>

        {/* Loan Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid>
            <Paper sx={{ p: 2, bgcolor: '#f0f9ff', border: '1px solid #0284c7' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoneyIcon color="primary" />
                <Box>
                  <Typography variant="h6" color="primary">
                    ${totalOutstandingLoans.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Outstanding Loans
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid>
            <Paper sx={{ p: 2, bgcolor: '#fef3c7', border: '1px solid #f59e0b' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon sx={{ color: '#f59e0b' }} />
                <Box>
                  <Typography variant="h6" sx={{ color: '#f59e0b' }}>
                    {highValueCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Value Customers (${LOAN_THRESHOLDS.HIGH_VALUE}+)
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid>
            <Paper sx={{ p: 2, bgcolor: '#fee2e2', border: '1px solid #dc2626' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon sx={{ color: '#dc2626' }} />
                <Box>
                  <Typography variant="h6" sx={{ color: '#dc2626' }}>
                    {urgentFollowUps}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Urgent Follow-ups (${LOAN_THRESHOLDS.URGENT_FOLLOWUP}+)
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {urgentFollowUps > 0 && (
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              <strong>{urgentFollowUps} helper(s)</strong> have loans ≥ ${LOAN_THRESHOLDS.URGENT_FOLLOWUP.toLocaleString() + ' '}   
              and may need urgent follow-up for loan management.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search Helpers"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Loan Category</InputLabel>
          <Select
            value={loanFilter}
            label="Loan Category"
            onChange={(e) => setLoanFilter(e.target.value)}
          >
            <MenuItem value="all">All Loans</MenuItem>
            <MenuItem value="urgent">🚨 Urgent (${LOAN_THRESHOLDS.URGENT_FOLLOWUP}+)</MenuItem>
            <MenuItem value="high">💰 High Value (${LOAN_THRESHOLDS.HIGH_VALUE}+)</MenuItem>
            <MenuItem value="medium">📈 Medium (${LOAN_THRESHOLDS.MEDIUM_VALUE}-${LOAN_THRESHOLDS.HIGH_VALUE-1})</MenuItem>
            <MenuItem value="low">💵 Low (${LOAN_THRESHOLDS.LOW_VALUE}-${LOAN_THRESHOLDS.MEDIUM_VALUE-1})</MenuItem>
            <MenuItem value="none">✅ No Loan ($0)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : sortedHelpers.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' gutterBottom>
            {helpers.length === 0 ? 'No helpers found.' : 'No helpers match your filters.'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {helpers.length === 0 
              ? (userCanCreate ? 'Add your first helper to get started.' : 'No helpers have been added yet.')
              : 'Try adjusting your search or filter criteria.'
            }
          </Typography>
          {userCanCreate && helpers.length === 0 && (
            <Button variant='contained' sx={{ mt: 2 }} onClick={handleAdd}>
              Add Helper
            </Button>
            )}
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel 
                    active={sortBy === 'name'} 
                    direction={sortBy === 'name' ? sortOrder : 'asc'} 
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Current Employer</TableCell>
                <TableCell>Problem</TableCell>
                <TableCell>
                  <TableSortLabel 
                    active={sortBy === 'totalEmployers'} 
                    direction={sortBy === 'totalEmployers' ? sortOrder : 'asc'} 
                    onClick={() => handleSort('totalEmployers')}
                  >
                    Total Employers
                  </TableSortLabel>
                </TableCell>
                <TableCell>EA Officer</TableCell>
                <TableCell align="right">
                  <TableSortLabel 
                    active={sortBy === 'outstandingLoan'} 
                    direction={sortBy === 'outstandingLoan' ? sortOrder : 'asc'} 
                    onClick={() => handleSort('outstandingLoan')}
                  >
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                      <AttachMoneyIcon fontSize="small" />
                      Outstanding Loan
                    </Box>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedHelpers.map((h) => (
                <TableRow 
                  key={h.id} 
                  hover
                  sx={{
                    // Highlight high-value customers
                    ...(h.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP && {
                      bgcolor: '#fef2f2',
                      '&:hover': { bgcolor: '#fecaca' }
                    }),
                    ...(h.outstandingLoan >= LOAN_THRESHOLDS.HIGH_VALUE && h.outstandingLoan < LOAN_THRESHOLDS.URGENT_FOLLOWUP && {
                      bgcolor: '#fefbf0',
                      '&:hover': { bgcolor: '#fef3c7' }
                    })
                  }}
                >
                  <TableCell>{h.name}</TableCell>
                  <TableCell>{h.currentEmployer}</TableCell>
                  <TableCell>{h.problem}</TableCell>
                  <TableCell>{h.totalEmployers}</TableCell>
                  <TableCell>{h.eaOfficer}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                      <Typography variant="body2" fontWeight={h.outstandingLoan >= LOAN_THRESHOLDS.HIGH_VALUE ? 600 : 400}>
                        ${h.outstandingLoan.toLocaleString()}
                      </Typography>
                      {getLoanChip(h.outstandingLoan)}
                    </Box>
                  </TableCell>
                  <TableCell align='center'>
                    {/* Edit button - only show if user can edit */}
                    {userCanEdit ? (
                      <Tooltip title="Edit Helper">
                        <IconButton size="small" onClick={() => handleEdit(h.id)} disabled={editingId === h.id}>
                          {editingId === h.id ? (
                            <CircularProgress size={20} />
                          ): (
                            <EditIcon fontSize='inherit' />
                          )}                      
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Edit (Staff/Admin Only)">
                        <span>
                          <IconButton size="small" disabled>
                            <EditIcon fontSize='inherit' />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {/* Delete button - only show if user can delete */}
                    {userCanDelete ? (
                      <Tooltip title="Delete Helper">
                        <IconButton size="small" onClick={() => handleDelete(h.id)} disabled={deletingId === h.id}>
                          {deletingId === h.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon fontSize='inherit' />
                          )}
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Delete (Staff/Admin Only)">
                        <span>
                          <IconButton size="small" disabled>
                            <DeleteIcon fontSize='inherit' />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    {/* View button - always available */}
                    <Tooltip title="View Helper">
                      <IconButton size="small" onClick={() => handleView(h.id)} disabled={viewingId === h.id}>
                        {viewingId === h.id ? <CircularProgress size={20} /> : <VisibilityIcon fontSize="inherit" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
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