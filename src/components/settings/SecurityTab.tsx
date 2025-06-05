// src/components/settings/SecurityTab.tsx
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
} from '@mui/material';

export default function SecurityTab() {
  return (
    <Box sx={{ maxWidth: 800, px: 3 }}>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        These security features help protect your application and data.
      </Alert>

      <Grid container spacing={3}>
        <Grid>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Session Management
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure session timeout and security policies.
              </Typography>
              
              <FormControl sx={{ mb: 2, minWidth: 200 }}>
                <InputLabel>Session Timeout</InputLabel>
                <Select defaultValue="24" label="Session Timeout">
                  <MenuItem value="1">1 hour</MenuItem>
                  <MenuItem value="8">8 hours</MenuItem>
                  <MenuItem value="24">24 hours</MenuItem>
                  <MenuItem value="168">1 week</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch defaultChecked />}
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
                <ListItem>
                  <ListItemText 
                    primary="Successful login"
                    secondary="Today at 9:15 AM from 192.168.1.100"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Password changed"
                    secondary="Yesterday at 3:22 PM"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Data export: Helpers"
                    secondary="Dec 20, 2024 at 11:45 AM"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}