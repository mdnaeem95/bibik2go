// src/components/settings/ProfileTab.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';
import { SessionUser } from '@/lib/session';

interface Props {
  user: SessionUser;
}

export default function ProfileTab({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: user.username,
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      console.log('Failed to update profile: ', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, px: 3 }}>
      <Typography variant="h6" gutterBottom>
        Profile Information
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid>
            <TextField
              label="Display Name"
              fullWidth
              value={profileForm.displayName}
              onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
            />
          </Grid>
          
          <Grid>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={profileForm.email}
              onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="admin@bibik2go.sg"
            />
          </Grid>

          <Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Change Password
            </Typography>
          </Grid>

          <Grid>
            <TextField
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={profileForm.currentPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
          </Grid>

          <Grid>
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
            />
          </Grid>

          <Grid>
            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={profileForm.confirmPassword}
              onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </Grid>

          <Grid>
            <FormControlLabel
              control={
                <Switch
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
              }
              label="Show passwords"
            />
          </Grid>

          <Grid>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}