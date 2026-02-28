import Link from 'next/link';
import { Metadata } from 'next';
import { Search, HelpCircle, Book, MessageSquare, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers, view FAQs, and get support for FocusForge.',
};

export default function HelpCenterPage() {
  const faqs = [
    { question: 'How do I start a focus session?', answer: 'Navigate to the Focus page and click the "Start" button. You can customize the duration before starting.' },
    { question: 'Can I pause a focus session?', answer: 'Yes! Click the "Pause" button during a session. Your time will be saved and you can resume later.' },
    { question: 'How do I invite team members?', answer: 'Go to the Team page and click "Invite member". Enter their email and they\'ll receive an invitation link.' },
    { question: 'What happens to my data if I cancel?', answer: 'You can export all your data before canceling. After cancellation, data is retained for 30 days then permanently deleted.' },
    { question: 'Can I use FocusForge offline?', answer: 'Currently, FocusForge requires an internet connection. Offline mode is planned for a future release.' },
    { question: 'How do I change my subscription plan?', answer: 'Go to Settings > Billing and click "Change Plan". You can upgrade or downgrade at any time.' }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`,
        }} />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
        <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] gradient-orb bg-purple-600" />
      </div>

      <nav className="marketing-nav-fixed">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 p-3 rounded-2xl">
              <img src="/logo.png" alt="FocusForge" className="w-10 h-10" />
              <span className="text-xl font-bold embossed-text tracking-tight">FocusForge</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/docs" className="skeuo-chip"><span className="text-sm">Docs</span></Link>
              <Link href="/contact" className="skeuo-chip"><span className="text-sm">Contact</span></Link>
              <Link href="/login" className="skeuo-chip"><span className="text-sm">Sign in</span></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <section className="max-w-5xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>HELP CENTER</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">Help Center</h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-8">Find answers to common questions and get help with FocusForge.</p>

            <div className="max-w-2xl mx-auto skeuo-input relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input type="search" placeholder="Search for help..." className="w-full pl-12 pr-4 py-4 bg-transparent text-sm focus:outline-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Link href="/docs" className="skeuo-panel p-8 text-center skeuo-card-hover">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Book className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">Documentation</h3>
              <p className="text-sm text-zinc-300">Comprehensive guides and tutorials</p>
            </Link>

            <Link href="/docs/api" className="skeuo-panel p-8 text-center skeuo-card-hover">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">API Reference</h3>
              <p className="text-sm text-zinc-300">Technical documentation for developers</p>
            </Link>

            <Link href="/contact" className="skeuo-panel p-8 text-center skeuo-card-hover">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">Contact Support</h3>
              <p className="text-sm text-zinc-300">Get help from our team</p>
            </Link>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 embossed-text">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="skeuo-panel p-6 group">
                  <summary className="font-semibold cursor-pointer list-none flex items-center justify-between embossed-text">
                    {faq.question}
                    <HelpCircle className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-zinc-300 mt-4 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="skeuo-panel p-12 text-center">
            <h3 className="text-3xl font-bold mb-4 embossed-text">Still need help?</h3>
            <p className="text-zinc-300 mb-8 leading-relaxed max-w-2xl mx-auto">Our support team is here to help you get the most out of FocusForge.</p>
            <Link href="/contact" className="skeuo-button inline-flex items-center gap-2 px-8 py-4 text-white font-medium text-lg">
              <span>Contact Support</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
