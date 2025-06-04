/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import {
  Box, Typography, Button, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Card, CardContent, Grid, Avatar, Tooltip,
  Menu, Switch, FormControlLabel, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { sessionOptions, SessionUser } from '@/lib/session';

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

const UsersPage: NextPage<Props> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff' as const,
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      toast.success('User created successfully!');
      setDialogOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success('User status updated!');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
      console.log('Failed to update user status', err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      toast.success('User role updated!');
      fetchUsers();
      handleCloseMenu();
    } catch (err) {
      toast.error('Failed to update user role');
      console.log('Failed to update user role', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      toast.success('User deleted successfully!');
      fetchUsers();
      handleCloseMenu();
    } catch (err) {
      toast.error('Failed to delete user');
      console.log('Failed to delete user', err);
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

  if (user.role !== 'admin') {
    return (
      <DashboardLayout>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need admin privileges to manage users.</Typography>
        </Paper>
      </DashboardLayout>
    );
  }

  const adminUsers = users.filter(u => u.role === 'admin');
//   const staffUsers = users.filter(u => u.role === 'staff');
//   const viewerUsers = users.filter(u => u.role === 'viewer');
  const activeUsers = users.filter(u => u.status === 'active');

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>User Management</Typography>
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
                  <AdminPanelSettingsIcon />
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

      {users.length === 0 ? (
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
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
            fullWidth
            helperText="User will receive these credentials to log in"
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
                  Viewer - Read-only access
                </Box>
              </MenuItem>
              <MenuItem value="staff">
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" />
                  Staff - Can add/edit helpers & incidents
                </Box>
              </MenuItem>
              <MenuItem value="admin">
                <Box display="flex" alignItems="center" gap={1}>
                  <AdminPanelSettingsIcon fontSize="small" />
                  Admin - Full system access
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
  if (!session.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { user: session.user } };
};

export default UsersPage;