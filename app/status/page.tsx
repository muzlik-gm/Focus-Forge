'use client';

import Link from 'next/link';
import { CheckCircle, Sparkles, Rocket, Activity, Zap } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function StatusPage() {
  const services = [
    { name: 'Telemetry API', status: 'operational', uptime: '99.99%' },
    { name: 'Focus Orchestrator', status: 'operational', uptime: '99.98%' },
    { name: 'Cognitive Database', status: 'operational', uptime: '99.99%' },
    { name: 'Auth Protocol', status: 'operational', uptime: '100%' },
    { name: 'Push Clusters', status: 'operational', uptime: '99.95%' }
  ];

  const incidents = [
    {
      date: '2026-02-15',
      title: 'Node Optimization',
      description: 'Database indexing and performance hardening.',
      status: 'resolved',
      duration: '30m'
    }
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Real-time Telemetry</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Operational<br />Integrity.
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-black" />
              <span className="text-lg font-black uppercase text-green-600 tracking-tighter">Nodes 100% Nominal</span>
            </div>
          </div>

          <div className="skeuo-panel p-10 mb-8 bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter border-b-2 border-black pb-2">Active Services</h2>
            <div className="grid gap-4">
              {services.map((service, index) => (
                <div key={index} className="skeuo-panel p-4 bg-zinc-50 border-2 border-black flex items-center justify-between group hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-black uppercase text-xs tracking-tight">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black uppercase text-black/30">Uptime: {service.uptime}</span>
                    <span className="skeuo-badge bg-green-500 border-2 border-black px-3 py-1 text-[9px] font-black uppercase text-white shadow-[2px_2px_0px_black]">Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="skeuo-panel p-10 bg-white border-2 border-black shadow-[6px_6px_0px_black]">
              <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter border-b-2 border-black pb-2">Archives</h2>
              {incidents.length === 0 ? (
                <p className="text-[10px] font-bold text-black/40">No incidents in the last 30 intervals.</p>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident, index) => (
                    <div key={index} className="skeuo-panel p-4 bg-zinc-50 border-2 border-black">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-black uppercase tracking-tighter text-blue-600">{incident.title}</span>
                        <span className="skeuo-badge bg-green-400 border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase">Resolved</span>
                      </div>
                      <p className="text-[10px] font-black text-black/70 mb-3">{incident.description}</p>
                      <div className="flex items-center gap-3 text-[8px] font-black uppercase text-black/30">
                        <span>{incident.date}</span>
                        <span>•</span>
                        <span>Duration: {incident.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="skeuo-panel p-10 bg-blue-50 border-2 border-black shadow-[6px_6px_0px_black] flex flex-col justify-center text-center">
              <Zap className="w-10 h-10 mx-auto mb-4 text-black" />
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">System Alerts</h2>
              <p className="text-[10px] font-bold text-black/70 mb-8 leading-tight">Subscribe to the high-density alert stream for instant protocol notifications.</p>
              <div className="flex flex-col gap-3">
                <input type="email" placeholder="ENTER EMAIL NODE..." className="skeuo-input px-4 py-4 bg-white border-2 border-black text-xs font-black uppercase focus:outline-none" />
                <button className="skeuo-button bg-black text-white px-8 py-4 font-black uppercase text-xs">Establish Link</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
