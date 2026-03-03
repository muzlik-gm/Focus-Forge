'use client';

import Link from 'next/link';
import { Book, Code, Zap, Shield, Search, Sparkles, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function DocsPage() {
  const sections = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Master the basics of Forgrin focus architecture.',
      bg: 'bg-blue-50',
      links: [
        { title: 'Quick Start Guide', href: '/docs/quick-start' },
        { title: 'First Session', href: '/docs/first-session' },
        { title: 'Task Logic', href: '/docs/tasks' },
        { title: 'Analytics 101', href: '/docs/analytics' }
      ]
    },
    {
      icon: Zap,
      title: 'Deep Work Features',
      description: 'Advanced telemetry and session management.',
      bg: 'bg-pink-50',
      links: [
        { title: 'Focus Sessions', href: '/docs/focus-sessions' },
        { title: 'Kanban Logic', href: '/docs/task-management' },
        { title: 'Weekly Reviews', href: '/docs/weekly-reviews' },
        { title: 'Team Workspaces', href: '/docs/team' }
      ]
    },
    {
      icon: Code,
      title: 'REST Telemetry API',
      description: 'Integrate Forgrin into your custom stack.',
      bg: 'bg-cyan-50',
      links: [
        { title: 'Authentication', href: '/docs/api/auth' },
        { title: 'Session Endpoints', href: '/docs/api/sessions' },
        { title: 'Task Mutation', href: '/docs/api/tasks' },
        { title: 'Webhook Hooks', href: '/docs/api/webhooks' }
      ]
    },
    {
      icon: Shield,
      title: 'Security Protocols',
      description: 'How we engineer data privacy and safety.',
      bg: 'bg-green-50',
      links: [
        { title: 'Infrastructure', href: '/docs/security' },
        { title: 'Privacy Logic', href: '/docs/privacy' },
        { title: 'Data Extraction', href: '/docs/data-export' },
        { title: 'GDPR Stack', href: '/docs/gdpr' }
      ]
    }
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Full Documentation</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight text-center">
              The Focus<br />Standard.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Comprehensive technical guides for the modern deep worker.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-16">
            <div className="skeuo-input bg-white border-4 border-black shadow-[8px_8px_0px_black] relative flex items-center p-0 overflow-hidden">
              <Search className="ml-6 w-6 h-6 text-black" />
              <input
                type="search"
                placeholder="SEARCH FOR GUIDES..."
                className="w-full pl-4 pr-6 py-6 bg-transparent text-sm font-black uppercase focus:outline-none placeholder:text-black/30"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div key={index} className={`skeuo-panel p-8 border-2 border-black shadow-[6px_6px_0px_black] ${section.bg} transition-all group`}>
                  <div className="skeuo-avatar w-12 h-12 mb-6 bg-white border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">{section.title}</h2>
                  <p className="text-xs font-bold text-black/70 mb-8 leading-tight">{section.description}</p>
                  <ul className="grid gap-3">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <Link href={link.href} className="flex items-center gap-3 group/link">
                          <div className="w-4 h-4 bg-white border border-black flex items-center justify-center group-hover/link:bg-black group-hover/link:text-white transition-colors">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <span className="text-[10px] font-black text-black hover:underline tracking-tight uppercase">{link.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-20 skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Need a deeper dive?</h2>
            <p className="text-base font-bold text-black/70 mb-10 max-w-2xl mx-auto">
              Our high-fidelity API reference provides full programmatic specifications for custom implementations.
            </p>
            <Link
              href="/docs/api"
              className="skeuo-button bg-black text-white px-10 py-5 font-black uppercase text-sm flex items-center gap-3 w-fit mx-auto group"
            >
              <span>View API Docs</span>
              <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
