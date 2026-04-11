/**
 * ============================================
 * APP COMPONENT
 * ============================================
 */

import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const { darkMode, setDarkMode, theme, setTheme } = useUIStore();
  const { setLoading } = useAuthStore();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const storedMode = localStorage.getItem('ui-storage');
    if (storedMode) {
      try {
        const parsed = JSON.parse(storedMode);
        document.documentElement.classList.toggle('dark', Boolean(parsed.state?.darkMode));
        if (parsed.state?.theme) {
          document.documentElement.setAttribute('data-theme', parsed.state.theme);
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Check system preference if no stored preference
    if (!storedMode) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      setTheme('lucy');
    }

    // Set loading to false after initial check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [setDarkMode, setLoading, setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#1E293B' : '#fff',
            color: darkMode ? '#F8FAFC' : '#0F172A',
            borderRadius: '12px',
            border: darkMode ? '1px solid #334155' : '1px solid #E2E8F0',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default App;
