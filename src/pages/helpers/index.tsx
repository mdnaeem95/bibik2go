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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser } from '@/lib/session';
import type { Helper } from '../api/helpers/index';
import { useRouter } from 'next/router';

interface Props {
  user: SessionUser;
}

// Client's loan threshold configurations
const LOAN_THRESHOLDS = {
  MINIMAL: 550,        // 0-549 = Minimal/No loan
  LOW_VALUE: 1100,     // 550-1099 = Low value
  MEDIUM_VALUE: 2200,  // 1100-2199 = Medium value  
  HIGH_VALUE: 3300,    // 2200-3299 = High value
  URGENT_FOLLOWUP: 3300, // 3300+ = Urgent follow-up
};

// Employment duration helpers
const calculateEmploymentDuration = (startDate: string): { months: number; displayText: string } => {
  if (!startDate) {
    return { months: 0, displayText: 'Not specified' };
  }
  
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30); // Approximate months
  
  if (months < 1) {
    return { months, displayText: `${diffDays} days` };
  } else if (months < 12) {
    return { months, displayText: `${months} month${months === 1 ? '' : 's'}` };
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return { months, displayText: `${years} year${years === 1 ? '' : 's'}` };
    }
    return { months, displayText: `${years}y ${remainingMonths}m` };
  }
};

const isNewEmployee = (startDate: string): boolean => {
  const { months } = calculateEmploymentDuration(startDate);
  return months < 3;
};

