'use client';

import Link from 'next/link';
import { Smartphone, Download, Apple, PlaySquare, Globe, Sparkles } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function MobilePage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Mobile Infrastructure</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Focus In Your<br />Pocket.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Take the Forgrin telemetry engine anywhere. Zero-lag sync across all your devices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Apple, title: 'iOS Protocol', desc: 'iPhone & iPad', status: 'Coming Q2 2026', bg: 'bg-blue-50' },
              { icon: PlaySquare, title: 'Android Bot', desc: 'All Handhelds', status: 'Coming Q2 2026', bg: 'bg-green-50' },
              { icon: Globe, title: 'Edge Web', desc: 'Universal Browser', status: 'AVAILABLE NOW', bg: 'bg-pink-50' }
            ].map((device, i) => (
              <div key={i} className={`skeuo-panel p-8 text-center border-2 border-black shadow-[6px_6px_0px_black] ${device.bg} group flex flex-col items-center`}>
                <div className="skeuo-avatar w-14 h-14 mb-6 bg-white border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <device.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">{device.title}</h3>
                <p className="text-[10px] font-bold text-black/40 mb-6">{device.desc}</p>
                <div className="mt-auto skeuo-badge bg-white px-3 py-1 border-2 border-black text-[9px] font-black uppercase">
                  {device.status}
                </div>
              </div>
            ))}
          </div>

          <div className="skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Join the Waitlist.</h2>
            <p className="text-base font-bold text-black/70 mb-10 max-w-2xl mx-auto">
              Be the first to integrate mobile focus telemetry into your daily operations.
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="ENTER EMAIL PROTOCOL..."
                className="skeuo-input flex-1 px-4 py-4 bg-white border-2 border-black text-xs font-black uppercase focus:outline-none"
              />
              <button className="skeuo-button bg-black text-white px-8 py-4 font-black uppercase text-sm shadow-[4px_4px_0px_pink]">
                Register
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
