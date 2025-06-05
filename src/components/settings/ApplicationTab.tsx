// src/components/settings/ApplicationTab.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import toast from 'react-hot-toast';

export default function ApplicationTab() {
  const [loading, setLoading] = useState(false);
  const [appSettings, setAppSettings] = useState({
    defaultHelperStatus: 'Active',
    itemsPerPage: 25,
    dateFormat: 'MM/DD/YYYY',
    currency: 'SGD',
    theme: 'light',
    notifications: true,
    autoBackup: false,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
      console.log('Failed to save settings: ', err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" gutterBottom>
        Application Preferences
      </Typography>

      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Grid container spacing={3} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Items Per Page</InputLabel>
                <Select
                  value={appSettings.itemsPerPage}
                  label="Items Per Page"
                  onChange={(e) => setAppSettings(prev => ({ ...prev, itemsPerPage: e.target.value as number }))}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={appSettings.dateFormat}
                  label="Date Format"
                  onChange={(e) => setAppSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={appSettings.currency}
                  label="Currency"
                  onChange={(e) => setAppSettings(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <MenuItem value="SGD">SGD (Singapore Dollar)</MenuItem>
                  <MenuItem value="USD">USD (US Dollar)</MenuItem>
                  <MenuItem value="MYR">MYR (Malaysian Ringgit)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Default Helper Status</InputLabel>
                <Select
                  value={appSettings.defaultHelperStatus}
                  label="Default Helper Status"
                  onChange={(e) => setAppSettings(prev => ({ ...prev, defaultHelperStatus: e.target.value }))}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 4, sm: 8, md: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Notifications & Features
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={appSettings.notifications}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                    />
                  }
                  label="Enable email notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={appSettings.autoBackup}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                    />
                  }
                  label="Automatic daily backups"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        
        <CardActions>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}