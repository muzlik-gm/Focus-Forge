'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithGoogle, signUpWithEmail } from '@/lib/firebase';
import { signInWithGoogleDesktop } from '@/lib/desktop-oauth';
import { isDesktopApp } from '@/lib/desktop-session';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { isDesktop } = useAuth();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('[Register] User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('[Register] Google sign-in initiated');
      console.log('[Register] isDesktop from useAuth:', isDesktop);
      console.log('[Register] isDesktopApp():', isDesktopApp());

      let userData;

      // Check if running in desktop app using direct detection
      const isInDesktopApp = isDesktopApp();

      if (isInDesktopApp) {
        console.log('[Register] Using desktop browser-based OAuth - opening system browser');
        userData = await signInWithGoogleDesktop();
        console.log('[Register] Desktop OAuth successful:', userData.email);
      } else {
        console.log('[Register] Using Firebase popup OAuth');
        const firebaseUser = await signInWithGoogle();

        console.log('[Register] Firebase Google auth successful:', firebaseUser.email);

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
          throw new Error(data.error?.message || 'Failed to complete registration');
        }

        console.log('[Register] Backend registration successful');

        userData = {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        };
      }

      // Sign in with NextAuth using just the email (no password needed for OAuth users)
      const loginResult = await signIn('credentials', {
        email: userData.email,
        password: 'firebase-oauth-user', // Placeholder - not used for OAuth users
        redirect: false,
      });

      if (loginResult?.error) {
        console.error('[Register] NextAuth sign-in failed:', loginResult.error);
        throw new Error('Failed to complete sign-in');
      }

      console.log('[Register] NextAuth sign-in successful');
      toast.success('Welcome to FocusForge!');
      router.push('/onboarding');
    } catch (err: any) {
      console.error('[Register] Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setError('');
    setLoading(true);

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    console.log('[Register] Form submitted');
    console.log('[Register] Environment:', isDesktop ? 'Desktop' : 'Web');
    console.log('[Register] Email:', email);

    try {
      // Create Firebase user with email verification
      console.log('[Register] Creating Firebase user...');
      const firebaseUser = await signUpWithEmail(email, password, name);

      console.log('[Register] Firebase user created, verification email sent');

      // Register with our backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          // Don't send password for Firebase users
          firebaseUid: firebaseUser.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Register] Registration failed:', data);

        const errorMessages: Record<string, string> = {
          USER_EXISTS: 'An account with this email already exists',
          VALIDATION_ERROR: 'Please check your input and try again',
          RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a moment',
          INTERNAL_ERROR: 'Something went wrong. Please try again',
        };

        const errorCode = data.error?.code;
        setError(errorMessages[errorCode] || data.error?.message || 'Registration failed');
        setLoading(false);
        return;
      }

      console.log('[Register] Registration successful');

      // Show verification message
      setShowVerificationMessage(true);
      setLoading(false);

      toast.success('Account created! Please check your email to verify your account.');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?verified=pending');
      }, 3000);

    } catch (err: any) {
      console.error('[Register] Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
          <img src="/logo.png" alt="FocusForge" className="w-8 h-8" />
          <span className="text-base font-semibold tracking-tight embossed-text">
            FocusForge {isDesktop && '(Desktop)'}
          </span>
        </div>

        {/* Form Card */}
        <div className="skeuo-card p-8">
          {showVerificationMessage ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email!</h2>
              <p className="text-zinc-400 mb-4">
                We've sent a verification link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-zinc-500">
                Please verify your email before signing in. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold mb-2 tracking-tight embossed-text">Create account</h1>
                <p className="text-sm text-zinc-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-500">
                    Sign in
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
                  <label htmlFor="name" className="block text-sm font-medium mb-2 embossed-text">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="skeuo-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>

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
                    minLength={8}
                    disabled={loading}
                  />
                  <p className="mt-1.5 text-xs text-zinc-500">Must be at least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 embossed-text">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="skeuo-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    disabled={loading}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || (confirmPassword.length > 0 && password !== confirmPassword)}
                  className="skeuo-button w-full px-4 py-2.5 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-zinc-400">
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
