'use client';

import { useEffect, useState } from 'react';
import { Download, Mail, Newspaper, Calendar, Rocket, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MarketingNav } from '@/components/layout/MarketingNav';

export default function PressPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReleases() {
      try {
        const res = await fetch('/api/press', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setReleases(data.releases || []);
        }
      } catch (error) {
        console.error('Failed to fetch press releases:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReleases();
  }, []);

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Newspaper className="w-4 h-4 text-blue-600" />
              <span>Media Relations</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Press &<br />Publicity.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              The official source for Forgrin news and updates.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            <div className="lg:col-span-2 skeuo-panel p-10 bg-white border-2 border-black shadow-[8px_8px_0px_black]">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter border-b-2 border-black pb-2 text-blue-600">Institutional Profile</h2>
              <p className="text-sm font-bold text-black/70 leading-relaxed mb-6">
                Forgrin is a productivity platform built for deep work and focus. Founded in 2025, we help people track, improve, and sustain meaningful work habits.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Founded', value: '2025' },
                  { label: 'H.Q.', value: 'Remote-First' },
                  { label: 'Users', value: 'Global' },
                  { label: 'Platform', value: 'Forgrin' }
                ].map((fact, i) => (
                  <div key={i} className="skeuo-panel p-4 bg-zinc-50 border-2 border-black">
                    <p className="text-[9px] font-black uppercase text-black/40">{fact.label}</p>
                    <p className="text-lg font-black uppercase tracking-tighter">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="skeuo-panel p-8 bg-blue-50 border-2 border-black shadow-[6px_6px_0px_black] text-center">
                <Download className="w-8 h-8 mx-auto mb-4" />
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Media Assets</h3>
                <p className="text-[10px] font-bold text-black/70 mb-6">Logos, screenshots, and brand visuals.</p>
                <button className="skeuo-button bg-black text-white px-6 py-3 font-black uppercase text-[9px] w-full">Fetch Kit</button>
              </div>
              <div className="skeuo-panel p-8 bg-pink-50 border-2 border-black shadow-[6px_6px_0px_black] text-center">
                <Mail className="w-8 h-8 mx-auto mb-4" />
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Media Inquiry</h3>
                <p className="text-[10px] font-bold text-black/70 mb-6">Press requests and interview enquiries.</p>
                <a href="mailto:press@forgrin.app" className="text-[11px] font-black uppercase text-blue-600 underline">press@forgrin.app</a>
              </div>
            </div>
          </div>

          {!loading && releases.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter border-b-4 border-black pb-4">Latest News</h2>
              <div className="grid gap-6">
                {releases.map((release: any) => (
                  <div key={release.id} className="skeuo-panel p-8 bg-white border-2 border-black shadow-[6px_6px_0px_black] group transition-all">
                    <div className="flex items-center gap-2 mb-4 text-[9px] font-black uppercase text-black/40">
                      <Calendar className="w-4 h-4" />
                      {new Date(release.publishedAt).toLocaleDateString()}
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter text-blue-600">{release.title}</h3>
                    <p className="text-xs font-bold text-black/70 leading-relaxed">{release.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
