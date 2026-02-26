import { useEffect, useState } from 'react';
import { useSession as useNextAuthSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isDesktop: boolean;
}

/**
 * Unified authentication hook that works for both web and desktop
 * 
 * - Web: Uses NextAuth session
 * - Desktop: Uses localStorage + Tauri
 */
export function useAuth() {
  const router = useRouter();
  const { data: nextAuthSession, status: nextAuthStatus } = useNextAuthSession();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isDesktop: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we're in Tauri environment (v1 uses __TAURI__, v2 uses __TAURI_INTERNALS__)
      const isDesktop = typeof window !== 'undefined' && !!(window as any).__TAURI__;

      if (isDesktop) {
        // DESKTOP: Check localStorage for auth token
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            setAuthState({
              user,
              loading: false,
              isDesktop: true,
            });
          } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
            setAuthState({
              user: null,
              loading: false,
              isDesktop: true,
            });
          }
        } else {
          setAuthState({
            user: null,
            loading: false,
            isDesktop: true,
          });
        }
      } else {
        // WEB: Use NextAuth session
        if (nextAuthStatus === 'loading') {
          setAuthState({
            user: null,
            loading: true,
            isDesktop: false,
          });
        } else if (nextAuthSession?.user) {
          setAuthState({
            user: {
              id: nextAuthSession.user.id || '',
              email: nextAuthSession.user.email || '',
              name: nextAuthSession.user.name || null,
            },
            loading: false,
            isDesktop: false,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            isDesktop: false,
          });
        }
      }
    };

    checkAuth();
  }, [nextAuthSession, nextAuthStatus]);

  const signOut = async () => {
    if (authState.isDesktop) {
      // DESKTOP: Clear localStorage and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      router.push('/login');
    } else {
      // WEB: Use NextAuth signOut
      await nextAuthSignOut({ redirect: false });
      router.push('/login');
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    isAuthenticated: !!authState.user,
    isDesktop: authState.isDesktop,
    signOut,
  };
}