const Helpers: NextPage<Props> = () => {
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
    setEditingId(id);
    router.push(`/helpers/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
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

  // Get loan status chip based on client's thresholds
  const getLoanChip = (amount: number) => {
    if (amount < LOAN_THRESHOLDS.MINIMAL) {
      return <Chip label="Minimal" color="success" size="small" />;
    }
    if (amount >= LOAN_THRESHOLDS.URGENT_FOLLOWUP) {
      return (
        <Tooltip title="Urgent follow-up required (≥$3,300)">
          <Chip 
            icon={<WarningIcon />}
            label="Urgent" 
            color="error" 
            size="small" 
          />
        </Tooltip>
      );
    }
    if (amount >= LOAN_THRESHOLDS.MEDIUM_VALUE) {
      return (
        <Tooltip title="High value customer ($2,200-$3,299)">
          <Chip 
            icon={<TrendingUpIcon />}
            label="High Value" 
            color="warning" 
            size="small" 
          />
        </Tooltip>
      );
    }
    if (amount >= LOAN_THRESHOLDS.LOW_VALUE) {
      return (
        <Tooltip title="Medium value customer ($1,100-$2,199)">
          <Chip 
            icon={<AttachMoneyIcon />}
            label="Medium Value" 
            color="info" 
            size="small" 
          />
        </Tooltip>
      );
    }
    if (amount >= LOAN_THRESHOLDS.MINIMAL) {
      return (
        <Tooltip title="Low value customer ($550-$1,099)">
          <Chip 
            label="Low Value" 
            color="default" 
            size="small" 
          />
        </Tooltip>
      );
    }
    return <Chip label="Minimal" color="success" size="small" variant="outlined" />;
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
        case 'urgent': return h.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP; // $3,300+
        case 'high': return h.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE && h.outstandingLoan < LOAN_THRESHOLDS.HIGH_VALUE; // $2,200-$3,299
        case 'medium': return h.outstandingLoan >= LOAN_THRESHOLDS.LOW_VALUE && h.outstandingLoan < LOAN_THRESHOLDS.MEDIUM_VALUE; // $1,100-$2,199
        case 'low': return h.outstandingLoan >= LOAN_THRESHOLDS.MINIMAL && h.outstandingLoan < LOAN_THRESHOLDS.LOW_VALUE; // $550-$1,099
        case 'minimal': return h.outstandingLoan < LOAN_THRESHOLDS.MINIMAL; // $0-$549
        case 'new': return isNewEmployee(h.employmentStartDate); // Use real employment start date
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
    
    // Special handling for employment start date (sort by date)
    if (sortBy === 'employmentStartDate') {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      // For employment duration: asc = longest employed first (earliest dates), desc = newest first (latest dates)
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    // String comparison for other fields
    return sortOrder === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Calculate summary stats based on client thresholds
  const totalOutstandingLoans = helpers.reduce((sum, h) => sum + h.outstandingLoan, 0);
  const urgentFollowUps = helpers.filter(h => h.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP).length;
  const highValueCustomers = helpers.filter(h => h.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE && h.outstandingLoan < LOAN_THRESHOLDS.HIGH_VALUE).length;
  const mediumValueCustomers = helpers.filter(h => h.outstandingLoan >= LOAN_THRESHOLDS.LOW_VALUE && h.outstandingLoan < LOAN_THRESHOLDS.MEDIUM_VALUE).length;
  
  // Calculate new employees (< 3 months) using real employment dates
  const newEmployees = helpers.filter(h => isNewEmployee(h.employmentStartDate)).length;

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4">Helpers</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage domestic helper loan accounts and employment records
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleAdd}>
            Add Helper
          </Button>
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
            <Paper sx={{ p: 2, bgcolor: '#fee2e2', border: '1px solid #dc2626' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon sx={{ color: '#dc2626' }} />
                <Box>
                  <Typography variant="h6" sx={{ color: '#dc2626' }}>
                    {urgentFollowUps}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Urgent Follow-ups ($3,300+)
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
                    High Value ($2,200-$3,299)
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid>
            <Paper sx={{ p: 2, bgcolor: '#e0f2fe', border: '1px solid #0284c7' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoneyIcon sx={{ color: '#0284c7' }} />
                <Box>
                  <Typography variant="h6" sx={{ color: '#0284c7' }}>
                    {mediumValueCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Medium Value ($1,100-$2,199)
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid>
            <Paper sx={{ p: 2, bgcolor: '#e3f2fd', border: '1px solid #1976d2' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <NewReleasesIcon sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="h6" sx={{ color: '#1976d2' }}>
                    {newEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Employees (&lt; 3 months)
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
              <strong>{urgentFollowUps} helper(s)</strong> have loans ≥ $3,300 and require urgent follow-up for loan management.
            </Typography>
          </Alert>
        )}

        {newEmployees > 0 && (
          <Alert 
            severity="info" 
            icon={<NewReleasesIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              <strong>{newEmployees} helper(s)</strong> are new employees (less than 3 months) and may need additional support and monitoring.
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
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Loan Category</InputLabel>
          <Select
            value={loanFilter}
            label="Loan Category"
            onChange={(e) => setLoanFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="urgent">🚨 Urgent ($3,300+)</MenuItem>
            <MenuItem value="high">💰 High Value ($2,200-$3,299)</MenuItem>
            <MenuItem value="medium">📈 Medium Value ($1,100-$2,199)</MenuItem>
            <MenuItem value="low">💵 Low Value ($550-$1,099)</MenuItem>
            <MenuItem value="minimal">✅ Minimal ($0-$549)</MenuItem>
            <MenuItem value="new">🆕 New Employees (&lt; 3 months)</MenuItem>
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
              ? 'Add your first helper to get started.'
              : 'Try adjusting your search or filter criteria.'
            }
          </Typography>
          {helpers.length === 0 && (
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
                <TableCell>
                  <TableSortLabel 
                    active={sortBy === 'employmentStartDate'} 
                    direction={sortBy === 'employmentStartDate' ? sortOrder : 'asc'} 
                    onClick={() => handleSort('employmentStartDate')}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTimeIcon fontSize="small" />
                      Employment Duration
                    </Box>
                  </TableSortLabel>
                </TableCell>
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
              {sortedHelpers.map((h) => {
                // Use real employment start date from helper record
                const isNew = isNewEmployee(h.employmentStartDate);
                
                return (
                <TableRow 
                  key={h.id} 
                  hover
                  sx={{
                    // Highlight urgent and high-value customers
                    ...(h.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP && {
                      bgcolor: '#fef2f2',
                      '&:hover': { bgcolor: '#fecaca' }
                    }),
                    ...(h.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE && h.outstandingLoan < LOAN_THRESHOLDS.HIGH_VALUE && {
                      bgcolor: '#fefbf0',
                      '&:hover': { bgcolor: '#fef3c7' }
                    }),
                    // Highlight new employees
                    ...(isNew && h.outstandingLoan < LOAN_THRESHOLDS.MEDIUM_VALUE && {
                      bgcolor: '#f0f9ff',
                      '&:hover': { bgcolor: '#e0f2fe' }
                    })
                  }}
                >
                  <TableCell>{h.name}</TableCell>
                  <TableCell>{h.currentEmployer}</TableCell>
                  <TableCell>
                    {(() => {
                      const duration = calculateEmploymentDuration(h.employmentStartDate);
                      
                      return (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {duration.displayText}
                          </Typography>
                          {isNew && (
                            <Tooltip title="New employee (< 3 months)">
                              <Chip 
                                icon={<NewReleasesIcon />}
                                label="New" 
                                color="info" 
                                size="small"
                                sx={{ 
                                  bgcolor: '#e3f2fd',
                                  color: '#1976d2',
                                  '& .MuiChip-icon': { color: '#1976d2' }
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      );
                    })()}
                  </TableCell>
                  <TableCell>{h.problem}</TableCell>
                  <TableCell>{h.totalEmployers}</TableCell>
                  <TableCell>{h.eaOfficer}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                      <Typography variant="body2" fontWeight={h.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE ? 600 : 400}>
                        ${h.outstandingLoan.toLocaleString()}
                      </Typography>
                      {getLoanChip(h.outstandingLoan)}
                    </Box>
                  </TableCell>
                  <TableCell align='center'>
                    <Tooltip title="Edit Helper">
                      <IconButton size="small" onClick={() => handleEdit(h.id)} disabled={editingId === h.id}>
                        {editingId === h.id ? (
                          <CircularProgress size={20} />
                        ): (
                          <EditIcon fontSize='inherit' />
                        )}                      
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Helper">
                      <IconButton size="small" onClick={() => handleDelete(h.id)} disabled={deletingId === h.id}>
                        {deletingId === h.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon fontSize='inherit' />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="View Helper">
                      <IconButton size="small" onClick={() => handleView(h.id)} disabled={viewingId === h.id}>
                        {viewingId === h.id ? <CircularProgress size={20} /> : <VisibilityIcon fontSize="inherit" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                );
              })}
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