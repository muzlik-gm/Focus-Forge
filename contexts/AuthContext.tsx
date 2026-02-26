'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession as useNextAuthSession, signOut as nextAuthSignOut } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDesktop: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: nextAuthSession, status: nextAuthStatus } = useNextAuthSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      console.log('[AuthContext] Initializing authentication...');
      
      // Check if we're in Tauri environment (v1 uses __TAURI__)
      const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;
      setIsDesktop(isTauri);
      
      console.log('[AuthContext] Environment:', isTauri ? 'Desktop (Tauri)' : 'Web (Browser)');
      console.log('[AuthContext] __TAURI__ present:', !!(window as any).__TAURI__);
      console.log('[AuthContext] Using cloud-based authentication (NextAuth + MongoDB)');

      // Both desktop and web use NextAuth session (cloud-based)
      if (nextAuthStatus === 'loading') {
        console.log('[AuthContext] Loading session...');
        setLoading(true);
      } else if (nextAuthSession?.user) {
        console.log('[AuthContext] User authenticated:', nextAuthSession.user.email);
        setUser({
          id: nextAuthSession.user.id || '',
          email: nextAuthSession.user.email || '',
          name: nextAuthSession.user.name || null,
        });
        setLoading(false);
      } else {
        console.log('[AuthContext] No active session');
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, [nextAuthSession, nextAuthStatus]);

  const handleSignOut = async () => {
    console.log('[AuthContext] Signing out...');
    await nextAuthSignOut({ redirect: false });
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    isDesktop,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    setUser,
  };

  console.log('[AuthContext] Current state:', {
    user: user?.email || 'none',
    loading,
    isDesktop,
    isAuthenticated: !!user,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
