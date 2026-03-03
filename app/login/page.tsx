'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle } from '@/lib/firebase';
import { forceRefreshSession } from '@/lib/desktop-session';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { isDesktop } = useAuth();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('forgrin_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('[Login] User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('[Login] Google sign-in initiated');
      const firebaseUser = await signInWithGoogle();

      console.log('[Login] Firebase Google auth successful:', firebaseUser.email);

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Register/login with our backend using Firebase token
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to complete sign-in');
      }

      console.log('[Login] Backend authentication successful');

      // Sign in with NextAuth using the email and firebase ID token
      const loginResult = await signIn('credentials', {
        email: firebaseUser.email,
        idToken: idToken, // Required for secure firebase login route backend check
        redirect: false,
      });

      if (loginResult?.error) {
        console.error('[Login] NextAuth sign-in failed:', loginResult.error);
        throw new Error('Failed to complete sign-in');
      }

      console.log('[Login] NextAuth sign-in successful');
      toast.success('Welcome back!');

      // Force refresh session for desktop app
      forceRefreshSession();

      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Login] Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setError('');
    setLoading(true);

    console.log('[Login] Form submitted');
    console.log('[Login] Environment:', isDesktop ? 'Desktop' : 'Web');
    console.log('[Login] Using cloud authentication (NextAuth + MongoDB)');
    console.log('[Login] Email:', email);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('[Login] NextAuth result:', result);

      if (result?.error) {
        console.error('[Login] Authentication failed:', result.error);
        const errorMessages: Record<string, string> = {
          CredentialsSignin: 'Invalid email or password',
          SessionRequired: 'Please sign in to access this page',
        };

        setError(errorMessages[result.error] || 'Sign in failed. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[Login] Authentication successful, redirecting to dashboard...');

      if (rememberMe) {
        localStorage.setItem('forgrin_remembered_email', email);
      } else {
        localStorage.removeItem('forgrin_remembered_email');
      }

      // Force refresh session for desktop app
      forceRefreshSession();

      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Login] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-[10%] w-[400px] h-[400px] gradient-orb bg-blue-600" />
        <div className="absolute bottom-20 left-[10%] w-[350px] h-[350px] gradient-orb bg-purple-600" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img src="/logo.png" alt="Forgrin" className="w-8 h-8" />
          <span className="text-base font-semibold tracking-tight embossed-text">
            Forgrin {isDesktop && '(Desktop)'}
          </span>
        </div>

        {/* Form Card */}
        <div className="skeuo-card p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2 tracking-tight embossed-text">Welcome back</h1>
            <p className="text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-400">
                Sign up
              </Link>
            </p>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-6 px-4 py-3 bg-white text-gray-900 font-medium text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1a1d] text-zinc-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-[20px] text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 embossed-text">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="skeuo-input w-full px-4 py-2.5 text-sm focus:outline-none"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 embossed-text">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="skeuo-input w-full px-4 py-2.5 text-sm focus:outline-none"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1a1a1c] border-zinc-800 text-blue-500 focus:ring-blue-500/50"
                disabled={loading}
              />
              <label htmlFor="remember_me" className="ml-2 text-sm text-zinc-400">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="skeuo-button w-full px-4 py-2.5 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-zinc-400">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
