// src/components/MediaUpload.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Alert,
  Grid,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Image from 'next/image';

export interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'video';
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadProgress?: number;
  isUploading?: boolean;
  driveFileId?: string;
}

interface MediaUploadProps {
  value: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number;
  helperName?: string;
  helperCurrentEmployer?: string;
  incidentId?: string;
  disabled?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 10,
  maxSizePerFile = 50 * 1024 * 1024, // 50MB
  helperName,
  helperCurrentEmployer,
  incidentId,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const uploadFile = async (file: File): Promise<MediaFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (incidentId) formData.append('incidentId', incidentId);
    if (helperName) formData.append('helperName', helperName);
    if (helperCurrentEmployer) formData.append('helperCurrentEmployer', helperCurrentEmployer);
    formData.append('description', `${file.name} - Incident media`);

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    
    return {
      id: result.id,
      name: result.name,
      size: parseInt(result.size) || file.size,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      mimeType: result.mimeType,
      url: result.webViewLink,
      thumbnailUrl: result.thumbnailLink,
      driveFileId: result.driveFileId,
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;
    
    const remainingSlots = maxFiles - value.length;
    const filesToUpload = acceptedFiles.slice(0, remainingSlots);
    
    if (acceptedFiles.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more files can be uploaded`);
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Validate file size
        if (file.size > maxSizePerFile) {
          toast.error(`${file.name} is too large (max ${Math.round(maxSizePerFile / 1024 / 1024)}MB)`);
          return null;
        }

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast.error(`${file.name} is not a valid image or video file`);
          return null;
        }

        try {
          const uploadedFile = await uploadFile(file);
          toast.success(`${file.name} uploaded successfully`);
          return uploadedFile;
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((file): file is MediaFile => file !== null);
      
      onChange([...value, ...successfulUploads]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxFiles, maxSizePerFile, disabled, incidentId, helperName, helperCurrentEmployer]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.webm'],
    },
    disabled: disabled || uploading || value.length >= maxFiles,
  });

  const removeFile = async (fileToRemove: MediaFile) => {
    try {
      if (fileToRemove.driveFileId) {
        await fetch(`/api/media/${fileToRemove.driveFileId}`, {
          method: 'DELETE',
        });
      }
      onChange(value.filter(file => file.id !== fileToRemove.id));
      toast.success('File removed');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUploadMore = value.length < maxFiles && !disabled;

  return (
    <Box>
      {/* Upload Area */}
      {canUploadMore && (
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            border: isDragActive ? '2px dashed #2196f3' : '2px dashed #e0e0e0',
            backgroundColor: isDragActive ? '#f3f9ff' : '#fafafa',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: uploading ? '#e0e0e0' : '#2196f3',
              backgroundColor: uploading ? '#fafafa' : '#f8f9fa',
            },
          }}
        >
          <CardContent>
            <Box
              {...getRootProps()}
              sx={{
                textAlign: 'center',
                py: 4,
                px: 2,
              }}
            >
              <input {...getInputProps()} />
              
              {uploading ? (
                <Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Uploading files...
                  </Typography>
                  <LinearProgress sx={{ mt: 2, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Please wait while files are being uploaded to Google Drive
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Or click to select files
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Images and videos only • Max {Math.round(maxSizePerFile / 1024 / 1024)}MB per file • {value.length}/{maxFiles} files
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" component="span">
                      Select Files
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {value.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Uploaded Files ({value.length}/{maxFiles})
          </Typography>
          
          <Grid container spacing={2}>
            {value.map((file) => (
              <Grid key={file.id}>
                <Card variant="outlined" sx={{ position: 'relative' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {file.type === 'image' ? (
                        <ImageIcon color="primary" />
                      ) : (
                        <VideoLibraryIcon color="secondary" />
                      )}
                      <Chip
                        label={file.type}
                        size="small"
                        color={file.type === 'image' ? 'primary' : 'secondary'}
                      />
                    </Box>
                    
                    <Typography variant="body2" fontWeight={500} noWrap title={file.name}>
                      {file.name}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setPreviewFile(file)}
                      >
                        Preview
                      </Button>
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeFile(file)}
                        disabled={uploading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {value.length === 0 && !canUploadMore && (
        <Alert severity="info">
          No media files uploaded yet. Use the upload area above to add photos and videos.
        </Alert>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewFile?.name}
        </DialogTitle>
        <DialogContent>
          {previewFile && (
            <Box textAlign="center">
              {previewFile.type === 'image' ? (
                <Image
                  src={previewFile.url}
                  alt={previewFile.name}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              ) : (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                >
                  <source src={previewFile.url} type={previewFile.mimeType} />
                  Your browser does not support the video tag.
                </video>
              )}
              
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Size: {formatFileSize(previewFile.size)} • Type: {previewFile.mimeType}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>Close</Button>
          {previewFile && (
            <Button
              href={previewFile.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Drive
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaUpload;