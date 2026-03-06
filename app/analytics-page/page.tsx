'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { BarChart3, LineChart, PieChart, TrendingUp, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const metrics = [
    { name: 'Focus Rate', value: '89%', desc: 'Average focus rate across all sessions.' },
    { name: 'Total Hours', value: '142h', desc: 'Total focus time logged this month.' },
    { name: 'Sync Speed', value: '12ms', desc: 'Average data sync latency.' },
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6 pb-24">
        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Insights & Analytics</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight italic">
              Deep Work<br />Analytics.
            </h1>
            <p className="text-sm font-black uppercase text-black/40 max-w-xl mx-auto italic">
              Precise, actionable insights for your focus sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {metrics.map((m, i) => (
              <div key={i} className="skeuo-panel p-8 bg-zinc-50 border-2 border-black shadow-[6px_6px_0px_black] text-center group hover:bg-black group-hover:text-white transition-all">
                <span className="text-[10px] font-black uppercase text-black/40 mb-2 block group-hover:text-white/50">{m.name}</span>
                <h2 className="text-6xl font-black tracking-tighter embossed-text italic group-hover:text-white">{m.value}</h2>
                <p className="text-[8px] font-bold uppercase mt-6 opacity-60 leading-tight">{m.desc}</p>
                <div className="mt-6 pt-4 border-t border-black/10 group-hover:border-white/10 flex justify-center">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mt-12">
            <div className="skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black">
              <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-black">
                <div className="w-12 h-12 bg-zinc-50 border-2 border-black flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Focus Time Distribution</h3>
              </div>
              <div className="space-y-4">
                {[80, 45, 95, 60].map((w, i) => (
                  <div key={i} className="w-full h-8 bg-zinc-100 border-2 border-black relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-blue-500 border-r-2 border-black" style={{ width: `${w}%` }} />
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[9px] font-black uppercase text-white drop-shadow-md">Category {i}</span>
                    <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[9px] font-black uppercase text-black">{w}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black">
              <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-black">
                <div className="w-12 h-12 bg-zinc-50 border-2 border-black flex items-center justify-center">
                  <PieChart className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Task Efficiency Hub</h3>
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-sm font-bold text-black/60 uppercase leading-snug">
                  Your sessions are performing well. Sync is efficient and up to date.
                </p>
                <Link href="/register" className="skeuo-button bg-black text-white px-8 py-4 font-black uppercase text-xs shadow-[6px_6px_0px_blue] ring-2 ring-black w-fit group">
                  <span>Get Full Access</span>
                  <Zap className="w-4 h-4 ml-2 inline-block group-hover:scale-125 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
