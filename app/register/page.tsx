'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await post('/api/auth/register', { name, email, password });

      if (!response.ok) {
        const data = await response.json();
        // Handle specific error codes with user-friendly messages
        const errorMessages: Record<string, string> = {
          USER_EXISTS: 'An account with this email already exists. Please sign in instead.',
          VALIDATION_ERROR: 'Please check your input and try again.',
          RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a moment before trying again.',
          INTERNAL_ERROR: 'Something went wrong on our end. Please try again in a few moments.',
        };
        
        const errorCode = data.error?.code;
        setError(errorMessages[errorCode] || data.error?.message || 'Registration failed');
        return;
      }

      router.push('/onboarding');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-12">
          <img src="/logo.png" alt="FocusForge" className="w-8 h-8" />
          <span className="text-base font-semibold tracking-tight">FocusForge</span>
        </Link>

        {/* Form */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight">Create account</h1>
          <p className="text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-400">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {typeof error === 'string' ? error : 'An error occurred'}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition"
              placeholder="••••••••"
              required
              minLength={8}
            />
            <p className="mt-1.5 text-xs text-zinc-500">Must be at least 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-300 transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
