/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { AddIncidentFormData } from '@/hooks/useAddIncidentForm';
import { SEVERITY_OPTIONS } from '@/constants';

interface Props {
  formData: AddIncidentFormData;
  errors: Record<string, string | undefined>;
  onChange: (field: keyof AddIncidentFormData, value: any) => void;
}

export const IncidentDetailsStep: React.FC<Props> = ({
  formData,
  errors,
  onChange,
}) => {
  const selectedSeverity = SEVERITY_OPTIONS.find(s => s.value === formData.severity);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DescriptionIcon /> Incident Details
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Incident Date"
            type="date"
            value={formData.incidentDate}
            onChange={(e) => onChange('incidentDate', e.target.value)}
            error={!!errors.incidentDate}
            helperText={errors.incidentDate}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Incident Description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || `${formData.description.length}/500 characters`}
            required
            fullWidth
            multiline
            rows={4}
            placeholder="Provide a detailed description of what happened..."
            inputProps={{ maxLength: 500 }}
          />

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
                        color={option.color as any} 
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

          <TextField
            label="Reported By"
            value={formData.reportedBy}
            onChange={(e) => onChange('reportedBy', e.target.value)}
            error={!!errors.reportedBy}
            helperText={errors.reportedBy}
            required
            fullWidth
          />
        </CardContent>
      </Card>
    </Box>
  );
};