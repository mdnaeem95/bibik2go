import { ReactNode } from 'react';
import { useSessionCheck } from '@/hooks/useSessionCheck';

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  useSessionCheck({
    checkInterval: 5 * 60 * 1000, // Check every 5 minutes
    enabled: true,
  });

  return <>{children}</>;
}