// src/components/helpers/HelpersTable.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableSortLabel,
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { Helper, LOAN_THRESHOLDS } from '@/types';
import { calculateEmploymentDuration, isNewEmployee } from '@/utils/helpers';
import { LoanStatusChip } from './LoanStatusChip';

interface HelpersTableProps {
  helpers: Helper[];
  sortBy: keyof Helper;
  sortOrder: 'asc' | 'desc';
  onSort: (column: keyof Helper) => void;
  onDelete: (id: string) => void;
}

export const HelpersTable: React.FC<HelpersTableProps> = ({
  helpers,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
    router.push(`/helpers/${id}/edit`);
  };

  const handleView = (id: string) => {
    setViewingId(id);
    router.push(`/helpers/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this helper?')) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getRowSx = (helper: Helper) => {
    const isNew = isNewEmployee(helper.employmentStartDate);
    
    if (helper.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP) {
      return { bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fecaca' } };
    }
    if (helper.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE && 
        helper.outstandingLoan < LOAN_THRESHOLDS.HIGH_VALUE) {
      return { bgcolor: '#fefbf0', '&:hover': { bgcolor: '#fef3c7' } };
    }
    if (isNew && helper.outstandingLoan < LOAN_THRESHOLDS.MEDIUM_VALUE) {
      return { bgcolor: '#f0f9ff', '&:hover': { bgcolor: '#e0f2fe' } };
    }
    return {};
  };

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortBy === 'name' ? sortOrder : 'asc'}
                onClick={() => onSort('name')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>Current Employer</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'employmentStartDate'}
                direction={sortBy === 'employmentStartDate' ? sortOrder : 'asc'}
                onClick={() => onSort('employmentStartDate')}
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
                onClick={() => onSort('totalEmployers')}
              >
                Total Employers
              </TableSortLabel>
            </TableCell>
            <TableCell>EA Officer</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'outstandingLoan'}
                direction={sortBy === 'outstandingLoan' ? sortOrder : 'asc'}
                onClick={() => onSort('outstandingLoan')}
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
          {helpers.map((helper) => {
            const isNew = isNewEmployee(helper.employmentStartDate);
            const duration = calculateEmploymentDuration(helper.employmentStartDate);

            return (
              <TableRow key={helper.id} hover sx={getRowSx(helper)}>
                <TableCell>{helper.name}</TableCell>
                <TableCell>{helper.currentEmployer}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">{duration.displayText}</Typography>
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
                </TableCell>
                <TableCell>{helper.problem}</TableCell>
                <TableCell>{helper.totalEmployers}</TableCell>
                <TableCell>{helper.eaOfficer}</TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                    <Typography
                      variant="body2"
                      fontWeight={helper.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE ? 600 : 400}
                    >
                      ${helper.outstandingLoan.toLocaleString()}
                    </Typography>
                    <LoanStatusChip amount={helper.outstandingLoan} />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Helper">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(helper.id)}
                      disabled={editingId === helper.id}
                    >
                      {editingId === helper.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <EditIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Helper">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(helper.id)}
                      disabled={deletingId === helper.id}
                    >
                      {deletingId === helper.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="View Helper">
                    <IconButton
                      size="small"
                      onClick={() => handleView(helper.id)}
                      disabled={viewingId === helper.id}
                    >
                      {viewingId === helper.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <VisibilityIcon fontSize="inherit" />
                      )}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};