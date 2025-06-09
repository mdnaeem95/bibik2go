/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/helpers/IncidentCard.tsx (Updated with Navigation)
import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/router';
import { SessionUser, canDelete } from '@/lib/session';

interface Incident {
  id: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution?: string;
  createdAt: string;
}

interface Props {
  incident: Incident;
  user: SessionUser;
  onDelete: () => void;
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

export const IncidentCard: React.FC<Props> = ({ incident, user, onDelete }) => {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const userCanDelete = canDelete(user.role);

  const handleCardClick = async (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    setNavigating(true);
    try {
      await router.push(`/incidents/${incident.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setNavigating(false);
    }
  };

  const handleViewClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setNavigating(true);
    try {
      await router.push(`/incidents/${incident.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setNavigating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        '&:hover': { 
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
        cursor: navigating ? 'wait' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        ...(navigating && {
          opacity: 0.7,
        }),
      }}
      onClick={handleCardClick}
    >
      {navigating && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            p: 1,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Box display="flex" gap={1} mb={2} flexWrap="wrap" alignItems="center">
              <Chip 
                label={incident.severity} 
                color={getSeverityColor(incident.severity) as any}
                size="small" 
              />
              <Chip 
                label={incident.status} 
                color={getStatusColor(incident.status) as any}
                size="small" 
              />
              <Chip 
                label={new Date(incident.incidentDate).toLocaleDateString()}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box display="flex" gap={0.5}>
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                color="primary"
                onClick={handleViewClick}
                disabled={navigating}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {userCanDelete ? (
              <Tooltip title="Delete Incident">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={handleDeleteClick}
                  disabled={navigating}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Delete (Staff/Admin Only)">
                <span>
                  <IconButton size="small" disabled>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {incident.description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ color: 'text.secondary' }}>
          <Typography variant="body2">
            Reported by: <strong>{incident.reportedBy}</strong>
          </Typography>
          <Typography variant="body2">
            {new Date(incident.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        {incident.resolution && (
          <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Resolution:</strong>
            </Typography>
            <Typography variant="body2">
              {incident.resolution}
            </Typography>
          </Box>
        )}

        {/* Click hint */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            opacity: 0.5,
            transition: 'opacity 0.2s',
            '.MuiCard-root:hover &': {
              opacity: 1,
            },
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Click to view details
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};