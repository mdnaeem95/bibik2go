// src/pages/login.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Logo from "../assets/logo.png"
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userError, setUserError] = useState('');
  const [passError, setPassError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors and start loading
    setUserError('');
    setPassError('');
    setGeneralError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/');
        return;
      }

      const { message } = await res.json();
      if (res.status === 404) {
        setUserError(message);
      } else if (res.status === 401) {
        setPassError(message);
      } else {
        setGeneralError(message || 'Login failed');
      }
    } catch (error) {
      setGeneralError('Network error. Please try again.');
      console.log('Network error. Please try again. : ', error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 5,
          borderRadius: 4,
          bgcolor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
          }
        }}
      >
        {/* Logo Section */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image 
              src={Logo}
              alt="Bibik2Go Logo"
              style={{
                objectFit: 'contain',
              }}
              width={250}
              height={250}
            />
          </Box>
          
          <Typography 
            variant="h4" 
            fontWeight={700}
            sx={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            bibik2go
          </Typography>
          
          <Typography 
            variant="h6" 
            fontWeight={600}
            color="text.primary"
            sx={{ mb: 0.5 }}
          >
            HR Management Portal
          </Typography>
                    
          <Typography variant="body2" color="text.secondary">
            Please log in to access your dashboard
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Username"
            variant="outlined"
            required
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!userError}
            helperText={userError}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover': {
                  '& > fieldset': {
                    borderColor: '#06b6d4',
                  },
                },
                '&.Mui-focused': {
                  '& > fieldset': {
                    borderColor: '#06b6d4',
                  },
                },
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passError}
            helperText={passError}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover': {
                  '& > fieldset': {
                    borderColor: '#06b6d4',
                  },
                },
                '&.Mui-focused': {
                  '& > fieldset': {
                    borderColor: '#06b6d4',
                  },
                },
              },
            }}
          />

          {generalError && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#ffebee',
                border: '1px solid #ffcdd2',
              }}
            >
              <Typography color="error" variant="body2" align="center">
                {generalError}
              </Typography>
            </Box>
          )}

          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: loading 
                ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              boxShadow: loading 
                ? 'none'
                : '0 8px 24px rgba(6, 182, 212, 0.3)',
              '&:hover': {
                background: loading 
                  ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                  : 'linear-gradient(135deg, #0284c7 0%, #0e7490 100%)',
                boxShadow: loading 
                  ? 'none'
                  : '0 12px 32px rgba(6, 182, 212, 0.4)',
                transform: loading ? 'none' : 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>

        {/* Footer */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            © 2025 bibik2go.sg. All rights reserved.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}