'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Mail, MessageCircle, MapPin, Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6 pb-24">
        <section className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Form Section */}
            <div className="skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black">
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-4xl font-black mb-1 uppercase tracking-tighter italic border-b-4 border-black inline-block pb-2">Direct_Link</h1>
                <p className="text-[10px] font-black uppercase text-black/50 mt-4 leading-relaxed">
                  Establish a high-priority telemetry connection with our support cluster.
                </p>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block tracking-tight">Access_Name</label>
                  <input className="skeuo-input w-full bg-zinc-50 border-2 border-black p-4 text-xs font-black uppercase placeholder:text-black/20" placeholder="ENTER_IDENTITY" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block tracking-tight">Telemetry_Address (Email)</label>
                  <input className="skeuo-input w-full bg-zinc-50 border-2 border-black p-4 text-xs font-black uppercase placeholder:text-black/20" placeholder="YOU@GRID.COM" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block tracking-tight">Transmission_Body</label>
                  <textarea rows={5} className="skeuo-input w-full bg-zinc-50 border-2 border-black p-4 text-xs font-black placeholder:text-black/20" placeholder="DESCRIBE_YOUR_SYNC_NEEDS..." />
                </div>
                <button type="button" onClick={() => setLoading(true)} className="skeuo-button bg-black text-white w-full py-5 font-black uppercase text-sm shadow-[8px_8px_0px_white] ring-4 ring-black hover:bg-zinc-800 transition-all">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'INITIATE_TRANSMISSION'}
                </button>
              </form>
            </div>

            {/* Side Info Section */}
            <div className="flex flex-col gap-8">
              <div className="skeuo-panel p-8 bg-blue-50 border-2 border-black shadow-[6px_6px_0px_black] ring-2 ring-black flex-grow">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic mb-1">Live_Node_Support</h3>
                    <p className="text-[9px] font-black uppercase opacity-40">Cluster Active 24/7</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-black/70 mb-8 border-l-4 border-black pl-4">
                  Join our Discord for immediate low-latency assistance from our engineering community.
                </p>
                <button className="skeuo-button bg-white text-black border-2 border-black px-6 py-3 font-black uppercase text-[10px] shadow-[4px_4px_0px_black] ring-2 ring-black">
                  Connect_Discord
                </button>
              </div>

              <div className="skeuo-panel p-8 bg-zinc-50 border-2 border-black shadow-[6px_6px_0px_black] ring-2 ring-black">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-black" />
                    <span className="text-[10px] font-black uppercase">node.support@forgrin.com</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Globe className="w-5 h-5 text-black" />
                    <span className="text-[10px] font-black uppercase">forgrin.com/global-nodes</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-black" />
                    <span className="text-[10px] font-black uppercase italic">DECENTRALIZED_INFRASTRUCTURE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
