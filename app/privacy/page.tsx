'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Eye, Shield, Lock, Sparkles } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6 pb-24">
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Eye className="w-4 h-4 text-pink-600" />
              <span>Data_Sovereignty</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight italic">
              Privacy<br />Protocols.
            </h1>
          </div>

          <div className="skeuo-panel p-10 bg-white border-2 border-black shadow-[8px_8px_0px_black] ring-4 ring-black space-y-12">
            <div className="border-l-8 border-black pl-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Node_Transparency_01</h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed uppercase">
                Your focal telemetry is yours. We do not sell or distribute your cognitive patterns to third-party clusters.
              </p>
            </div>

            <div className="border-l-8 border-blue-500 pl-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Telemetry_Storage</h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed">
                All session data is encrypted at rest using high-fidelity protocols (AES-256).
              </p>
            </div>

            <div className="border-l-8 border-green-500 pl-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Universal_Rights</h3>
              <p className="text-sm font-bold text-black/70 leading-relaxed uppercase tracking-tighter">
                GDPR / CCPA / YOUR_DATA_YOUR_RULES. Request a full telemetry export at any time.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
