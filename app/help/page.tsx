'use client';

import Link from 'next/link';
import { Search, HelpCircle, Book, MessageSquare, Sparkles, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function HelpCenterPage() {
  const faqs = [
    { question: 'How do I start a focus session?', answer: 'Navigate to the Focus page and click the "Start" button. You can customize the duration before starting.' },
    { question: 'Can I pause a focus session?', answer: 'Yes! Click the "Pause" button during a session. Your time will be saved and you can resume later.' },
    { question: 'How do I invite team members?', answer: 'Go to the Team page and click "Invite member". Enter their email and they\'ll receive an invitation link.' },
    { question: 'What happens to my data if I cancel?', answer: 'You can export all your data before canceling. After cancellation, data is retained for 30 days then permanently deleted.' },
    { question: 'Can I use Forgrin offline?', answer: 'Currently, Forgrin requires an internet connection. Offline mode is planned for a future release.' },
    { question: 'How do I change my subscription plan?', answer: 'Go to Settings > Billing and click "Change Plan". You can upgrade or downgrade at any time.' }
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col overflow-x-hidden">
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        <section className="max-w-5xl mx-auto pb-20">
          <div className="text-center mb-16 border-b-4 border-black pb-12">
            <div className="skeuo-badge mb-4 inline-flex items-center gap-3 bg-white border-2 border-black font-black uppercase tracking-tight text-[10px]">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Help Center</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight">
              Knowledge Base &<br />Support Hub.
            </h1>
            <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
              Everything you need to master your focus workflow.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-16">
            <div className="skeuo-input bg-white border-4 border-black shadow-[8px_8px_0px_black] relative flex items-center p-0 overflow-hidden">
              <Search className="ml-6 w-6 h-6 text-black" />
              <input
                type="search"
                placeholder="SEARCH FOR TOPICS..."
                className="w-full pl-4 pr-6 py-6 bg-transparent text-sm font-black uppercase focus:outline-none placeholder:text-black/30"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { href: '/docs', icon: Book, title: 'Docs', desc: 'Detailed guides', bg: 'bg-blue-50' },
              { href: '/docs/api', icon: HelpCircle, title: 'API', desc: 'Technical specs', bg: 'bg-purple-50' },
              { href: '/contact', icon: MessageSquare, title: 'Support', desc: 'Direct help', bg: 'bg-green-50' }
            ].map((item, i) => (
              <Link key={i} href={item.href} className={`skeuo-panel p-8 text-center border-2 border-black shadow-[6px_6px_0px_black] transition-all ${item.bg}`}>
                <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-white border-2 border-black flex items-center justify-center">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">{item.title}</h3>
                <p className="text-[10px] font-bold text-black/70 tracking-tight leading-tight">{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter border-b-4 border-black pb-4">Common Questions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {faqs.map((faq, index) => (
                <div key={index} className="skeuo-panel p-6 bg-white border-2 border-black shadow-[4px_4px_0px_black]">
                  <h3 className="text-sm font-black mb-3 border-b border-black pb-2 leading-tight uppercase">{faq.question}</h3>
                  <p className="text-[11px] font-bold text-black/70 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Need more help?</h2>
            <p className="text-base font-bold text-black/70 mb-10 max-w-2xl mx-auto">
              Our high-density support team is standing by to resolve your technical roadblocks.
            </p>
            <Link
              href="/contact"
              className="skeuo-button bg-black text-white px-10 py-5 font-black uppercase text-sm flex items-center gap-3 w-fit mx-auto group"
            >
              <span>Contact Support</span>
              <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
