// src/components/settings/DataManagementTab.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Download, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function DataManagementTab() {
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleExportData = async (type: string) => {
    setLoading(true);
    try {
      // TODO: Implement actual export functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${type} data exported successfully`);
    } catch (err) {
      toast.error(`Failed to export ${type} data`);
      console.log('Failed to export data: ', err)
    } finally {
      setLoading(false);
    }
  };

  const handleClearOldData = () => {
    setDeleteConfirmOpen(false);
    // TODO: Implement actual clear functionality
    toast.success('Old incidents cleared successfully');
  };

  return (
    <Box sx={{ maxWidth: 800, px: 3 }}>
      <Typography variant="h6" gutterBottom>
        Data Export & Backup
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Helpers Data
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Download all helper information including employment history and loan details.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<Download />}
                onClick={() => handleExportData('Helpers')}
                disabled={loading}
              >
                Export CSV
              </Button>
              <Button
                startIcon={<Download />}
                onClick={() => handleExportData('Helpers Excel')}
                disabled={loading}
              >
                Export Excel
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Incidents Data
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Download all incident reports with severity levels and resolutions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<Download />}
                onClick={() => handleExportData('Incidents')}
                disabled={loading}
              >
                Export CSV
              </Button>
              <Button
                startIcon={<Download />}
                onClick={() => handleExportData('Incidents Excel')}
                disabled={loading}
              >
                Export Excel
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Danger Zone
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            These actions are irreversible. Please proceed with caution.
          </Alert>

          <Card variant="outlined" sx={{ border: '1px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                Clear Old Incidents
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Permanently delete incident records older than 2 years. This action cannot be undone.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Clear Old Data
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Data Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete all incident records older than 2 years? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleClearOldData}
            color="error"
            variant="contained"
          >
            Delete Old Records
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}