'use client';

import Link from 'next/link';
import { Briefcase, Heart, CheckCircle, AlertCircle, Sparkles, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function CareersPage() {
  const benefits = [
    'Remote-first architecture.',
    'High-equity participation.',
    'Full health/telemetry coverage.',
    'Unlimited focal buffer (PTO).',
    'Advanced hardware budget.'
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Human Capital</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Build the<br />Future Architecture.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Join a high-density team engineering the next generation of human focus.
            </p>
          </div>

          <div className="skeuo-panel p-10 mb-12 text-center border-4 border-black bg-white shadow-[10px_10px_0px_black] relative overflow-hidden">
            <div className="absolute top-4 right-4 skeuo-badge bg-orange-400 border-2 border-black text-[9px] font-black uppercase">INCUBATING</div>
            <div className="skeuo-avatar w-16 h-14 mx-auto mb-6 bg-zinc-100 border-2 border-black flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Operational Freeze</h2>
            <p className="text-sm font-bold text-black/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              Current node occupancy is at 100%. We are not actively scaling our human workforce at this moment, but we always monitor high-potential telemetry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="skeuo-panel p-10 bg-blue-50 border-2 border-black shadow-[6px_6px_0px_black]">
              <div className="flex items-center gap-4 mb-6">
                <div className="skeuo-avatar w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
                  <Heart className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Protocol Perks</h2>
              </div>
              <div className="grid gap-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeuo-avatar w-6 h-6 flex-shrink-0 bg-white border-2 border-black flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-black/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="skeuo-panel p-10 bg-pink-50 border-2 border-black shadow-[6px_6px_0px_black] flex flex-col justify-center text-center">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Persistence.</h3>
              <p className="text-[10px] font-bold text-black/70 mb-8 leading-tight">
                We maintain an archive of elite resumes for future deployment.
              </p>
              <a
                href="mailto:careers@forgrin.app"
                className="skeuo-button bg-black text-white px-8 py-4 font-black uppercase text-xs flex items-center gap-3 w-fit mx-auto group"
              >
                <span>Transmit Resume</span>
                <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
