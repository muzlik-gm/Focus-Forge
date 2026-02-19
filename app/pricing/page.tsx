'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For individuals getting started',
    features: [
      'Unlimited focus sessions',
      'Basic task management',
      'Weekly analytics',
      '1 workspace',
    ],
    priceId: null,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    description: 'For power users who want more',
    features: [
      'Everything in Free',
      'Advanced analytics',
      'AI-powered insights',
      'Priority support',
      'Export data',
      'Unlimited workspaces',
    ],
    priceId: 'price_pro_monthly',
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: 19,
    description: 'For teams collaborating on goals',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Leaderboards',
      'Admin controls',
      'SSO',
      'Advanced permissions',
    ],
    priceId: 'price_team_monthly',
    popular: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) {
      // Free plan - redirect to register
      window.location.href = '/register';
      return;
    }

    setLoading(priceId);
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
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="FocusForge" className="w-8 h-8" />
              <span className="text-base font-semibold tracking-tight">FocusForge</span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/" className="text-sm text-zinc-400 hover:text-white transition">
                Home
              </Link>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-8 py-24">
          <div className="max-w-[640px] mx-auto text-center">
            <h1 className="text-5xl font-semibold mb-6 tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-gray-400">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-8 py-24">
          <div className="grid md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
            {/* Free */}
            <div className="border border-white/10 rounded-lg p-8">
              <div className="text-base font-semibold mb-2">Free</div>
              <div className="mb-8">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited focus sessions', 'Basic task management', 'Weekly analytics', '1 workspace'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubscribe(null)}
                disabled={loading === 'free'}
              >
                {loading === 'free' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get started'}
              </Button>
            </div>

            {/* Pro */}
            <div className="border-2 border-white rounded-lg p-8 relative">
              <div className="absolute -top-3 left-6 px-2 py-0.5 bg-white text-black text-xs font-medium rounded">
                Popular
              </div>
              <div className="text-base font-semibold mb-2">Pro</div>
              <div className="mb-8">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Free', 'Advanced analytics', 'AI-powered insights', 'Priority support', 'Export data', 'Unlimited workspaces'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => handleSubscribe('price_pro_monthly')}
                disabled={loading === 'price_pro_monthly'}
              >
                {loading === 'price_pro_monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get started'}
              </Button>
            </div>

            {/* Team */}
            <div className="border border-white/10 rounded-lg p-8">
              <div className="text-base font-semibold mb-2">Team</div>
              <div className="mb-8">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Pro', 'Team collaboration', 'Leaderboards', 'Admin controls', 'SSO', 'Advanced permissions'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubscribe('price_team_monthly')}
                disabled={loading === 'price_team_monthly'}
              >
                {loading === 'price_team_monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get started'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-white/5">
        <div className="max-w-[800px] mx-auto px-8 py-24">
          <h2 className="text-3xl font-semibold mb-12 tracking-tight">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards and debit cards through Stripe.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all paid plans come with a 14-day free trial. No credit card required.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. No questions asked.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-white/5 pb-8 last:border-0">
                <h3 className="text-base font-medium mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-[1200px] mx-auto px-8 py-24">
          <div className="max-w-[640px] mx-auto text-center">
            <h2 className="text-4xl font-semibold mb-6 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-base text-gray-400 mb-10">
              Join 10,000+ developers who&apos;ve transformed their productivity.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-100 transition"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
