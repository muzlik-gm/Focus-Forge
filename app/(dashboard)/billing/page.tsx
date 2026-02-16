'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface SubscriptionInfo {
  tier: string;
  price: number;
  nextBillingDate?: string;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        const tier = data.settings?.subscriptionTier || 'FREE';
        setSubscription({
          tier,
          price: tier === 'PRO' ? 9 : tier === 'TEAM' ? 19 : 0,
          nextBillingDate: tier !== 'FREE' ? 'N/A' : undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (priceId: string) => {
    setUpgrading(priceId);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
      setUpgrading(null);
    }
  };

  const currentTier = subscription?.tier || 'FREE';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Billing</h1>
        <p className="text-sm text-gray-400">Manage your subscription and billing.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Current Plan */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold mb-1">Current plan</h2>
              {loading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <p className="text-sm text-gray-400">You are currently on the {currentTier} plan</p>
              )}
            </div>
            {currentTier === 'FREE' && (
              <Button onClick={() => handleUpgrade('price_pro_monthly')} disabled={upgrading !== null}>
                {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade'}
              </Button>
            )}
          </div>
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-md p-4">
                <div className="text-sm text-gray-400 mb-1">Plan</div>
                <div className="text-lg font-semibold">{currentTier}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-md p-4">
                <div className="text-sm text-gray-400 mb-1">Price</div>
                <div className="text-lg font-semibold">
                  {subscription?.price === 0 ? 'Free' : `$${subscription?.price}/mo`}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-md p-4">
                <div className="text-sm text-gray-400 mb-1">Next billing</div>
                <div className="text-lg font-semibold">
                  {currentTier === 'FREE' ? '—' : subscription?.nextBillingDate}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Options */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-base font-semibold mb-2">Pro</div>
            <div className="mb-6">
              <span className="text-3xl font-bold">$9</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {['Advanced analytics', 'AI insights', 'Priority support', 'Export data'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={currentTier === 'PRO' ? 'outline' : 'default'}
              onClick={() => handleUpgrade('price_pro_monthly')}
              disabled={upgrading !== null || currentTier === 'PRO'}
            >
              {currentTier === 'PRO' ? 'Current Plan' : upgrading === 'price_pro_monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade to Pro'}
            </Button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-base font-semibold mb-2">Team</div>
            <div className="mb-6">
              <span className="text-3xl font-bold">$19</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {['Everything in Pro', 'Team collaboration', 'Leaderboards', 'Admin controls'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={currentTier === 'TEAM' ? 'outline' : 'default'}
              onClick={() => handleUpgrade('price_team_monthly')}
              disabled={upgrading !== null || currentTier === 'TEAM'}
            >
              {currentTier === 'TEAM' ? 'Current Plan' : upgrading === 'price_team_monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade to Team'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
