// src/hooks/useSessionCheck.ts
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

interface UseSessionCheckOptions {
  checkInterval?: number; // milliseconds
  enabled?: boolean;
}

export function useSessionCheck(options: UseSessionCheckOptions = {}) {
  const { checkInterval = 5 * 60 * 1000, enabled = true } = options; // Check every 5 minutes by default
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(Date.now());

  const checkSession = async () => {
    try {
      const response = await fetch('/api/session/check', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 401) {
        const data = await response.json();
        if (data.expired) {
          toast.error('Your session has expired due to inactivity. Please log in again.');
        } else {
          toast.error('Authentication required. Please log in.');
        }
        
        // Clear any existing intervals
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Redirect to login
        router.push('/login');
        return false;
      }

      if (!response.ok) {
        console.warn('Session check failed:', response.status);
        return false;
      }

      lastCheckRef.current = Date.now();
      return true;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  };

  const startSessionCheck = () => {
    if (!enabled || intervalRef.current) return;

    // Check immediately
    checkSession();

    // Set up periodic checks
    intervalRef.current = setInterval(checkSession, checkInterval);
  };

  const stopSessionCheck = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // Don't check session on login page
    if (router.pathname === '/login') return;

    startSessionCheck();

    // Check session when user returns to tab (handles browser sleeping)
    const handleVisibilityChange = () => {
      if (!document.hidden && enabled) {
        const timeSinceLastCheck = Date.now() - lastCheckRef.current;
        // If it's been more than the check interval since last check, check now
        if (timeSinceLastCheck > checkInterval) {
          checkSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopSessionCheck();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router.pathname, enabled, checkInterval]);

  return {
    checkSession,
    startSessionCheck,
    stopSessionCheck,
  };
}