'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Shield, Lock, Eye, Server, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-4xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Fortified Architecture</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Security<br />Hardening.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Engineered to protect your most valuable cognitive asset: focus data.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: Lock,
                title: 'AES-256 Encryption',
                text: 'All telemetry is encrypted in transit via TLS 1.3 and at rest with AES-256. Your focus streams are inaccessible to unauthorized clusters.',
                bg: 'bg-white'
              },
              {
                icon: Server,
                title: 'SOC 2 Infrastructure',
                text: 'Hosted on hardened cloud nodes with 24/7 monitoring, automated backups, and 100% redundancy.',
                points: ['Regular Pentesting', 'DDoS Mitigation', 'Rate Limiting', 'Intrusion Detection'],
                bg: 'bg-blue-50'
              },
              {
                icon: Eye,
                title: 'Privacy Persistence',
                text: 'Full telemetry sovereignty. You own your focus data. Export or burn your repository with one click.',
                bg: 'bg-white'
              },
              {
                icon: CheckCircle,
                title: 'Global Compliance',
                text: 'Operating at the intersection of GDPR, SOC 2 Type II, and CCPA standards.',
                bg: 'bg-pink-50'
              }
            ].map((section, i) => (
              <div key={i} className={`skeuo-panel p-10 border-2 border-black shadow-[6px_6px_0px_black] ${section.bg}`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="skeuo-avatar w-12 h-12 bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_black]">
                    <section.icon className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter border-b-2 border-black pb-1">{section.title}</h2>
                    <p className="text-sm font-bold text-black/70 leading-relaxed">{section.text}</p>
                  </div>
                </div>
                {section.points && (
                  <div className="grid grid-cols-2 gap-3 mt-4 ml-16">
                    {section.points.map((p, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-black rotate-45" />
                        <span className="text-[10px] font-black uppercase tracking-tight text-black/60">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="skeuo-panel p-10 border-4 border-black shadow-[10px_10px_0px_black] bg-zinc-50">
              <div className="flex items-center gap-4 mb-4">
                <AlertTriangle className="w-8 h-8 text-black" />
                <h2 className="text-3xl font-black mb-0 uppercase tracking-tighter">Vulnerability Logic</h2>
              </div>
              <p className="text-sm font-black tracking-tight mb-6">Discovered a protocol leak? Report it directly to our security cluster:</p>
              <div className="text-blue-600 font-black uppercase tracking-widest text-xl hover:underline cursor-pointer">
                security@forgrin.app
              </div>
              <p className="text-[10px] font-bold text-black/40 mt-4">48-hour SLA for critical disclosures.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
