// src/components/DashboardLayout.tsx (UPDATED WITH FUNCTIONAL SEARCH)
import React, { ReactNode, useRef, useEffect } from 'react';
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
  ClickAwayListener,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ClearIcon from '@mui/icons-material/Clear';
import CircularProgress from '@mui/material/CircularProgress';

import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { SearchResults } from '@/components/common/SearchResults';

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
  
  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    results,
    loading: searchLoading,
    isOpen: searchOpen,
    setIsOpen: setSearchOpen,
    clearSearch,
  } = useGlobalSearch();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchQuery.length > 0) {
      setSearchOpen(true);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    if (value.length === 0) {
      setSearchOpen(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    clearSearch();
    searchInputRef.current?.focus();
  };

  // Handle click away from search
  const handleSearchClickAway = () => {
    if (!searchQuery.trim()) {
      setSearchOpen(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [searchOpen, setSearchOpen]);

  // Handle keyboard navigation (Ctrl/Cmd + K to focus search)
  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [setSearchOpen]);

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
            {/* Enhanced Search Bar */}
            <ClickAwayListener onClickAway={handleSearchClickAway}>
              <Box sx={{ position: 'relative' }} ref={searchContainerRef}>
                <Paper
                  sx={{
                    px: 2,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: searchOpen ? '#ffffff' : '#f1f5f9',
                    borderRadius: '12px',
                    minWidth: 250,
                    maxWidth: isMobile ? 200 : 350,
                    border: searchOpen ? '2px solid #0284c7' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: searchOpen ? '#ffffff' : '#e2e8f0',
                    },
                    transition: 'all 0.2s',
                    boxShadow: searchOpen ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  }}
                  elevation={searchOpen ? 4 : 0}
                >
                  <SearchIcon sx={{ mr: 1, fontSize: 20, color: '#6b7280' }} />
                  <InputBase 
                    ref={searchInputRef}
                    placeholder="Search helpers & incidents... (⌘K)" 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    sx={{ 
                      fontSize: 14,
                      flex: 1,
                      '& input::placeholder': {
                        opacity: 0.7,
                      },
                    }} 
                  />
                  {searchQuery && (
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ 
                        ml: 1, 
                        p: 0.5,
                        color: '#6b7280',
                        '&:hover': {
                          color: '#374151',
                          bgcolor: '#f3f4f6',
                        },
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                </Paper>

                {/* Search Results */}
                {searchOpen && (
                  <SearchResults
                    results={results}
                    loading={searchLoading}
                    query={searchQuery}
                    onClose={() => setSearchOpen(false)}
                    onResultClick={() => {
                      clearSearch();
                      searchInputRef.current?.blur();
                    }}
                  />
                )}
              </Box>
            </ClickAwayListener>

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

/*
Key Features Added:
1. **Global Search**: Search across helpers and incidents by name, employer, problem, description, etc.
2. **Smart Results**: Results are grouped by type (helpers/incidents) with context
3. **Keyboard Navigation**: Ctrl/Cmd + K to focus search, Escape to close
4. **Responsive Design**: Works on both desktop and mobile
5. **Real-time Search**: Debounced search with loading states
6. **Click Away**: Close results when clicking outside
7. **Clear Button**: Easy way to clear search query
8. **Visual Feedback**: Enhanced styling when search is active

Usage:
- Type at least 2 characters to start searching
- Results show helpers and incidents with matched fields highlighted
- Click any result to navigate to that page
- Use keyboard shortcuts for better UX
*/