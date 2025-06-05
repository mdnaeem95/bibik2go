// src/components/settings/ProfileTab.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Alert,
} from '@mui/material';
import { LockReset, Cancel } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { SessionUser } from '@/lib/session';

interface Props {
  user: SessionUser;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export default function ProfileTab({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState<UserProfile>({
    id: '',
    username: user.username,
    email: '',
    role: '',
    status: '',
    createdAt: '',
    createdBy: '',
  });

  const [profileForm, setProfileForm] = useState({
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const profile = await res.json();
        setProfileData(profile);
        setProfileForm({
          email: profile.email,
        });
      } catch (err) {
        toast.error('Failed to load profile data');
        console.log('Failed to load profile data: ', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      
      setProfileData(prev => ({ ...prev, ...profileForm }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      console.log('Failed to update profile: ', err)
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update password');
      }
      
      const result = await res.json();
      toast.success('Password updated successfully! Redirecting to login...');
      
      // If logout flag is returned, redirect to login
      if (result.logout) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordSection(false);
        setShowPassword(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordSection(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPassword(false);
  };

  if (profileLoading) {
    return (
      <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" gutterBottom>
        Profile Information
      </Typography>

      {/* Profile Information Card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <Box component="form" onSubmit={handleProfileSubmit}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid>
                <TextField
                  label="Username"
                  fullWidth
                  value={profileData.username}
                  disabled
                  variant="filled"
                />
              </Grid>
              
              <Grid>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>

              <Grid>
                <TextField
                  label="Role"
                  fullWidth
                  value={profileData.role}
                  disabled
                  variant="filled"
                />
              </Grid>

              <Grid>
                <TextField
                  label="Status"
                  fullWidth
                  value={profileData.status}
                  disabled
                  variant="filled"
                />
              </Grid>

              <Grid>
                <TextField
                  label="Created At"
                  fullWidth
                  value={profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : ''}
                  disabled
                  variant="filled"
                />
              </Grid>

              <Grid>
                <TextField
                  label="Created By"
                  fullWidth
                  value={profileData.createdBy}
                  disabled
                  variant="filled"
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardActions>
        </Box>
      </Card>

      {/* Password Section */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Password & Security
          </Typography>

          {!showPasswordSection ? (
            <Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Keep your account secure by updating your password regularly.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<LockReset />}
                onClick={() => setShowPasswordSection(true)}
              >
                Change Password
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Password must be at least 8 characters long and contain a mix of letters and numbers.
              </Alert>

              <Grid container spacing={3}>
                <Grid>
                  <TextField
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </Grid>

                <Grid>
                  <TextField
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </Grid>

                <Grid>
                  <TextField
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancelPasswordReset}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}