import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface IncidentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  loading?: boolean;
}

export const IncidentsFilters: React.FC<IncidentsFiltersProps> = ({
  search,
  onSearchChange,
  severityFilter,
  onSeverityFilterChange,
  statusFilter,
  onStatusFilterChange,
  hasActiveFilters,
  onClearFilters,
  loading = false,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <FilterListIcon color="action" />
        <Typography variant="h6">Filters</Typography>
        {hasActiveFilters && (
          <Button size="small" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </Box>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Search incidents..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
            placeholder="Helper name, description, or reporter..."
            disabled={loading}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              label="Severity"
              onChange={(e) => onSeverityFilterChange(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">All Severities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => onStatusFilterChange(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};