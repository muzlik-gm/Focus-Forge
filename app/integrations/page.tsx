'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Share2, Zap, Database, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function IntegrationsPage() {
  const integrations = [
    { name: 'Slack', category: 'Communication', status: 'ACTIVE', color: 'bg-green-50' },
    { name: 'GitHub', category: 'Development', status: 'SYNCED', color: 'bg-zinc-50' },
    { name: 'VS Code', category: 'Editor', status: 'CORE', color: 'bg-blue-50' },
    { name: 'Notion', category: 'Documentation', status: 'LINKED', color: 'bg-yellow-50' },
    { name: 'Google Calendar', category: 'Scheduling', status: 'UPDATING', color: 'bg-red-50' },
    { name: 'Discord', category: 'Community', status: 'AVAILABLE', color: 'bg-indigo-50' },
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Network Extensions</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Universal<br />Connectivity.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Sync your focus telemetry across the entire node network.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {integrations.map((app, i) => (
              <div key={i} className={`skeuo-panel p-6 border-2 border-black shadow-[6px_6px_0px_black] ${app.color} transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="skeuo-badge bg-black text-white text-[8px] font-black uppercase ring-1 ring-white">
                    {app.status}
                  </div>
                </div>
                <h3 className="text-xl font-black mb-1 uppercase tracking-tighter italic">{app.name}</h3>
                <p className="text-[9px] font-black uppercase text-black/50 mb-6">{app.category}</p>
                <div className="pt-4 border-t border-black/10 flex justify-between items-center">
                  <span className="text-[8px] font-black uppercase">Latency: LOW</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic border-b-2 border-black inline-block pb-1">Missing a Link?</h2>
            <p className="text-base font-bold text-black/70 mb-10 max-w-2xl mx-auto">
              Our Open Interface (API) allows you to construct custom integration logic for any telemetry stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/docs/api"
                className="skeuo-button bg-black text-white px-10 py-5 font-black uppercase text-sm flex items-center gap-3 group"
              >
                <span>Construct Plugin</span>
                <Globe className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="skeuo-button bg-white text-black border-2 border-black px-10 py-5 font-black uppercase text-sm flex items-center gap-3"
              >
                <span>Request Integration</span>
                <Sparkles className="w-5 h-5 text-blue-600" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
