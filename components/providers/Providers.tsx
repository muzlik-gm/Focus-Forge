'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationToastProvider } from '@/components/notifications/NotificationToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
        <NotificationToastProvider />
      </AuthProvider>
    </SessionProvider>
  );
}
