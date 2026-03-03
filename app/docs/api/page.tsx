'use client';

import Link from 'next/link';
import { Code, Key, Webhook, Book, Sparkles, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function APIReferencePage() {
  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Full API Reference</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Focus Stream<br />Endpoints.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto uppercase">
              Programmatic control over your session telemetry and task mutations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="skeuo-panel p-8 bg-white border-2 border-black shadow-[8px_8px_0px_black] group">
              <div className="skeuo-avatar w-12 h-12 mb-6 bg-white border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Authentication</h2>
              <p className="text-xs font-bold text-black/70 mb-6 uppercase leading-tight">Secure your telemetry stream with Bearer tokens.</p>
              <div className="skeuo-panel p-4 bg-zinc-50 border-2 border-black font-mono text-[11px] text-black">
                Authorization: Bearer KEY_0xFFFF
              </div>
              <Link href="/dashboard/settings" className="mt-6 inline-block text-[10px] font-black uppercase text-blue-600 hover:underline">Get API Key →</Link>
            </div>

            <div className="skeuo-panel p-8 bg-white border-2 border-black shadow-[8px_8px_0px_black] group">
              <div className="skeuo-avatar w-12 h-12 mb-6 bg-white border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <Code className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Base Protocol</h2>
              <p className="text-xs font-bold text-black/70 mb-6 uppercase leading-tight">Static endpoint for all REST mutations.</p>
              <div className="skeuo-panel p-4 bg-zinc-50 border-2 border-black font-mono text-[11px] text-black">
                https://api.forgrin.com/v1
              </div>
            </div>
          </div>

          <div className="skeuo-panel p-10 mb-16 bg-white border-4 border-black shadow-[12px_12px_0px_black]">
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter border-b-4 border-black pb-4">Standard Endpoints</h2>
            <div className="grid gap-8">
              {[
                {
                  title: 'Focus Sessions', endpoints: [
                    { method: 'GET', path: '/sessions', desc: 'TELEMETRY LIST' },
                    { method: 'POST', path: '/sessions', desc: 'CREATE SESSION' },
                    { method: 'GET', path: '/sessions/:id', desc: 'SESSION DATA' }
                  ]
                },
                {
                  title: 'Task Mutations', endpoints: [
                    { method: 'GET', path: '/tasks', desc: 'TASK REPOSITORY' },
                    { method: 'POST', path: '/tasks', desc: 'REGISTER TASK' },
                    { method: 'PATCH', path: '/tasks/:id', desc: 'UPDATE STATE' }
                  ]
                }
              ].map((section, i) => (
                <div key={i} className="border-t-2 border-black/10 pt-6 first:border-0 first:pt-0">
                  <h3 className="text-xl font-black mb-4 uppercase tracking-tighter text-blue-600">{section.title}</h3>
                  <div className="grid gap-3">
                    {section.endpoints.map((endpoint, j) => (
                      <div key={j} className="skeuo-panel p-4 bg-zinc-50 border-2 border-black flex items-center gap-4 group/item hover:bg-white transition-colors">
                        <span className={`skeuo-badge py-1 px-3 border-2 border-black text-[9px] font-black uppercase ${endpoint.method === 'GET' ? 'bg-green-400' : endpoint.method === 'POST' ? 'bg-blue-400' : 'bg-orange-400'}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-[11px] font-black font-mono flex-1">{endpoint.path}</code>
                        <span className="text-[9px] font-black uppercase text-black/40 group-hover/item:text-black">{endpoint.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Webhook, title: 'Webhooks', text: 'Real-time telemetry push notifications.', bg: 'bg-green-50' },
              { icon: Book, title: 'Examples', text: 'Multi-language implementation snippets.', bg: 'bg-orange-50' }
            ].map((box, i) => (
              <div key={i} className={`skeuo-panel p-8 border-2 border-black shadow-[6px_6px_0px_black] ${box.bg} group`}>
                <div className="skeuo-avatar w-12 h-12 mb-6 bg-white border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <box.icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">{box.title}</h2>
                <p className="text-xs font-bold text-black/70 mb-6 uppercase">{box.text}</p>
                <button className="text-[10px] font-black uppercase text-black border-b-2 border-black pb-0.5 group-hover:bg-black group-hover:text-white transition-colors">See Guides →</button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
