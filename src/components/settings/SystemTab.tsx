// src/components/settings/SystemTab.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function SystemTab() {
  const [systemSettings, setSystemSettings] = useState({
    eaOfficers: ['Officer Rahim', 'Officer Siti', 'Officer Alex', 'Officer Tan'],
    severityLevels: ['Low', 'Medium', 'High', 'Critical'],
    statusOptions: ['Open', 'Under Review', 'Resolved'],
  });

  const [newOfficer, setNewOfficer] = useState('');
  const [editingOfficer, setEditingOfficer] = useState<{index: number, name: string} | null>(null);

  const handleAddOfficer = () => {
    if (newOfficer.trim()) {
      setSystemSettings(prev => ({
        ...prev,
        eaOfficers: [...prev.eaOfficers, newOfficer.trim()]
      }));
      setNewOfficer('');
      toast.success('EA Officer added');
    }
  };

  const handleEditOfficer = (index: number) => {
    setEditingOfficer({ index, name: systemSettings.eaOfficers[index] });
  };

  const handleSaveOfficer = () => {
    if (editingOfficer) {
      setSystemSettings(prev => ({
        ...prev,
        eaOfficers: prev.eaOfficers.map((officer, index) => 
          index === editingOfficer.index ? editingOfficer.name : officer
        )
      }));
      setEditingOfficer(null);
      toast.success('EA Officer updated');
    }
  };

  const handleDeleteOfficer = (index: number) => {
    setSystemSettings(prev => ({
      ...prev,
      eaOfficers: prev.eaOfficers.filter((_, i) => i !== index)
    }));
    toast.success('EA Officer removed');
  };

  return (
    <Box sx={{ maxWidth: 800, px: 3 }}>
      <Typography variant="h6" gutterBottom>
        System Configuration
      </Typography>

      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            EA Officers Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Add New EA Officer"
              value={newOfficer}
              onChange={(e) => setNewOfficer(e.target.value)}
              fullWidth
              onKeyPress={(e) => e.key === 'Enter' && handleAddOfficer()}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddOfficer}
              disabled={!newOfficer.trim()}
            >
              Add
            </Button>
          </Box>

          <List>
            {systemSettings.eaOfficers.map((officer, index) => (
              <ListItem key={index} divider>
                {editingOfficer?.index === index ? (
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
                    <TextField
                      value={editingOfficer.name}
                      onChange={(e) => setEditingOfficer(prev => prev ? { ...prev, name: e.target.value } : null)}
                      fullWidth
                      size="small"
                    />
                    <Button size="small" onClick={handleSaveOfficer}>Save</Button>
                    <Button size="small" onClick={() => setEditingOfficer(null)}>Cancel</Button>
                  </Box>
                ) : (
                  <>
                    <ListItemText primary={officer} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleEditOfficer(index)}>
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteOfficer(index)} color="error">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          
          <Grid container spacing={2}>
            <Grid>
              <Box textAlign="center">
                <Chip label="Database: Online" color="success" />
              </Box>
            </Grid>
            <Grid>
              <Box textAlign="center">
                <Chip label="Sheets API: Connected" color="success" />
              </Box>
            </Grid>
            <Grid>
              <Box textAlign="center">
                <Chip label="Backups: Enabled" color="success" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}