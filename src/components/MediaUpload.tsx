// src/components/MediaUpload.tsx
import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Photo as PhotoIcon,
  Videocam as VideoIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  url: string;
  driveFileId: string;
  uploadedAt: string;
  thumbnailUrl?: string;
}

interface MediaUploadProps {
  value: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  disabled?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 10,
  maxSizePerFile = 50 * 1024 * 1024, // 50MB default
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;
    
    setError('');
    setUploading(true);

    // Check if adding these files would exceed the limit
    if (value.length + acceptedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. Please remove some files first.`);
      setUploading(false);
      return;
    }

    const newFiles: MediaFile[] = [];

    for (const file of acceptedFiles) {
      // Validate file size
      if (file.size > maxSizePerFile) {
        setError(`File "${file.name}" is too large. Maximum size is ${Math.round(maxSizePerFile / 1024 / 1024)}MB.`);
        continue;
      }

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        setError(`File "${file.name}" is not supported. Please upload images or videos only.`);
        continue;
      }

      try {
        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', isImage ? 'image' : 'video');

        // Track upload progress
        const fileId = `${Date.now()}-${Math.random()}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Upload to Google Drive via our API
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const uploadedFile = await response.json();
        
        // Create MediaFile object
        const mediaFile: MediaFile = {
          id: uploadedFile.id,
          name: file.name,
          type: isImage ? 'image' : 'video',
          size: file.size,
          url: uploadedFile.webViewLink,
          driveFileId: uploadedFile.driveFileId,
          uploadedAt: new Date().toISOString(),
          thumbnailUrl: uploadedFile.thumbnailLink,
        };

        newFiles.push(mediaFile);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      } catch (err) {
        console.error('Upload error:', err);
        setError(`Failed to upload "${file.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Update the parent component with new files
    onChange([...value, ...newFiles]);
    setUploading(false);
    
    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress({});
    }, 2000);

  }, [value, onChange, maxFiles, maxSizePerFile, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    disabled,
  });

  const handleRemoveFile = (fileId: string) => {
    onChange(value.filter(file => file.id !== fileId));
  };

  const handlePreviewFile = (file: MediaFile) => {
    setPreviewFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    return type === 'image' ? <PhotoIcon /> : <VideoIcon />;
  };

  return (
    <Box>
      {/* Upload Area */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            bgcolor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here...' : 'Upload Photos & Videos'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop files here, or click to select
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supported: Images (PNG, JPG, GIF) and Videos (MP4, MOV, AVI)
          <br />
          Max {maxFiles} files, up to {Math.round(maxSizePerFile / 1024 / 1024)}MB each
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" disabled={disabled || uploading}>
            Choose Files
          </Button>
        </Box>
      </Box>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading files...
          </Typography>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <LinearProgress 
              key={fileId} 
              variant="determinate" 
              value={progress} 
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* File List */}
      {value.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Uploaded Files ({value.length}/{maxFiles})
          </Typography>
          <Grid container spacing={2}>
            {value.map((file) => (
              <Grid key={file.id}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {getFileIcon(file.type)}
                      <Chip
                        label={file.type}
                        size="small"
                        color={file.type === 'image' ? 'primary' : 'secondary'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" fontWeight={500} noWrap title={file.name}>
                      {file.name}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handlePreviewFile(file)}
                          title="Preview"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          href={file.url}
                          target="_blank"
                          title="Download"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveFile(file.id)}
                        disabled={disabled}
                        title="Remove"
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
              {previewFile.type === 'image' ? (
                <Image
                  src={previewFile.thumbnailUrl || previewFile.url}
                  alt={previewFile.name}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              ) : (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  preload="metadata"
                >
                  <source src={previewFile.url} />
                  Your browser does not support the video tag.
                </video>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>Close</Button>
          <Button 
            href={previewFile?.url} 
            target="_blank" 
            variant="outlined"
          >
            Open in Drive
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaUpload;