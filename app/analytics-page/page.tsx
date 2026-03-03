'use client';

import Link from 'next/link';
import { BarChart3, TrendingUp, Clock, Target, Sparkles, Rocket, Check } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function AnalyticsMarketingPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Full Telemetry</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight text-center">
              Deep Analytics.<br />Clearer Focus.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              High-density insights that quantify your peak performance windows.
            </p>
          </div>

          <div className="skeuo-panel p-10 mb-20 bg-white border-4 border-black shadow-[12px_12px_0px_black] relative overflow-hidden">
            <div className="absolute top-4 right-4 skeuo-badge bg-zinc-100 border-2 border-black text-[9px] font-black uppercase">v1.2_PREVIEW</div>
            <div className="aspect-video bg-zinc-50 border-4 border-black flex items-end justify-between p-12 gap-4">
              {[60, 40, 80, 50, 90, 70, 45, 65, 30, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-500 border-2 border-black shadow-[2px_2px_0px_black]" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="mt-8 text-[11px] font-black uppercase text-black/40 text-center tracking-widest">Telemetry Sample: Weekly Focus Distribution</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              { icon: Clock, title: 'Time Analysis', text: 'Granular session tracking for total transparency.', bg: 'bg-blue-50' },
              { icon: TrendingUp, title: 'Trend Modeling', text: 'Identify growth vectors in your productivity habits.', bg: 'bg-pink-50' },
              { icon: Target, title: 'Goal Metrics', text: 'Visualized milestone tracking with zero-lag updates.', bg: 'bg-green-50' }
            ].map((stat, i) => (
              <div key={i} className={`skeuo-panel p-8 border-2 border-black shadow-[4px_4px_0px_black] ${stat.bg} group`}>
                <div className="skeuo-avatar w-12 h-12 mb-6 bg-white border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">{stat.title}</h3>
                <p className="text-xs font-bold text-black/70 leading-relaxed">{stat.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-12 mb-20">
            {[
              {
                title: 'The Daily Dashboard',
                desc: 'High-fidelity metrics delivered every morning to calibrate your focus strategy.',
                points: ['Real-time focus tracking', 'Team Heatmaps', 'Efficiency Scores'],
                bg: 'bg-white',
                icon: BarChart3
              },
              {
                title: 'Historical Flux',
                desc: 'Deep archival access to your focus telemetry across months and years.',
                points: ['Longitudinal growth charts', 'Peak hour prediction', 'Anomaly detection'],
                bg: 'bg-zinc-50',
                icon: TrendingUp,
                reverse: true
              }
            ].map((feature, i) => (
              <div key={i} className={`skeuo-panel p-12 border-4 border-black shadow-[8px_8px_0px_black] ${feature.bg} flex flex-col md:flex-row gap-12 items-center`}>
                <div className={`flex-1 ${feature.reverse ? 'md:order-last' : ''}`}>
                  <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">{feature.title}</h2>
                  <p className="text-sm font-bold text-black/70 mb-8 leading-relaxed">{feature.desc}</p>
                  <div className="grid gap-3">
                    {feature.points.map((p, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rotate-45" />
                        <span className="text-[10px] font-black tracking-tight text-black/80">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full md:w-1/3 aspect-square bg-white border-4 border-black shadow-[6px_6px_0px_black] flex items-center justify-center">
                  <feature.icon className="w-16 h-16 text-black/20" />
                </div>
              </div>
            ))}
          </div>

          <div className="skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Quantify your success.</h2>
            <p className="text-base font-bold text-black/70 mb-10 max-w-2xl mx-auto">
              Stop guessing. Start measuring your deep work output with high-density telemetry.
            </p>
            <Link
              href="/register"
              className="skeuo-button bg-black text-white px-10 py-5 font-black uppercase text-sm flex items-center gap-3 w-fit mx-auto group"
            >
              <span>Begin Tracking</span>
              <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
