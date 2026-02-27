'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession as useNextAuthSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { 
  restoreDesktopSession, 
  saveDesktopSession, 
  clearDesktopSession, 
  monitorSessionChanges, 
  isDesktopApp,
  hasValidDesktopSession,
  forceRefreshSession
} from '@/lib/desktop-session';

/**
 * Get cookie value by name
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

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
  const [sessionRestored, setSessionRestored] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      console.log('[AuthContext] Initializing authentication...');
      
      // Check if we're in Tauri environment (v1 uses __TAURI__)
      const isTauri = isDesktopApp();
      setIsDesktop(isTauri);
      
      console.log('[AuthContext] Environment:', isTauri ? 'Desktop (Tauri)' : 'Web (Browser)');
      console.log('[AuthContext] __TAURI__ present:', !!(window as any).__TAURI__);
      console.log('[AuthContext] Using cloud-based authentication (NextAuth + MongoDB)');

      // For desktop app, restore session from localStorage FIRST
      if (isTauri && !sessionRestored) {
        console.log('[AuthContext] Desktop app detected - checking for stored session');
        
        if (hasValidDesktopSession()) {
          console.log('[AuthContext] Valid session found in localStorage, restoring...');
          const restored = restoreDesktopSession();
          
          if (restored) {
            console.log('[AuthContext] Session restored successfully');
            setSessionRestored(true);
            
            // Force a session check after restoration
            setTimeout(() => {
              window.location.reload();
            }, 500);
            return;
          }
        } else {
          console.log('[AuthContext] No valid stored session found');
        }
        
        setSessionRestored(true);
      }

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
        
        // For desktop app, save session token to localStorage for persistence
        if (isTauri) {
          const sessionToken = getCookieValue('next-auth.session-token');
          if (sessionToken) {
            console.log('[AuthContext] Saving session token to localStorage');
            saveDesktopSession(sessionToken);
          } else {
            console.log('[AuthContext] No session token found in cookies');
          }
        }
        
        setLoading(false);
      } else {
        console.log('[AuthContext] No active session');
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, [nextAuthSession, nextAuthStatus, sessionRestored]);

  // Monitor session changes for desktop app
  useEffect(() => {
    if (isDesktop) {
      console.log('[AuthContext] Starting session monitoring for desktop app');
      const cleanup = monitorSessionChanges();
      return cleanup;
    }
  }, [isDesktop]);

  const handleSignOut = async () => {
    console.log('[AuthContext] Signing out...');
    
    // Clear desktop session if in desktop app
    if (isDesktop) {
      clearDesktopSession();
    }
    
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
