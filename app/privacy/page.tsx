'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Shield, Sparkles } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-4xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Data Integrity</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Privacy<br />Architecture.
            </h1>
            <p className="text-xs font-black text-black/50">Last updated: March 03, 2026</p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: 'Core Protocol',
                content: 'Forgrin ("we", "our", or "us") is engineered with a privacy-first mandate. This document outlines the technical and legal framework for the telemetry we collect to optimize your deep work sessions.',
                bg: 'bg-white'
              },
              {
                title: 'Data Collection',
                content: 'We process a high-density stream of productivity telemetry, including session timestamps, task descriptors, and focus scores. All and any personally identifiable information (PII) is encrypted at rest using industry-standard protocols.',
                points: ['Session Duration & Frequency', 'Distraction Metadata', 'Task Hierarchy & Completion', 'Encrypted Identity Tokens'],
                bg: 'bg-blue-50'
              },
              {
                title: 'Utilization Strategy',
                content: 'Collected data is exclusively utilized to train your local focus models and provide comparative analytics within your team workspace. We maintain a zero-leak policy regarding third-party data brokerage.',
                bg: 'bg-white'
              },
              {
                title: 'Secure Transmission',
                content: 'All communication between your client and our telemetry clusters is tunneled through TLS 1.3. We undergo regular pentesting to ensure the integrity of your focus data.',
                bg: 'bg-pink-50'
              }
            ].map((section, i) => (
              <div key={i} className={`skeuo-panel p-10 border-2 border-black shadow-[6px_6px_0px_black] ${section.bg}`}>
                <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter border-b-2 border-black pb-2">{section.title}</h2>
                <p className="text-sm font-bold text-black/70 leading-relaxed mb-4">{section.content}</p>
                {section.points && (
                  <ul className="grid grid-cols-2 gap-3 mt-4">
                    {section.points.map((p, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-black rotate-45" />
                        <span className="text-[10px] font-black uppercase tracking-tight text-black/60">{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="skeuo-panel p-10 border-2 border-black shadow-[6px_6px_0px_black] bg-zinc-50">
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Contact Privacy</h2>
              <p className="text-sm font-black tracking-tight mb-4">For data requests or deletion directives, reach out to our legal department:</p>
              <div className="mt-4 text-blue-600 font-black uppercase tracking-widest text-lg hover:underline cursor-pointer">
                privacy@forgrin.app
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
