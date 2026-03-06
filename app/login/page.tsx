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
    <div className="neo-landing min-h-screen text-black flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="w-full max-w-[400px] relative z-10 scale-90 sm:scale-100">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <img src="/logo.png" alt="Forgrin" className="w-7 h-7" />
          <span className="text-sm font-black tracking-tighter uppercase italic">
            Forgrin
          </span>
        </div>

        {/* Form Card */}
        <div className="skeuo-panel p-8 bg-white border-4 border-black shadow-[8px_8px_0px_white] ring-4 ring-black">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black mb-1 tracking-tighter uppercase italic border-b-2 border-black inline-block pb-1">Sign In</h1>
            <p className="text-[10px] font-black uppercase text-black/50 mt-2">
              Welcome Back
            </p>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-6 px-4 py-3 bg-white text-gray-900 border-2 border-black font-black uppercase text-[11px] flex items-center justify-center gap-3 hover:bg-zinc-100 transition-colors shadow-[4px_4px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
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
              <div className="w-full border-t-2 border-black"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-white border-2 border-black font-black uppercase tracking-tighter">Sign In With Email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500 rounded-lg text-[11px] font-black uppercase text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase mb-1 tracking-tight">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="skeuo-input w-full bg-zinc-50 border-2 border-black p-3 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-black uppercase mb-1 tracking-tight">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="skeuo-input w-full bg-zinc-50 border-2 border-black p-3 text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-white border-2 border-black text-blue-600 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="remember_me" className="ml-2 text-[10px] font-black uppercase text-black/60">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="skeuo-button w-full bg-black text-white border-2 border-black font-black uppercase py-4 shadow-[6px_6px_0px_white] ring-2 ring-black hover:bg-zinc-800"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-black/10">
            <p className="text-[9px] font-black uppercase text-black/40">
              Sign in to access your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
