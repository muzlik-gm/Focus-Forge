'use client';

import Link from 'next/link';
import { Mail, MessageSquare, HelpCircle, Send, Sparkles, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Contact Node</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Establish<br />Comms.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto uppercase">
              Direct telemetry patch to our high-fidelity support engineering team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Mail, title: 'Email Node', text: 'support@forgrin.app', bg: 'bg-blue-50' },
              { icon: MessageSquare, title: 'Live Stream', text: 'Instant patch-through.', bg: 'bg-pink-50' },
              { icon: HelpCircle, title: 'Archive Node', text: 'Self-serve troubleshooting.', bg: 'bg-green-50' }
            ].map((method, i) => (
              <div key={i} className={`skeuo-panel p-8 text-center border-2 border-black shadow-[6px_6px_0px_black] ${method.bg} group`}>
                <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-white border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <method.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">{method.title}</h3>
                <p className="text-[10px] font-black uppercase text-blue-600 underline tracking-tight">{method.text}</p>
              </div>
            ))}
          </div>

          <div className="skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black]">
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter border-b-4 border-black pb-4 text-center">Transmission Form</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-3 text-black/40">Identifier</label>
                  <input
                    type="text"
                    placeholder="YOUR FULL NAME..."
                    className="skeuo-input w-full px-4 py-4 bg-zinc-50 border-2 border-black text-xs font-black uppercase focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-3 text-black/40">Return Protocol</label>
                  <input
                    type="email"
                    placeholder="EMAIL@DOMAIN.COM..."
                    className="skeuo-input w-full px-4 py-4 bg-zinc-50 border-2 border-black text-xs font-black uppercase focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-3 text-black/40">Payload Subject</label>
                <input
                  type="text"
                  placeholder="SUBJECT OF INQUIRY..."
                  className="skeuo-input w-full px-4 py-4 bg-zinc-50 border-2 border-black text-xs font-black uppercase focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-3 text-black/40">Data Packet Content</label>
                <textarea
                  rows={6}
                  placeholder="ELABORATE ON YOUR BLOCKER OR INQUIRY..."
                  className="skeuo-input w-full px-4 py-4 bg-zinc-50 border-2 border-black text-xs font-black uppercase resize-none focus:outline-none focus:bg-white"
                />
              </div>
              <button type="submit" className="skeuo-button bg-black text-white px-10 py-5 font-black uppercase text-sm flex items-center justify-center gap-3 w-full group">
                <span>Initiate Transmission</span>
                <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
