/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  CircularProgress, 
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Alert,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { getAllIncidents, getAllHelpers } from '@/lib/sheets';

interface Incident {
  id: string;
  helperId: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution?: string;
  createdAt: string;
  mediaUrls?: string[];
}

interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
  eaOfficer: string;
}

interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  downloadUrl?: string;
}

interface Props {
  incident: Incident | null;
  helper: Helper | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Low': return 'success';
    case 'Medium': return 'warning';
    case 'High': return 'error';
    case 'Critical': return 'error';
    default: return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open': return 'error';
    case 'Under Review': return 'warning';
    case 'Resolved': return 'success';
    default: return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Open': return <ReportIcon />;
    case 'Under Review': return <PriorityHighIcon />;
    case 'Resolved': return <CheckCircleIcon />;
    default: return <ReportIcon />;
  }
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  
  try {
    const [allIncidents, allHelpers] = await Promise.all([
      getAllIncidents(),
      getAllHelpers(),
    ]);
    
    const incident = allIncidents.find((i) => i.id === id) || null;
    const helper = incident ? allHelpers.find((h) => h.id === incident.helperId) || null : null;

    if (!incident) {
      return { notFound: true };
    }

    return {
      props: { 
        incident: {
          ...incident,
          mediaUrls: [], // We'll fetch these client-side or add to your sheets
        }, 
        helper 
      },
    };
  } catch (error) {
    console.error('Error fetching incident:', error);
    return { notFound: true };
  }
};

