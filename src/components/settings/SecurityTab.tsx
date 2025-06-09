// src/components/settings/SecurityTab.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import toast from 'react-hot-toast';

interface SessionSettings {
  sessionTimeout: number;
  lastActivity: number;
}

interface ActivityLog {
  action: string;
  timestamp: number;
  details: string;
}

export default function SecurityTab() {
  const [sessionSettings, setSessionSettings] = useState<SessionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requirePasswordConfirmation, setRequirePasswordConfirmation] = useState(true);

  const timeoutOptions = [
    { value: 1, label: '1 hour' },
    { value: 8, label: '8 hours' },
    { value: 24, label: '24 hours' },
    { value: 72, label: '3 days' },
    { value: 168, label: '1 week' },
  ];

  // Mock activity log for now - in real implementation, this would come from API
  const activityLog: ActivityLog[] = [
    {
      action: 'Successful login',
      timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      details: 'from 192.168.1.100',
    },
    {
      action: 'Session timeout updated',
      timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      details: 'Changed to 24 hours',
    },
    {
      action: 'Helper record created',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      details: 'Added: Maria Gomez',
    },
  ];

  useEffect(() => {
    fetchSessionSettings();
  }, []);

  const fetchSessionSettings = async () => {
    try {
      const response = await fetch('/api/session/settings');
      if (response.ok) {
        const data = await response.json();
        setSessionSettings(data);
      } else {
        toast.error('Failed to load session settings');
      }
    } catch (error) {
      console.error('Error fetching session settings:', error);
      toast.error('Failed to load session settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionTimeoutChange = async (event: SelectChangeEvent<number>) => {
    const newTimeout = event.target.value as number;
    setSaving(true);

    try {
      const response = await fetch('/api/session/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionTimeout: newTimeout }),
      });

      if (response.ok) {
        setSessionSettings(prev => prev ? { ...prev, sessionTimeout: newTimeout } : null);
        toast.success('Session timeout updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update session timeout');
      }
    } catch (error) {
      console.error('Error updating session timeout:', error);
      toast.error('Failed to update session timeout');
    } finally {
      setSaving(false);
    }
  };

  const getTimeUntilExpiry = () => {
    if (!sessionSettings) return null;
    
    const timeoutMs = sessionSettings.sessionTimeout * 60 * 60 * 1000;
    const timeSinceLastActivity = Date.now() - sessionSettings.lastActivity;
    const timeUntilExpiry = timeoutMs - timeSinceLastActivity;
    
    if (timeUntilExpiry <= 0) return 'Expired';
    
    const hours = Math.floor(timeUntilExpiry / (60 * 60 * 1000));
    const minutes = Math.floor((timeUntilExpiry % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        These security features help protect your application and data. Sessions will automatically expire after the configured timeout period.
      </Alert>

      <Grid container spacing={3}>
        <Grid>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Session Management
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure session timeout and security policies. You will be automatically logged out after the specified period of inactivity.
              </Typography>
              
              <FormControl sx={{ mb: 2, minWidth: 200 }} disabled={saving}>
                <InputLabel>Session Timeout</InputLabel>
                <Select 
                  value={sessionSettings?.sessionTimeout || 24} 
                  label="Session Timeout"
                  onChange={handleSessionTimeoutChange}
                >
                  {timeoutOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {saving && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Updating...</Typography>
                </Box>
              )}

              {sessionSettings && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Current session expires in: <Chip label={getTimeUntilExpiry()} size="small" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last activity: {formatTimestamp(sessionSettings.lastActivity)}
                  </Typography>
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch 
                    checked={requirePasswordConfirmation}
                    onChange={(e) => setRequirePasswordConfirmation(e.target.checked)}
                  />
                }
                label="Require password confirmation for sensitive actions"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Log
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Recent security events and system access logs.
              </Typography>
              
              <List>
                {activityLog.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={item.action}
                      secondary={`${getTimeAgo(item.timestamp)} ${item.details}`}
                    />
                  </ListItem>
                ))}
              </List>

              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => toast('Activity log export feature coming soon')}
              >
                Export Full Log
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}