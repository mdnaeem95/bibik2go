/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { NewHelperFormData } from '@/hooks/useNewHelperForm';
import { SEVERITY_OPTIONS, STATUS_OPTIONS } from '@/constants/';

interface IncidentDetailsStepProps {
  formData: NewHelperFormData;
  errors: Record<string, string | undefined>;
  onChange: (field: keyof NewHelperFormData, value: any) => void;
}

export const IncidentDetailsStep: React.FC<IncidentDetailsStepProps> = ({
  formData,
  errors,
  onChange,
}) => {
  const handleChange = (field: keyof NewHelperFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(field, e.target.value);
  };

  const selectedSeverity = SEVERITY_OPTIONS.find(s => s.value === formData.severity);
  const selectedStatus = STATUS_OPTIONS.find(s => s.value === formData.status);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReportProblemIcon /> Initial Incident Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Document the incident or problem that brought this helper to your attention
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Incident Date"
            type="date"
            value={formData.incidentDate}
            onChange={handleChange('incidentDate')}
            error={!!errors.incidentDate}
            helperText={errors.incidentDate}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Reported By"
            value={formData.reportedBy}
            onChange={handleChange('reportedBy')}
            error={!!errors.reportedBy}
            helperText={errors.reportedBy}
            required
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Incident Description"
            value={formData.incidentDescription}
            onChange={handleChange('incidentDescription')}
            error={!!errors.incidentDescription}
            helperText={errors.incidentDescription || `${formData.incidentDescription.length}/500 characters`}
            required
            fullWidth
            multiline
            rows={4}
            placeholder="Provide a detailed description of what happened..."
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl required fullWidth>
            <InputLabel>Severity Level</InputLabel>
            <Select
              value={formData.severity}
              label="Severity Level"
              onChange={(e) => onChange('severity', e.target.value)}
            >
              {SEVERITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={option.value} 
                        color={option.color} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {selectedSeverity?.description}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl required fullWidth>
            <InputLabel>Initial Status</InputLabel>
            <Select
              value={formData.status}
              label="Initial Status"
              onChange={(e) => onChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={option.value} 
                        color={option.color} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {selectedStatus?.description}
            </FormHelperText>
          </FormControl>
        </Grid>

        {formData.status === 'Resolved' && (
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Resolution Details"
              value={formData.resolution}
              onChange={handleChange('resolution')}
              error={!!errors.resolution}
              helperText={errors.resolution}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe how this incident was resolved..."
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};