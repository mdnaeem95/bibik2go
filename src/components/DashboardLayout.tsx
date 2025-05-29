import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Avatar,
  InputBase,
  Paper,
  ListItemButton,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { text: 'Dashboard', href: '/', icon: <DashboardIcon /> },
  { text: 'Helpers', href: '/helpers', icon: <GroupIcon /> },
  { text: 'Staff', href: '/staff', icon: <BadgeIcon /> },
  { text: 'Settings', href: '/settings', icon: <SettingsIcon /> },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch ('/api/logout', { method: 'POST' });
    router.push('login');
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          color: '#111827',
          borderBottom: '1px solid #e5e7eb',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            Bibik2go.sg
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Paper
              sx={{
                px: 2,
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
              }}
              elevation={0}
            >
              <SearchIcon sx={{ mr: 1, fontSize: 20, color: '#6b7280' }} />
              <InputBase placeholder="Search" sx={{ fontSize: 14 }} />
            </Paper>
            <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mx: 1, mb: 0.5, borderRadius: 2 }}>
                <ListItemButton
                  selected={router.pathname === item.href}
                  onClick={() => router.push(item.href)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      fontWeight: 600,
                      '& .MuiListItemIcon-root': {
                        color: '#0284c7',
                      },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} disabled={loggingOut}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                {loggingOut
                  ? <CircularProgress size={20} />
                  : <ListItemText primary="Logout" />
                }
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: 5,
          mt: 5,
          mr: 3,
          mb: 5,
          backgroundColor: '#f9fafb',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
