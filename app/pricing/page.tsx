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
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
        <div className="absolute top-[60%] left-[10%] w-[400px] h-[400px] gradient-orb bg-purple-600" />
      </div>

      {/* Navigation */}
      <nav className="glass-nav relative z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="FocusForge" className="w-8 h-8" />
              <span className="text-base font-semibold tracking-tight embossed-text">FocusForge</span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/" className="text-sm text-zinc-400 hover:text-white transition">
                Home
              </Link>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">
                Sign in
              </Link>
              <Link href="/register" className="skeuo-button px-5 py-2.5 text-white text-sm font-medium">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero */}
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-semibold mb-6 tracking-tight embossed-text">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-zinc-400">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free */}
              <div className="notch-card p-8">
                <div className="text-xl font-semibold mb-2 embossed-text">Free</div>
                <div className="mb-8">
                  <span className="text-4xl font-bold embossed-text">$0</span>
                  <span className="text-zinc-400 text-sm">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Unlimited focus sessions', 'Basic task management', 'Weekly analytics', '1 workspace'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                      <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(null)}
                  disabled={loading === 'free'}
                  className="skeuo-input w-full px-4 py-2.5 text-center text-sm font-medium hover:bg-zinc-800/50 transition disabled:opacity-50"
                >
                  {loading === 'free' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Get started'}
                </button>
              </div>

              {/* Pro */}
              <div className="pricing-featured p-8 md:scale-105">
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                  Popular
                </div>
                <div className="text-xl font-semibold mb-2">Pro</div>
                <div className="mb-8">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-blue-100 text-sm">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Free', 'Advanced analytics', 'AI-powered insights', 'Priority support', 'Export data', 'Unlimited workspaces'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-blue-50">
                      <Check className="w-5 h-5 text-white flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe('price_pro_monthly')}
                  disabled={loading === 'price_pro_monthly'}
                  className="w-full px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-600 text-center text-sm font-medium rounded-[20px] transition shadow-lg disabled:opacity-50"
                >
                  {loading === 'price_pro_monthly' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Get started'}
                </button>
              </div>

              {/* Team */}
              <div className="notch-card p-8">
                <div className="text-xl font-semibold mb-2 embossed-text">Team</div>
                <div className="mb-8">
                  <span className="text-4xl font-bold embossed-text">$19</span>
                  <span className="text-zinc-400 text-sm">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Pro', 'Team collaboration', 'Leaderboards', 'Admin controls', 'SSO', 'Advanced permissions'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                      <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe('price_team_monthly')}
                  disabled={loading === 'price_team_monthly'}
                  className="skeuo-input w-full px-4 py-2.5 text-center text-sm font-medium hover:bg-zinc-800/50 transition disabled:opacity-50"
                >
                  {loading === 'price_team_monthly' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Get started'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-12 tracking-tight text-center embossed-text">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
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
                <div key={i} className="skeuo-card p-6">
                  <h3 className="text-lg font-semibold mb-2 embossed-text">{faq.q}</h3>
                  <p className="text-sm text-zinc-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="skeuo-card p-12">
              <h2 className="text-4xl font-semibold mb-6 tracking-tight embossed-text">
                Ready to get started?
              </h2>
              <p className="text-base text-zinc-400 mb-10">
                Join 10,000+ developers who&apos;ve transformed their productivity.
              </p>
              <Link
                href="/register"
                className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium"
              >
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
