'use client';

import Link from 'next/link';
import { Target, Users, Heart, Rocket, Sparkles, Check } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-tight">Our Story</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Human-Centric<br />Focus Engineering.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Mission-driven to help you achieve deep work in a world of constant noise.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16 items-center">
            <div className="skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black]">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter border-b-2 border-black pb-4">The Forgrin Philosophy</h2>
              <div className="space-y-6 text-sm font-bold text-black/80 leading-relaxed">
                <p>
                  Forgrin was born from a simple observation: in an age of constant algorithmic distractions, achieving deep, focused work has become an elite skill.
                </p>
                <p>
                  We built Forgrin to bridge the gap between human intention and digital execution. Our design language is tactile and real, because productivity should feel like a physical achievement, not a digital chore.
                </p>
              </div>
            </div>
            <div className="grid gap-6">
              {[
                { icon: Target, title: 'Our Mission', text: 'Empower humans to do their best work through intentional session design.', bg: 'bg-blue-50' },
                { icon: Heart, title: 'Our Core Values', text: 'Privacy-first, user-focused, and committed to zero-lag performance.', bg: 'bg-pink-50' }
              ].map((value, i) => (
                <div key={i} className={`skeuo-panel p-6 ${value.bg} border-2 border-black shadow-[6px_6px_0px_black]`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="skeuo-avatar w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                      <value.icon className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">{value.title}</h3>
                  </div>
                  <p className="text-xs font-bold text-black/70 leading-relaxed">{value.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="skeuo-panel p-10 mb-16 bg-zinc-50 border-2 border-black">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter text-center">Engineered for Excellence.</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                'Zero unnecessary feature bloat',
                'Local-first privacy architecture',
                'Tactile Neo-Brutalist interface',
                'AI-driven focus telemetry',
                'Built for high-performance teams'
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="skeuo-avatar w-8 h-8 flex-shrink-0 bg-white border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight text-black/80">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Scale with us.</h2>
            <p className="text-base font-bold text-black/70 mb-10 max-w-2xl mx-auto">
              We are constantly seeking brilliant minds to help us define the future of deep work.
            </p>
            <Link
              href="/careers"
              className="skeuo-button bg-black text-white px-10 py-5 font-black uppercase text-sm flex items-center gap-3 w-fit mx-auto group"
            >
              <span>View Openings</span>
              <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
