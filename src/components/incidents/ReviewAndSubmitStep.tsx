/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { AddIncidentFormData } from '@/hooks/useAddIncidentForm';
import { STATUS_OPTIONS } from '@/constants/';

interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
}

interface Props {
  formData: AddIncidentFormData;
  selectedHelper?: Helper;
  errors: Record<string, string | undefined>;
  onChange: (field: keyof AddIncidentFormData, value: any) => void;
}

export const ReviewAndSubmitStep: React.FC<Props> = ({
  formData,
  selectedHelper,
  errors,
  onChange,
}) => {
  const selectedStatus = STATUS_OPTIONS.find(s => s.value === formData.status);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PriorityHighIcon /> Review & Submit
      </Typography>

      {/* Status Selection */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <FormControl required fullWidth sx={{ mb: 2 }}>
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
              {selectedStatus?.description}
            </FormHelperText>
          </FormControl>

          {formData.status === 'Resolved' && (
            <TextField
              label="Resolution Details"
              value={formData.resolution}
              onChange={(e) => onChange('resolution', e.target.value)}
              error={!!errors.resolution}
              helperText={errors.resolution}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe how this incident was resolved..."
            />
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Incident Summary
          </Typography>
          <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
            <Typography variant="body2">
              <strong>Helper:</strong> {selectedHelper?.name} ({selectedHelper?.currentEmployer})
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong> {new Date(formData.incidentDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              <strong>Severity:</strong> {formData.severity}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {formData.status}
            </Typography>
            <Typography variant="body2">
              <strong>Reported by:</strong> {formData.reportedBy}
            </Typography>
            <Typography variant="body2">
              <strong>Description:</strong> {formData.description}
            </Typography>
          </Box>
          
          {formData.mediaFiles.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                <strong>Media Files:</strong> {formData.mediaFiles.length} file(s) uploaded
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {formData.mediaFiles.map((file) => (
                  <Chip
                    key={file.id}
                    label={`${file.type === 'image' ? '📸' : '🎥'} ${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};