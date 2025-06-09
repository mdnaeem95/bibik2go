// src/components/helpers/steps/ReviewStep.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { NewHelperFormData } from '@/hooks/useNewHelperForm';

interface ReviewStepProps {
  formData: NewHelperFormData;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon /> Review & Submit
      </Typography>

      {/* Helper Summary */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          Helper Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Name:</strong> {formData.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Employer:</strong> {formData.currentEmployer}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Employment Start:</strong>{' '}
              {formData.employmentStartDate 
                ? new Date(formData.employmentStartDate).toLocaleDateString() 
                : 'Not specified'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Total Employers:</strong> {formData.totalEmployers}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>EA Officer:</strong> {formData.eaOfficer}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Outstanding Loan:</strong> ${Number(formData.outstandingLoan).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Incident Summary */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          Initial Incident
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Date:</strong>{' '}
              {formData.incidentDate 
                ? new Date(formData.incidentDate).toLocaleDateString() 
                : 'Not specified'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Reported by:</strong> {formData.reportedBy}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Severity:</strong>{' '}
              <Chip
                label={formData.severity}
                size="small"
                color={
                  formData.severity === 'Low' 
                    ? 'success' 
                    : formData.severity === 'Medium' 
                    ? 'warning' 
                    : 'error'
                }
              />
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              <strong>Status:</strong>{' '}
              <Chip
                label={formData.status}
                size="small"
                color={
                  formData.status === 'Resolved' 
                    ? 'success' 
                    : formData.status === 'Under Review' 
                    ? 'warning' 
                    : 'error'
                }
              />
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2">
              <strong>Description:</strong> {formData.incidentDescription}
            </Typography>
          </Grid>
          {formData.resolution && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                <strong>Resolution:</strong> {formData.resolution}
              </Typography>
            </Grid>
          )}
        </Grid>

        {formData.mediaFiles.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Media Files:</strong> {formData.mediaFiles.length} file(s) uploaded
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.mediaFiles.map((file) => (
                <Chip
                  key={file.id}
                  label={`${file.type === 'image' ? '📸' : '🎥'} ${
                    file.name.substring(0, 20)
                  }${file.name.length > 20 ? '...' : ''}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};