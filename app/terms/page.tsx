'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Book, Sparkles } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-4xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Book className="w-4 h-4 text-blue-600" />
              <span>User Agreement</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Terms of<br />Operation.
            </h1>
            <p className="text-xs font-black text-black/50">Last updated: March 03, 2026</p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: 'Operational Binding',
                content: 'By accessing the Forgrin gateway, you agree to comply with our protocol specifications. These terms govern your interaction with our focus telemetry and session orchestration services.',
                bg: 'bg-white'
              },
              {
                title: 'Access License',
                content: 'We grant users a non-exclusive, revocable license to utilize the Forgrin toolkit for professional focus optimization. This license remains active provided the user adheres to our anti-harassment and infrastructure protection policies.',
                bg: 'bg-pink-50'
              },
              {
                title: 'Account Integrity',
                content: 'Users are responsible for the entropy and security of their authentication tokens. Any compromise of session data due to client-side negligence is the primary responsibility of the account holder.',
                points: ['Token Security Management', 'Activity Monitoring', 'Unauthorized Access Reporting'],
                bg: 'bg-white'
              },
              {
                title: 'Prohibited Inputs',
                content: 'Users may not inject malicious payloads, scrapers, or high-velocity automation that degrades the performance of our focus telemetry clusters.',
                bg: 'bg-blue-50'
              },
              {
                title: 'Service Termination',
                content: 'We reserve the absolute right to deactivate accounts that demonstrate patterns of protocol violation or malicious intent without prior warning.',
                bg: 'bg-white'
              }
            ].map((section, i) => (
              <div key={i} className={`skeuo-panel p-10 border-2 border-black shadow-[6px_6px_0px_black] ${section.bg}`}>
                <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter border-b-2 border-black pb-2">{section.title}</h2>
                <p className="text-sm font-bold text-black/70 leading-relaxed mb-4">{section.content}</p>
                {section.points && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {section.points.map((p, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-black" />
                        <span className="text-[10px] font-black uppercase tracking-tight text-black/60">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="skeuo-panel p-10 border-2 border-black shadow-[6px_6px_0px_black] bg-zinc-50">
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Legal Inquiries</h2>
              <p className="text-sm font-black tracking-tight mb-4">Direct institutional or legal correspondence to our compliance cluster:</p>
              <div className="mt-4 text-blue-600 font-black uppercase tracking-widest text-lg hover:underline cursor-pointer transition-colors">
                legal@forgrin.app
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
