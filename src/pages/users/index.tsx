/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import {
  Box, Typography, Button, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Card, CardContent, Grid, Avatar, Tooltip,
  Menu, Switch, FormControlLabel, Divider, InputAdornment,
  Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import type { SessionUser } from '@/lib/session';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: string;
  createdBy: string;
}

interface Props {
  user: SessionUser;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'staff' | 'viewer';
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const UsersPage: NextPage<Props> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        toast.error(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
          return;
        }
        if (res.status === 403) {
          toast.error('You don\'t have permission to create users.');
          return;
        }
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success('User created successfully!');
      setDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFormErrors({ general: message });
      toast.error(`Error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user status');
      }

      toast.success('User status updated!');
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user role');
      }

      toast.success('User role updated!');
      fetchUsers();
      handleCloseMenu();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully!');
      fetchUsers();
      handleCloseMenu();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'staff': return 'primary';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettingsIcon />;
      case 'staff': return <PersonIcon />;
      case 'viewer': return <VisibilityIcon />;
      default: return <PersonIcon />;
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, selectedUser: User) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(selectedUser);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleFieldChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    //@ts-expect-error expecting it to fail
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: '#f44336' };
    if (strength <= 3) return { strength, label: 'Fair', color: '#ff9800' };
    if (strength <= 4) return { strength, label: 'Good', color: '#2196f3' };
    return { strength, label: 'Strong', color: '#4caf50' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  if (user.role !== 'admin') {
    return (
      <DashboardLayout>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>Access Denied</Typography>
          <Typography>You need admin privileges to manage users.</Typography>
        </Paper>
      </DashboardLayout>
    );
  }

  const adminUsers = users.filter(u => u.role === 'admin');
  const activeUsers = users.filter(u => u.status === 'active');

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage system users and their access permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            size="large"
          >
            Add User
          </Button>
        </Box>

        {/* User Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid>
            <Card sx={{ bgcolor: '#f0f9ff', border: '1px solid #0284c7' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#0284c7' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="primary">{users.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Users</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #22c55e' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#22c55e' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: '#22c55e' }}>{activeUsers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Active Users</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ bgcolor: '#fef3c7', border: '1px solid #f59e0b' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b' }}>
                  <AdminPanelSettingsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: '#f59e0b' }}>{adminUsers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Admins</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : users.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No users found</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by creating your first user account
          </Typography>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Add First User
          </Button>
        </Paper>
      ) : (
        <Paper elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: getRoleColor(u.role) }}>
                        {getRoleIcon(u.role)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {u.username}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {u.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getRoleIcon(u.role)}
                      label={u.role.charAt(0).toUpperCase() + u.role.slice(1)} 
                      color={getRoleColor(u.role) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={u.status === 'active'}
                          onChange={() => handleStatusToggle(u.id, u.status)}
                          size="small"
                        />
                      }
                      label={
                        <Chip 
                          label={u.status} 
                          color={getStatusColor(u.status) as any}
                          size="small" 
                        />
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {u.createdBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="More actions">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleOpenMenu(e, u)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleRoleChange(selectedUser?.id as string, 'admin')}>
          <AdminPanelSettingsIcon sx={{ mr: 1 }} />
          Make Admin
        </MenuItem>
        <MenuItem onClick={() => handleRoleChange(selectedUser?.id as string, 'staff')}>
          <PersonIcon sx={{ mr: 1 }} />
          Make Staff
        </MenuItem>
        <MenuItem onClick={() => handleRoleChange(selectedUser?.id as string, 'viewer')}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Make Viewer
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteUser(selectedUser?.id as string)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Create User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon />
            Add New User
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {formErrors.general && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {formErrors.general}
            </Alert>
          )}

          <TextField
            label="Username"
            sx={{ mt: 1 }}
            value={formData.username}
            onChange={handleFieldChange('username')}
            error={!!formErrors.username}
            helperText={formErrors.username || 'Unique identifier for login'}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleFieldChange('email')}
            error={!!formErrors.email}
            helperText={formErrors.email || 'Contact email for the user'}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleFieldChange('password')}
            error={!!formErrors.password}
            helperText={
              formErrors.password || 
              (formData.password ? `Strength: ${passwordStrength.label}` : 'Minimum 8 characters with uppercase, lowercase, and number')
            }
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            FormHelperTextProps={{
              sx: { color: formData.password && !formErrors.password ? passwordStrength.color : undefined }
            }}
          />

          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleFieldChange('confirmPassword')}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {formData.confirmPassword && (
                    <Box sx={{ mr: 1 }}>
                      {passwordsMatch ? (
                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      ) : (
                        <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
                      )}
                    </Box>
                  )}
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
            >
              <MenuItem value="viewer">
                <Box display="flex" alignItems="center" gap={1}>
                  <VisibilityIcon fontSize="small" />
                  <Box>
                    <Typography variant="body2">Viewer</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Read-only access to view data
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="staff">
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" />
                  <Box>
                    <Typography variant="body2">Staff</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Can add/edit helpers & incidents
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="admin">
                <Box display="flex" alignItems="center" gap={1}>
                  <AdminPanelSettingsIcon fontSize="small" />
                  <Box>
                    <Typography variant="body2">Admin</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full system access & user management
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => {
            setDialogOpen(false);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUser} 
            variant="contained"
            disabled={submitting || !formData.username || !formData.email || !formData.password || !passwordsMatch}
            startIcon={submitting ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Use the new authentication system
  const authResult = await getAuthenticatedUser(context);
  
  if (authResult.redirect) {
    return { redirect: authResult.redirect };
  }

  // Only admins can access user management
  if (authResult.user?.role !== 'admin') {
    return {
      redirect: {
        destination: '/unauthorized',
        permanent: false,
      },
    };
  }

  return { 
    props: { 
      user: authResult.user 
    } 
  };
};

export default UsersPage;