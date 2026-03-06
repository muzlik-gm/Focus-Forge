'use client';

import Link from 'next/link';
import { Users, MessageCircle, Github, Twitter, BookOpen, CheckCircle, Sparkles, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function CommunityPage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Global Network</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Connect &<br />Grow Together.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto uppercase">
              Connect with thousands of focused people working on their best work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              {
                icon: MessageCircle,
                title: 'Discord Server',
                text: 'Real-time discussion and focus communities.',
                btn: 'Join Discord',
                href: 'https://discord.gg/forgrin',
                bg: 'bg-blue-50'
              },
              {
                icon: BookOpen,
                title: 'Developer API',
                text: 'Integrate Forgrin into your custom workflow.',
                btn: 'View Docs',
                href: '/docs/api',
                bg: 'bg-zinc-100'
              },
              {
                icon: Twitter,
                title: 'X / Twitter',
                text: 'High-velocity focus tips and project updates.',
                btn: 'Follow @Forgrin',
                href: 'https://twitter.com/forgrin',
                bg: 'bg-cyan-50'
              },
              {
                icon: BookOpen,
                title: 'Knowledge Base',
                text: 'Deep dive into user stories and productivity labs.',
                btn: 'Read Blog',
                href: '/blog',
                bg: 'bg-pink-50'
              }
            ].map((channel, i) => (
              <a
                key={i}
                href={channel.href}
                target={channel.href.startsWith('http') ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`skeuo-panel p-8 flex flex-col border-2 border-black shadow-[6px_6px_0px_black] group transition-all ${channel.bg}`}
              >
                <div className="skeuo-avatar w-14 h-14 bg-white border-2 border-black flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                  <channel.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">{channel.title}</h3>
                <p className="text-xs font-bold text-black/70 mb-8 uppercase leading-tight">{channel.text}</p>
                <div className="mt-auto skeuo-button bg-black text-white px-6 py-3 font-black uppercase text-[10px] flex items-center gap-2 w-fit">
                  <span>{channel.btn}</span>
                  <Rocket className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>

          <div className="skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black]">
            <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter border-b-4 border-black pb-4 text-center">Community Standards</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                'Radical transparency in focus sharing.',
                'Supportive interaction across all members.',
                'Constructive feedback and bug reports.',
                'Zero tolerance for spam or disruptive behavior.',
                'Collaborative optimization of work habits.'
              ].map((protocol, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="skeuo-avatar w-8 h-8 flex-shrink-0 bg-zinc-50 border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tight">{protocol}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
