// src/components/DashboardLayout.tsx (UPDATED)
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
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CircularProgress from '@mui/material/CircularProgress';

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { 
    text: 'Dashboard', 
    href: '/', 
    icon: <DashboardIcon />,
    description: 'Overview & metrics'
  },
  { 
    text: 'Helpers', 
    href: '/helpers', 
    icon: <GroupIcon />,
    description: 'Manage domestic helpers'
  },
  { 
    text: 'Incidents', 
    href: '/incidents', 
    icon: <ReportProblemIcon />,
    description: 'Track issues & problems',
    badge: 'new'
  },
  { 
    text: 'Users', 
    href: '/users', 
    icon: <AdminPanelSettingsIcon />,
    description: 'User & staff management'
  },
  { 
    text: 'Settings', 
    href: '/settings', 
    icon: <SettingsIcon />,
    description: 'App configuration'
  },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActiveRoute = (href: string) => {
    if (href === '/') return router.pathname === '/';
    // Handle both /staff and /users routes as active for Users
    if (href === '/users') {
      return router.pathname.startsWith('/users') || router.pathname.startsWith('/staff');
    }
    return router.pathname.startsWith(href);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ overflow: 'auto', flex: 1, px: 1 }}>
        <List sx={{ py: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={item.description} placement="right" arrow>
                <ListItemButton
                  selected={isActiveRoute(item.href)}
                  onClick={() => {
                    router.push(item.href);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      fontWeight: 600,
                      transform: 'translateX(4px)',
                      '&:hover': {
                        backgroundColor: '#e0f2fe',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#0284c7',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.badge ? (
                      <Badge 
                        badgeContent={item.badge} 
                        color="error" 
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            right: -2,
                            top: 2,
                          },
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    secondary={isActiveRoute(item.href) ? item.description : null}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      sx: { 
                        color: '#0284c7',
                        fontWeight: 500,
                        mt: 0.5
                      }
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Box sx={{ p: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout} 
            disabled={loggingOut}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                '& .MuiListItemIcon-root': {
                  color: '#dc2626',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            {loggingOut
              ? <CircularProgress size={20} />
              : <ListItemText primary="Logout" />
            }
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={600}>
              Bibik2go.sg
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Paper
              sx={{
                px: 2,
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
                minWidth: 200,
                '&:hover': {
                  backgroundColor: '#e2e8f0',
                },
                transition: 'background-color 0.2s',
              }}
              elevation={0}
            >
              <SearchIcon sx={{ mr: 1, fontSize: 20, color: '#6b7280' }} />
              <InputBase 
                placeholder="Search..." 
                sx={{ 
                  fontSize: 14,
                  flex: 1,
                  '& input::placeholder': {
                    opacity: 0.7,
                  },
                }} 
              />
            </Paper>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                bgcolor: '#0284c7',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#0369a1',
                },
                transition: 'background-color 0.2s',
              }}
            >
              A
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e5e7eb',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e5e7eb',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3 },
          py: 3,
          mt: 8, // Account for AppBar height
          backgroundColor: '#f9fafb',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;