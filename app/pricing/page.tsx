'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Loader2, Sparkles, Target, Star, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) {
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
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow">
        {/* Hero */}
        <section className="pt-32 pb-16 px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="skeuo-badge bg-white text-black mb-3 inline-flex border-2 border-black">
              <Target className="w-4 h-4" />
              <span className="font-black uppercase tracking-tighter text-[10px]">Simple Pricing</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight text-black">Precision Plans.<br />Transparent fees.</h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Start free, scale as you grow. No hidden complexity.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {/* Free Plan */}
              <div className="skeuo-card p-6 flex flex-col h-full bg-white border-2 border-black shadow-[8px_8px_0px_black] text-black">
                <div className="mb-6">
                  <h3 className="text-2xl font-black mb-1 uppercase text-black">Free</h3>
                  <div className="flex items-baseline mb-3">
                    <span className="text-4xl font-black">$0</span>
                    <span className="text-black/50 ml-1 font-bold uppercase text-[10px]">/month</span>
                  </div>
                </div>
                <div className="space-y-3 mb-10 flex-grow">
                  {['3 Focus Sessions / day', 'Basic Analytics', 'Manual logs', 'Community access'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-black">
                      <Check className="w-4 h-4 text-black flex-shrink-0" />
                      <span className="text-[10px] font-bold tracking-tight text-black/80">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe(null)}
                  className="skeuo-button bg-[#ff91e0] text-black border-2 border-black w-full text-base font-black py-4 shadow-[4px_4px_0px_black]"
                >
                  {loading === 'free' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Started'}
                </button>
              </div>

              {/* Pro Plan - Featured */}
              <div className="skeuo-card p-6 flex flex-col h-full bg-white border-4 border-black shadow-[10px_10px_0px_black] relative z-20 overflow-visible text-black md:scale-105">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-full text-center">
                  <div className="skeuo-badge bg-[#9eff9e] text-black px-4 py-1 border-2 border-black shadow-[3px_3px_0px_black] inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-black uppercase tracking-tight text-[10px]">RECOMMENDED</span>
                  </div>
                </div>
                <div className="mb-6 pt-4">
                  <h3 className="text-3xl font-black mb-1 uppercase text-black">Pro</h3>
                  <div className="flex items-baseline mb-3">
                    <span className="text-5xl font-black text-black">$12</span>
                    <span className="text-black/50 ml-1 font-black uppercase text-[10px]">/month</span>
                  </div>
                </div>
                <div className="space-y-3 mb-10 flex-grow">
                  {['Unlimited sessions', 'Advanced Analytics', 'Predictions', 'Team Sharing', 'API Access'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-black flex-shrink-0" />
                      <span className="text-[10px] font-black uppercase text-black/80">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe('price_pro_monthly')}
                  className="skeuo-button bg-[#ff91e0] text-black border-2 border-black w-full text-lg font-black py-4 shadow-[6px_6px_0px_black]"
                >
                  {loading === 'price_pro_monthly' ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Upgrade to Pro'}
                </button>
              </div>

              {/* Team Plan */}
              <div className="skeuo-card p-6 flex flex-col h-full bg-white border-2 border-black shadow-[8px_8px_0px_black] text-black">
                <div className="mb-6">
                  <h3 className="text-2xl font-black mb-1 uppercase text-black">Team</h3>
                  <div className="flex items-baseline mb-3">
                    <span className="text-4xl font-black">$29</span>
                    <span className="text-black/50 ml-1 font-bold uppercase text-[10px]">/month</span>
                  </div>
                </div>
                <div className="space-y-3 mb-10 flex-grow">
                  {['Up to 10 members', 'Admin Oversight', 'Team Heatmaps', 'Priority Support'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-black flex-shrink-0" />
                      <span className="text-[10px] font-bold tracking-tight text-black/80">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe('price_team_monthly')}
                  className="skeuo-button bg-[#ff91e0] text-black border-2 border-black w-full text-base font-black py-4 shadow-[4px_4px_0px_black]"
                >
                  {loading === 'price_team_monthly' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Start Team Plan'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Compact */}
        <section className="py-24 px-6 relative z-10 border-t-4 border-black mt-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter leading-none text-black">General Questions.</h2>
              <p className="text-black font-bold text-sm opacity-70">Everything you need to know about billing.</p>
            </div>
            <div className="grid gap-4">
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
                  a: 'Yes, you can cancel your subscription at any time with one click.',
                },
              ].map((faq, i) => (
                <div key={i} className="skeuo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_black] text-black">
                  <h3 className="text-lg font-black uppercase mb-2 tracking-tighter">{faq.q}</h3>
                  <p className="text-sm font-bold text-black/70 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}