/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MediaUpload from '@/components/MediaUpload';
import { AddIncidentFormData } from '@/hooks/useAddIncidentForm';

interface Props {
  formData: AddIncidentFormData;
  helperName?: string;
  helperCurrentEmployer?: string;
  onChange: (field: keyof AddIncidentFormData, value: any) => void;
}

export const MediaUploadStep: React.FC<Props> = ({
  formData,
  helperName,
  helperCurrentEmployer,
  onChange,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CameraAltIcon /> Add Photos & Videos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload photos and videos related to this incident. Files will be stored securely in Google Drive.
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <MediaUpload
            value={formData.mediaFiles}
            onChange={(files) => onChange('mediaFiles', files)}
            maxFiles={10}
            maxSizePerFile={50 * 1024 * 1024}
            helperName={helperName}
            helperCurrentEmployer={helperCurrentEmployer}
            incidentId={`temp_${Date.now()}`}
          />
        </CardContent>
      </Card>

      {formData.mediaFiles.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{formData.mediaFiles.length} file(s) uploaded.</strong> These will be linked to the incident for future reference.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};