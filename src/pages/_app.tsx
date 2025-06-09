// src/pages/_app.tsx
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/SessionProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>
        <Toaster position="top-right" />
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  );
}
