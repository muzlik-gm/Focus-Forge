'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export default function StatusPage() {
  const services = [
    { name: 'Core_Telemetry_Interface', status: 'OPERATIONAL', uptime: '99.99%', color: 'text-green-500' },
    { name: 'Node_Registration_Hub', status: 'OPERATIONAL', uptime: '100%', color: 'text-green-500' },
    { name: 'Focus_Analysis_Engine', status: 'DEGRADED_LATENCY', uptime: '98.5%', color: 'text-yellow-500' },
    { name: 'Auth_Protocol_V3', status: 'OPERATIONAL', uptime: '99.99%', color: 'text-green-500' },
    { name: 'Desktop_Sync_Cluster', status: 'OPERATIONAL', uptime: '99.95%', color: 'text-green-500' },
    { name: 'Mobile_Gateway', status: 'OPERATIONAL', uptime: '99.99%', color: 'text-green-500' },
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6 pb-24">
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-[#9eff9e] border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>All Systems Nominal</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight italic">
              System<br />Pulse.
            </h1>
            <p className="text-sm font-black uppercase text-black/40 max-w-xl mx-auto italic">
              Real-time monitoring of the Forgrin node network.
            </p>
          </div>

          <div className="skeuo-panel bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black p-0 overflow-hidden mb-12">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">System Logs</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase">LIVE FEED</span>
              </div>
            </div>
            <div className="divide-y-2 divide-black">
              {services.map((s, i) => (
                <div key={i} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-black" />
                    <span className="text-xs font-black uppercase tracking-tighter italic">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase text-black/40 mb-1">90 DAY UPTIME</span>
                      <span className="text-[10px] font-black">{s.uptime}</span>
                    </div>
                    <div className={`skeuo-badge bg-white border-2 border-black ${s.color} text-[8px] font-black px-4 py-1 shadow-[2px_2px_0px_black]`}>
                      {s.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Incidents */}
          <div className="mt-20">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-8 border-b-2 border-black inline-block pb-1">Past Incidents</h2>
            <div className="space-y-6">
              {[
                { date: 'MAR_02_2026', title: 'Analysis Cache Rebuild', desc: 'Brief latency spike during global cache optimization.', status: 'RESOLVED' },
                { date: 'FEB_28_2026', title: 'Core Auth Upgrade', desc: 'Planned maintenance for Node-A1 synchronization protocol.', status: 'COMPLETE' }
              ].map((inc, i) => (
                <div key={i} className="skeuo-panel p-6 bg-zinc-100 border-2 border-black shadow-[6px_6px_0px_black] flex items-center justify-between gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black uppercase text-black/40">{inc.date}</span>
                    <h4 className="text-lg font-black uppercase tracking-tighter italic">{inc.title}</h4>
                    <p className="text-[10px] font-bold text-black/60 leading-tight">{inc.desc}</p>
                  </div>
                  <div className="skeuo-badge bg-black text-white text-[8px] font-black px-4 py-1 italic">
                    {inc.status}
                  </div>
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
