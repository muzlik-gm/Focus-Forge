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
            <div className="grid md:grid-cols-3 gap-4 overflow-visible items-stretch">
              {/* Free Plan */}
              <div className="skeuo-panel p-5 flex flex-col h-full bg-white border-2 border-black shadow-[6px_6px_0px_black] text-black">
                <div className="mb-4">
                  <h3 className="text-xl font-black mb-1 uppercase tracking-tighter italic">Free Plan</h3>
                  <div className="flex items-baseline mb-2 border-b-2 border-black/10 pb-2">
                    <span className="text-3xl font-black tracking-tighter text-black">$0</span>
                    <span className="text-black/40 ml-1 font-bold uppercase text-[8px]">/month</span>
                  </div>
                </div>
                <div className="space-y-2 mb-8 flex-grow">
                  {['3 Daily Sessions', 'Pulse Analytics', 'Manual Tracking', 'Network access'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-tight text-black/70">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe(null)}
                  className="skeuo-button bg-zinc-100 text-black border-2 border-black w-full text-[10px] font-black py-4 uppercase shadow-[4px_4px_0px_black] hover:bg-black hover:text-white transition-all"
                >
                  {loading === 'free' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Initialize'}
                </button>
              </div>

              {/* Pro Plan - Featured */}
              <div className="skeuo-panel p-5 flex flex-col h-full bg-white border-4 border-black shadow-[10px_10px_0px_black] relative z-20 overflow-visible text-black md:scale-105">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-fit bg-[#ff91e0] border-2 border-black px-4 py-0.5 shadow-[2px_2px_0px_black] z-30">
                  <span className="font-black uppercase tracking-tight text-[8px] italic">POPULAR CHOICE</span>
                </div>
                <div className="mb-4 pt-2">
                  <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter italic">Pro Plan</h3>
                  <div className="flex items-baseline mb-2 border-b-2 border-black/10 pb-2">
                    <span className="text-4xl font-black tracking-tighter text-black">$12</span>
                    <span className="text-black/40 ml-1 font-black uppercase text-[8px]">/month</span>
                  </div>
                </div>
                <div className="space-y-2 mb-8 flex-grow">
                  {['Unlimited focus', 'Deep Telemetry', 'Focus Analysis', 'Cluster Shares', 'Open Interface'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-pink-500 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase text-black">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe('price_pro_monthly')}
                  className="skeuo-button bg-black text-white border-2 border-black w-full text-xs font-black py-4 uppercase shadow-[6px_6px_0px_white] ring-2 ring-black hover:bg-zinc-800"
                >
                  {loading === 'price_pro_monthly' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Upgrade Path'}
                </button>
              </div>

              {/* Team Plan */}
              <div className="skeuo-panel p-5 flex flex-col h-full bg-white border-2 border-black shadow-[6px_6px_0px_black] text-black">
                <div className="mb-4">
                  <h3 className="text-xl font-black mb-1 uppercase tracking-tighter italic">Team Plan</h3>
                  <div className="flex items-baseline mb-2 border-b-2 border-black/10 pb-2">
                    <span className="text-3xl font-black tracking-tighter text-black">$29</span>
                    <span className="text-black/40 ml-1 font-bold uppercase text-[8px]">/month</span>
                  </div>
                </div>
                <div className="space-y-2 mb-8 flex-grow">
                  {['Multi-Node Support', 'Admin Oversight', 'Network Heatmaps', 'Priority Path'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-tight text-black/70">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe('price_team_monthly')}
                  className="skeuo-button bg-zinc-100 text-black border-2 border-black w-full text-[10px] font-black py-4 uppercase shadow-[4px_4px_0px_black] hover:bg-black hover:text-white transition-all"
                >
                  {loading === 'price_team_monthly' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Grid Access'}
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