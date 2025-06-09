import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Incident } from '@/types';
import { StatusChip } from '@/components/common/StatusChip';

interface IncidentCardProps {
  incident: Incident;
  helperName: string;
  helperEmployer: string;
  onViewHelper: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onView: () => void;
  userCanEdit: boolean;
  userCanDelete: boolean;
  isDeleting: boolean;
  navigationLoading: {
    viewHelper: string;
    viewIncident: string;
    editIncident: string;
  };
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  helperName,
  helperEmployer,
  onViewHelper,
  onEdit,
  onDelete,
  onView,
  userCanEdit,
  userCanDelete,
  isDeleting,
  navigationLoading,
}) => {
  return (
    <Card 
      sx={{ 
        height: 380,
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={onView}
    >
      <CardContent sx={{ 
        flex: 1, 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Header with chips and actions */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" gap={1} flexWrap="wrap">
            <StatusChip type="severity" value={incident.severity} />
            <StatusChip type="status" value={incident.status} />
          </Box>
          <Box display="flex" gap={0.5}>
            {/* View Helper */}
            <Tooltip title="View Helper Profile">
              <IconButton 
                size="small" 
                onClick={onViewHelper}
                disabled={navigationLoading.viewHelper === incident.id}
              >
                {navigationLoading.viewHelper === incident.id ? (
                  <CircularProgress size={16} />
                ) : (
                  <PersonIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            
            {/* Edit */}
            {userCanEdit ? (
              <Tooltip title="Edit Incident">
                <IconButton 
                  size="small" 
                  onClick={onEdit}
                  disabled={navigationLoading.editIncident === incident.id}
                >
                  {navigationLoading.editIncident === incident.id ? (
                    <CircularProgress size={16} />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Edit (Staff/Admin Only)">
                <span>
                  <IconButton size="small" disabled>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            
            {/* Delete */}
            {userCanDelete ? (
              <Tooltip title="Delete Incident">
                <IconButton 
                  size="small" 
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DeleteIcon fontSize="small" />
                  )}
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
            
            {/* View */}
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                onClick={onView}
                disabled={navigationLoading.viewIncident === incident.id}
              >
                {navigationLoading.viewIncident === incident.id ? (
                  <CircularProgress size={16} />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Helper Info */}
        <Typography 
          variant="h6" 
          gutterBottom 
          fontWeight={600}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {helperName}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          Employer: {helperEmployer}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Incident Details */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Date:</strong> {new Date(incident.incidentDate).toLocaleDateString()}
        </Typography>

        {/* Description with fixed height */}
        <Box sx={{ 
          height: '100px',
          overflow: 'hidden',
          mb: 2
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              display: '-webkit-box', 
              '-webkit-line-clamp': 4, 
              '-webkit-box-orient': 'vertical', 
              overflow: 'hidden',
              lineHeight: 1.5,
            }}
          >
            {incident.description}
          </Typography>
        </Box>

        {/* Footer - push to bottom */}
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '120px'
              }}
            >
              <strong>Reporter:</strong> {incident.reportedBy}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(incident.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};