'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationToastProvider } from '@/components/notifications/NotificationToastProvider';
import { Toaster } from 'react-hot-toast';
import { DesktopLayout } from '@/components/layout/DesktopLayout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <DesktopLayout>
          {children}
          <NotificationToastProvider />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(26, 26, 26, 0.95)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                duration: 3000,
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                duration: 4000,
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />
        </DesktopLayout>
      </AuthProvider>
    </SessionProvider>
  );
}
