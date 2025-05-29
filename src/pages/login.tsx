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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userError, setUserError] = useState('');
  const [passError, setPassError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // reset errors
    setUserError('');
    setPassError('');
    setGeneralError('');

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
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 2,
          bgcolor: '#ffffff',
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            bibik2go HR Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please log in to continue
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            variant="outlined"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!userError}
            helperText={userError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passError}
            helperText={passError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {generalError && (
            <Typography color="error" variant="body2" align="center">
              {generalError}
            </Typography>
          )}

          <Button type="submit" variant="contained" size="large">
            Log In
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
