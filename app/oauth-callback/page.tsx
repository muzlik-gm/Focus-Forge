'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { handleOAuthCallback } from '@/lib/desktop-oauth';

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-zinc-400">Preparing authentication...</p>
        </div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setMessage('Invalid callback parameters');
      return;
    }

    try {
      // Handle the OAuth callback
      handleOAuthCallback(code, state);
      setStatus('success');
      setMessage('Authentication successful! You can close this window.');

      // Auto-close after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to process authentication');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold mb-2">Processing...</h1>
            <p className="text-zinc-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-green-400">Success!</h1>
            <p className="text-zinc-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Error</h1>
            <p className="text-zinc-400">{message}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