export default function IncidentDetail({ incident, helper }: Props) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaFile | null>(null);

  // Fetch media files for this incident
  const fetchMediaFiles = async () => {
    if (!incident) return;
    
    setMediaLoading(true);
    try {
      const response = await fetch(`/api/incidents/${incident.id}/media`);
      if (response.ok) {
        const data = await response.json();
        console.log('Data', data);
        setMediaFiles(data.mediaFiles || []);
      } else {
        console.error('Failed to fetch media files');
        setMediaFiles([]);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
      setMediaFiles([]);
    } finally {
      setMediaLoading(false);
    }
  };

  React.useEffect(() => {
    if (incident) {
      fetchMediaFiles();
    }
  }, [incident]);

  const handleEdit = () => {
    router.push(`/incidents/${incident?.id}/edit`);
  };

  const handleDelete = async () => {
    if (!incident) return;
    
    try {
      await fetch(`/api/incidents/${incident.id}`, { method: 'DELETE' });
      toast.success('Incident deleted successfully!');
      router.push('/incidents');
    } catch (err) {
      console.error('Error deleting incident:', err);
      toast.error('Failed to delete incident');
    }
    setDeleteDialog(false);
  };

  const handleViewHelper = () => {
    router.push(`/helpers/${helper?.id}`);
  };

  const getMediaThumbnail = (mediaFile: MediaFile) => {
    if (mediaFile.type === 'image') {
      // For Google Drive images, convert view URL to thumbnail
      const fileId = mediaFile.url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w300` : mediaFile.url;
    }
    return mediaFile.thumbnailUrl || '/video-placeholder.png';
  };

  if (router.isFallback) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!incident || !helper) {
    return (
      <DashboardLayout>
        <Alert severity="error">Incident not found</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/incidents" 
          onClick={(e) => { e.preventDefault(); router.push('/incidents'); }}
          sx={{ cursor: 'pointer' }}
        >
          Incidents
        </Link>
        <Typography color="text.primary">Incident #{incident.id}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 4, mb: 3 }} elevation={2}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Incident #{incident.id}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              <Chip 
                icon={getStatusIcon(incident.status)}
                label={incident.status} 
                color={getStatusColor(incident.status) as any}
                variant="filled"
              />
              <Chip 
                label={incident.severity} 
                color={getSeverityColor(incident.severity) as any}
                variant="outlined"
              />
              <Chip 
                icon={<CalendarTodayIcon />}
                label={new Date(incident.incidentDate).toLocaleDateString()}
                variant="outlined"
              />
            </Box>
            <Typography variant="h6" color="text.secondary">
              Reported by {incident.reportedBy} on {new Date(incident.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialog(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Helper Information */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Helper Information
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<PersonIcon />}
                onClick={handleViewHelper}
              >
                View Profile
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid>
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong> {helper.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Current Employer:</strong> {helper.currentEmployer}
                </Typography>
              </Grid>
              <Grid>
                <Typography variant="body1" gutterBottom>
                  <strong>EA Officer:</strong> {helper.eaOfficer}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Incident Description */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Incident Description
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {incident.description}
            </Typography>
          </CardContent>
        </Card>

        {/* Resolution (if resolved) */}
        {incident.status === 'Resolved' && incident.resolution && (
          <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                Resolution
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {incident.resolution}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* Media Files Section */}
      <Paper sx={{ p: 4 }} elevation={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Media Files
          </Typography>
          <Chip 
            label={`${mediaFiles.length} file(s)`} 
            color="primary" 
            variant="outlined"
          />
        </Box>

        {mediaLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : mediaFiles.length === 0 ? (
          <Alert severity="info">
            No media files associated with this incident.
          </Alert>
        ) : (
          <ImageList variant="masonry" cols={4} gap={16}>
            {mediaFiles.map((mediaFile) => (
              <ImageListItem key={mediaFile.id}>
                <Card sx={{ position: 'relative', '&:hover .media-overlay': { opacity: 1 } }}>
                  {mediaFile.type === 'image' ? (
                    <img
                      src={getMediaThumbnail(mediaFile)}
                      alt={mediaFile.name}
                      style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
                      onClick={() => setSelectedMedia(mediaFile)}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'relative',
                        background: '#f5f5f5',
                        minHeight: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedMedia(mediaFile)}
                    >
                      <VideoLibraryIcon sx={{ fontSize: 64, color: '#666' }} />
                      <PlayArrowIcon 
                        sx={{ 
                          position: 'absolute', 
                          fontSize: 48, 
                          color: 'rgba(0,0,0,0.7)',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderRadius: '50%',
                          p: 1
                        }} 
                      />
                    </Box>
                  )}
                  
                  {/* Overlay with actions */}
                  <Box
                    className="media-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Tooltip title="View">
                      <IconButton 
                        color="primary" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                        onClick={() => setSelectedMedia(mediaFile)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Fullscreen">
                      <IconButton 
                        color="primary" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                        onClick={() => setFullscreenMedia(mediaFile)}
                      >
                        <FullscreenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton 
                        color="primary" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                        component="a"
                        href={mediaFile.downloadUrl || mediaFile.url}
                        target="_blank"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <ImageListItemBar
                    title={
                      <Box display="flex" alignItems="center" gap={1}>
                        {mediaFile.type === 'image' ? <PhotoIcon /> : <VideoLibraryIcon />}
                        <Typography variant="body2" noWrap>
                          {mediaFile.name}
                        </Typography>
                      </Box>
                    }
                    sx={{ 
                      '& .MuiImageListItemBar-title': { 
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                </Card>
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Paper>

      {/* Media Preview Dialog */}
      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMedia?.name}
        </DialogTitle>
        <DialogContent>
          {selectedMedia && (
            <Box textAlign="center">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              ) : (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                >
                  <source src={selectedMedia.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMedia(null)}>Close</Button>
          {selectedMedia && (
            <Button
              href={selectedMedia.url}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
            >
              Open in Google Drive
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Fullscreen Media Dialog */}
      <Dialog
        open={!!fullscreenMedia}
        onClose={() => setFullscreenMedia(null)}
        maxWidth={false}
        fullScreen
        sx={{ '& .MuiDialog-paper': { bgcolor: 'black' } }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {fullscreenMedia && (
            fullscreenMedia.type === 'image' ? (
              <img
                src={fullscreenMedia.url}
                alt={fullscreenMedia.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <video
                controls
                autoPlay
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              >
                <source src={fullscreenMedia.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button 
            onClick={() => setFullscreenMedia(null)} 
            sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Incident</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this incident? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}