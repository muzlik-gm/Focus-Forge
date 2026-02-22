'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * DEV ONLY: Plan Changer UI
 * 
 * This page is only accessible in development mode.
 * Allows quick switching between subscription tiers for testing.
 */

interface UserInfo {
  id: string;
  email: string;
  name: string;
  subscriptionTier: string;
  nextBillingDate: string | null;
}

export default function DevChangePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      setIsProduction(true);
      setLoading(false);
      return;
    }

    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/dev/change-plan');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 404) {
        setIsProduction(true);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePlan = async (tier: string) => {
    setChanging(true);
    setMessage(null);

    try {
      const response = await fetch('/api/dev/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Successfully changed to ${tier} plan!` });
        setUser(data.user);
        
        // Force session update by calling NextAuth update
        // Note: update() is not available in next-auth/react v4
        // The session will be updated on next page load
        
        // Refresh the page after 1.5 seconds to update all components
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Failed to change plan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setChanging(false);
    }
  };

  // Show error if accessed in production
  if (isProduction) {
    return (
      <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-6">
            This page is only available in development mode.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const tiers = [
    {
      name: 'FREE',
      description: 'Basic features for personal use',
      color: 'from-zinc-500 to-zinc-600',
    },
    {
      name: 'PRO',
      description: 'Advanced features and analytics',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      name: 'TEAM',
      description: 'Collaboration and team features',
      color: 'from-purple-500 to-pink-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Development Plan Changer</h1>
              <p className="text-sm text-zinc-400">Only available in development mode</p>
            </div>
          </div>
          
          {user && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">User:</span>
                  <span className="ml-2 font-medium">{user.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Email:</span>
                  <span className="ml-2 font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Current Plan:</span>
                  <span className="ml-2 font-medium text-blue-400">{user.subscriptionTier}</span>
                </div>
                {user.nextBillingDate && (
                  <div>
                    <span className="text-zinc-500">Next Billing:</span>
                    <span className="ml-2 font-medium">
                      {new Date(user.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const isCurrentPlan = user?.subscriptionTier === tier.name;
            
            return (
              <div
                key={tier.name}
                className={`bg-zinc-900 border rounded-lg p-6 transition-all ${
                  isCurrentPlan
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} mb-4 flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">
                    {tier.name.charAt(0)}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-zinc-400 mb-6">{tier.description}</p>
                
                <button
                  onClick={() => changePlan(tier.name)}
                  disabled={changing || isCurrentPlan}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrentPlan
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {changing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Changing...
                    </span>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    `Switch to ${tier.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">How to use:</h3>
          <ol className="space-y-2 text-sm text-zinc-400">
            <li>1. Click on any plan card to switch to that tier</li>
            <li>2. The change is immediate and updates your database</li>
            <li>3. Refresh the page or navigate to see the changes reflected</li>
            <li>4. This only works in development mode (NODE_ENV=development)</li>
            <li>5. In production, this route returns 404</li>
          </ol>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/billing')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
          >
            View Billing Page
          </button>
        </div>
      </div>
    </div>
  );
}
