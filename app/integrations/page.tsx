'use client';

import Link from 'next/link';
import { Calendar, Webhook, Code, Zap, Sparkles, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'Google Calendar',
      description: 'Sync your focus sessions with Google Calendar',
      status: 'Coming Soon',
      icon: Calendar,
      bg: 'bg-blue-50'
    },
    {
      name: 'Slack',
      description: 'Get notifications in your Slack workspace',
      status: 'Coming Soon',
      icon: Zap,
      bg: 'bg-pink-50'
    },
    {
      name: 'Webhooks',
      description: 'Send events to your custom endpoints',
      status: 'Available',
      icon: Webhook,
      bg: 'bg-green-50'
    },
    {
      name: 'REST API',
      description: 'Full programmatic access to your data',
      status: 'Available',
      icon: Code,
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-tight">Integrations</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Unified<br />Workflow.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Connect Forgrin with your favorite tools and eliminate context switching.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {integrations.map((integration, index) => {
              const IconComponent = integration.icon;
              return (
                <div key={index} className={`skeuo-panel p-8 ${integration.bg} flex flex-col border-2 border-black shadow-[6px_6px_0px_black] transition-all group`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="skeuo-avatar w-14 h-14 bg-white border-2 border-black shadow-[4px_4px_0px_black] group-hover:bg-black group-hover:text-white transition-colors">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div className={`skeuo-badge px-3 py-1 border-2 border-black text-[9px] font-black uppercase ${integration.status === 'Available' ? 'bg-green-400' : 'bg-zinc-200'}`}>
                      {integration.status}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase">{integration.name}</h3>
                  <p className="text-sm font-bold text-black/70 leading-relaxed">{integration.description}</p>
                </div>
              );
            })}
          </div>

          <div className="skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Custom Requirements?</h2>
            <p className="text-base font-bold text-black/70 mb-10 max-w-2xl mx-auto">
              Our high-density API provides full programmatic access to your focus telemetry.
            </p>
            <Link
              href="/docs/api"
              className="skeuo-button bg-black text-white inline-flex items-center gap-3 px-10 py-4 font-black uppercase text-sm group"
            >
              <span>Explore API</span>
              <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
