'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { HelpCircle, Search, MessageCircle, FileText, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterPage() {
  const commonQuestions = [
    { q: 'How does syncing work?', a: 'Make sure your Forgrin App is updated to the latest version.' },
    { q: 'Billing Issue', a: 'Check your payment status and retry the transaction.' },
    { q: 'Where are the docs?', a: 'Access our official documentation for help.' },
    { q: 'How do I deactivate my account?', a: 'Deactivate your presence across all devices from the settings panel.' },
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6 pb-24">
        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Help & Support</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight italic">
              Knowledge<br />Base.
            </h1>
            <p className="text-sm font-black uppercase text-black/40 max-w-xl mx-auto italic">
              Search for helpful guides.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-20 relative">
            <div className="skeuo-panel p-6 bg-white border-4 border-black shadow-[10px_10px_0px_black] ring-4 ring-black group transition-all focus-within:translate-x-1 focus-within:translate-y-1 focus-within:shadow-none">
              <div className="flex items-center gap-6">
                <Search className="w-8 h-8 text-black opacity-30" />
                <input className="w-full bg-transparent text-xl font-black uppercase placeholder:text-black/10 focus:outline-none" placeholder="SEARCH_PROTOCOL_GUIDES..." />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {[
              { name: 'Core Manual', icon: FileText, color: 'bg-zinc-50' },
              { name: 'API Guidelines', icon: Zap, color: 'bg-blue-50' },
              { name: 'Integration Sync', icon: Sparkles, color: 'bg-pink-50' }
            ].map((cat, i) => (
              <div key={i} className={`skeuo-panel p-8 border-2 border-black shadow-[6px_6px_0px_black] ring-2 ring-black ${cat.color} group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}>
                <div className="w-12 h-12 bg-white border-2 border-black mb-8 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic border-b-2 border-black inline-block pb-0.5">{cat.name}</h3>
                <p className="text-[10px] font-black uppercase text-black/40 mb-10">Access the official documentation for this topic.</p>
                <Link href="/docs" className="skeuo-button bg-black text-white px-6 py-2 uppercase font-black text-[9px] shadow-[4px_4px_0px_blue] ring-2 ring-black">
                  VIEW DOCS
                </Link>
              </div>
            ))}
          </div>

          <div className="skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 border-b-2 border-black inline-block italic">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {commonQuestions.map((q, i) => (
                <div key={i} className="p-4 border-2 border-black flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-zinc-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-2 border-black flex items-center justify-center text-[10px] font-black group-hover:bg-black group-hover:text-white">{i + 1}</div>
                    <span className="text-xs font-black uppercase tracking-tight italic">{q.q}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24 text-center">
            <h4 className="text-xl font-black uppercase tracking-tighter italic mb-8">Still having issues?</h4>
            <Link href="/contact" className="skeuo-button bg-black text-white px-12 py-5 font-black uppercase text-xs shadow-[8px_8px_0px_white] ring-2 ring-black transition-transform hover:scale-110 flex items-center gap-3 w-fit mx-auto">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span>Contact Support</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
