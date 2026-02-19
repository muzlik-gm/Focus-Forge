'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific NextAuth errors with user-friendly messages
        const errorMessages: Record<string, string> = {
          CredentialsSignin: 'Invalid email or password. Please check your credentials and try again.',
          SessionRequired: 'Please sign in to access this page.',
        };
        
        const errorCode = result.error;
        setError(errorMessages[errorCode] || 'Sign in failed. Please check your credentials and try again.');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
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
        <Link href="/" className="flex items-center gap-3 mb-12">
          <img src="/logo.png" alt="FocusForge" className="w-8 h-8" />
          <span className="text-base font-semibold tracking-tight embossed-text">FocusForge</span>
        </Link>

        {/* Form Card */}
        <div className="skeuo-card p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2 tracking-tight embossed-text">Sign in</h1>
            <p className="text-sm text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-400">
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-[20px] text-sm text-red-400">
                {typeof error === 'string' ? error : 'An error occurred'}
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
                className="skeuo-input w-full px-4 py-2.5 text-sm focus:outline-none transition"
                placeholder="you@example.com"
                required
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
                className="skeuo-input w-full px-4 py-2.5 text-sm focus:outline-none transition"
                placeholder="••••••••"
                required
              />
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
            <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-300 transition">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
