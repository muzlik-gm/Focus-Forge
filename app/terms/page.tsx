'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Scroll, CheckCircle2, AlertTriangle, Scale, Target } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6 pb-24">
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Scale className="w-4 h-4 text-orange-600" />
              <span>Operational Protocols</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight italic">
              Terms Of<br />Service.
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="skeuo-panel p-8 bg-zinc-50 border-2 border-black shadow-[6px_6px_0px_black] ring-2 ring-black">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4 border-b-2 border-black inline-block pb-1">User Accounts</h3>
              <p className="text-sm font-bold text-black/70 leading-snug">
                By accessing Forgrin, you agree to our terms and respect other users.
              </p>
            </div>
            <div className="skeuo-panel p-8 bg-white border-2 border-black shadow-[6px_6px_0px_black] ring-2 ring-black">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4 border-b-2 border-black inline-block pb-1">Platform Access</h3>
              <p className="text-sm font-bold text-black/70 leading-snug">
                Access may be restricted or terminated if any user attempts to manipulate the platform or bypass limits.
              </p>
            </div>
          </div>

          <div className="mt-12 skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 border-b-2 border-black inline-block italic">Subscription Agreement</h3>
            <ul className="space-y-6">
              {[
                'Paid subscriptions sync across all nodes instantly.',
                'Refunds are available for 14 operational days.',
                'Beta access is subject to frequent updates.'
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-4">
                  <Target className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-black uppercase tracking-tight italic">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
