// src/components/helpers/HelpersFilters.tsx
import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface HelpersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  loanFilter: string;
  onLoanFilterChange: (value: string) => void;
}

const loanFilterOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'urgent', label: '🚨 Urgent ($3,300+)' },
  { value: 'high', label: '💰 High Value ($2,200-$3,299)' },
  { value: 'medium', label: '📈 Medium Value ($1,100-$2,199)' },
  { value: 'low', label: '💵 Low Value ($550-$1,099)' },
  { value: 'minimal', label: '✅ Minimal ($0-$549)' },
  { value: 'new', label: '🆕 New Employees (< 3 months)' },
];

export const HelpersFilters: React.FC<HelpersFiltersProps> = ({
  search,
  onSearchChange,
  loanFilter,
  onLoanFilterChange,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        label="Search Helpers"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flexGrow: 1 }}
        placeholder="Search by name, employer, officer, or problem..."
      />
      
      <FormControl size="small" sx={{ minWidth: 250 }}>
        <InputLabel>Loan Category</InputLabel>
        <Select
          value={loanFilter}
          label="Loan Category"
          onChange={(e) => onLoanFilterChange(e.target.value)}
        >
          {loanFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};