/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Grid, TextField, Typography, Box, Autocomplete, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { NewHelperFormData } from '@/hooks/useNewHelperForm';
import { COMMON_PT_AGENCIES, TRANSFER_STATUS_OPTIONS } from '@/types';

interface HelperDetailsStepProps {
  formData: NewHelperFormData;
  errors: Record<string, string | undefined>;
  onChange: (field: keyof NewHelperFormData, value: any) => void;
}

export const HelperDetailsStep: React.FC<HelperDetailsStepProps> = ({
  formData,
  errors,
  onChange,
}) => {
  const handleChange = (field: keyof NewHelperFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(field, e.target.value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddIcon /> Helper Information
      </Typography>

      <Grid container spacing={3}>
        {/* Personal Information Section */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            Personal Information
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="EA Officer"
            value={formData.eaOfficer}
            onChange={handleChange('eaOfficer')}
            error={!!errors.eaOfficer}
            helperText={errors.eaOfficer}
            fullWidth
            required
          />
        </Grid>

        {/* PT Agency and Transfer Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={COMMON_PT_AGENCIES}
            value={formData.pt}
            onChange={(_, newValue) => onChange('pt', newValue || '')}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="PT / Agency"
                value={formData.pt}
                onChange={handleChange('pt')}
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
              value={formData.transferStatus}
              label="Transfer Status"
              onChange={(e) => onChange('transferStatus', e.target.value)}
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

        {/* Employment Information Section */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            Employment Information
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Current Employer"
            value={formData.currentEmployer}
            onChange={handleChange('currentEmployer')}
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
            value={formData.employmentStartDate}
            onChange={handleChange('employmentStartDate')}
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
            value={formData.totalEmployers}
            onChange={handleChange('totalEmployers')}
            error={!!errors.totalEmployers}
            helperText={errors.totalEmployers || 'Total number of employers helper has worked for'}
            fullWidth
            required
            type="number"
            inputProps={{ min: 1 }}
          />
        </Grid>

        {/* Financial Information Section */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            Financial Information
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Outstanding Loan Amount"
            value={formData.outstandingLoan}
            onChange={handleChange('outstandingLoan')}
            error={!!errors.outstandingLoan}
            helperText={errors.outstandingLoan || 'Enter amount in SGD'}
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
    </Box>
  );
};