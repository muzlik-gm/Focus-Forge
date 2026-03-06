'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Shield, Lock, Server, Terminal, Sparkles, Database } from 'lucide-react';

export default function SecurityPage() {
  const protocols = [
    { name: 'Hardware Hardening', icon: Server, desc: 'Enterprise-grade servers with direct focus tracking integration.' },
    { name: 'Data Encryption', icon: Lock, desc: 'End-to-end encryption for all your data and sessions.' },
    { name: 'Zero Trust Auth', icon: Terminal, desc: 'Every request is verified across all our infrastructure.' },
    { name: 'Threat Monitoring', icon: Shield, desc: 'Real-time monitoring and prevention of security threats.' },
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6 pb-24">
        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Hardened Infrastructure</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight italic">
              Security<br />Standard.
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {protocols.map((p, i) => (
              <div key={i} className="skeuo-panel p-10 bg-white border-2 border-black shadow-[8px_8px_0px_black] ring-4 ring-black group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="w-16 h-16 bg-zinc-100 border-2 border-black flex items-center justify-center mb-10 group-hover:bg-black group-hover:text-white transition-colors">
                  <p.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-3 border-b-2 border-black inline-block pb-0.5">{p.name}</h3>
                <p className="text-sm font-bold text-black/60 leading-relaxed uppercase">{p.desc}</p>
                <div className="mt-10 pt-8 border-t-2 border-black flex justify-between items-center opacity-40">
                  <span className="text-[10px] font-black uppercase italic">Security Protocol</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 skeuo-panel p-16 bg-[#09090b] text-white border-4 border-black shadow-[15px_15px_0px_black] ring-4 ring-black text-center">
            <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic border-b-4 border-white inline-block pb-2 mb-8">Vulnerability Updates</h2>
            <p className="max-w-xl mx-auto text-white/50 font-bold mb-10 uppercase text-sm">
              If you encounter a security vulnerability or a bug, please contact our security team immediately.
            </p>
            <button className="skeuo-button bg-white text-black px-12 py-5 font-black uppercase text-sm shadow-[8px_8px_0px_blue] transition-transform hover:scale-110">
              REPORT VULNERABILITY
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
