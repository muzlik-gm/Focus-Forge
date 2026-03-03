import Link from 'next/link';
import { Metadata } from 'next';
import { Briefcase, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the Forgrin team. Explore open positions and career opportunities.',
};

export default function CareersPage() {
  const benefits = [
    'Remote-first culture with flexible hours',
    'Competitive salary and equity',
    'Health, dental, and vision insurance',
    'Unlimited PTO and work-life balance',
    'Learning and development budget'
  ];

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`,
        }} />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
        <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] gradient-orb bg-purple-600" />
      </div>

      {/* Navigation */}
      <nav className="marketing-nav-fixed">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 p-3 rounded-2xl">
              <img src="/logo.png" alt="Forgrin" className="w-10 h-10" />
              <span className="text-xl font-bold embossed-text tracking-tight">Forgrin</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/about" className="skeuo-chip">
                <span className="text-sm">About</span>
              </Link>
              <Link href="/blog" className="skeuo-chip">
                <span className="text-sm">Blog</span>
              </Link>
              <Link href="/login" className="skeuo-chip">
                <span className="text-sm">Sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        <section className="max-w-5xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>CAREERS</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Join Our Team
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              We're a small, remote-first team passionate about helping people do their best work.
            </p>
          </div>

          {/* Not Hiring Notice */}
          <div className="skeuo-panel p-10 mb-12 text-center border-2 border-orange-500/20">
            <div className="skeuo-avatar w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 embossed-text">Not Currently Hiring</h2>
            <p className="text-zinc-300 mb-6 leading-relaxed max-w-2xl mx-auto">
              We're not actively hiring at the moment, but we're always interested in connecting with talented people who share our passion for productivity and focus. If you think you'd be a great fit for our team, we'd love to hear from you for future opportunities.
            </p>
          </div>

          {/* Why Work Here */}
          <div className="skeuo-panel p-10 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold embossed-text">Why Forgrin?</h2>
            </div>
            <p className="text-zinc-300 mb-6 leading-relaxed">
              When we do have openings, here's what you can expect:
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="skeuo-avatar w-8 h-8 flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-zinc-300 leading-relaxed pt-1">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stay in Touch */}
          <div className="skeuo-panel p-10 text-center">
            <h3 className="text-3xl font-bold mb-4 embossed-text">Stay in Touch</h3>
            <p className="text-zinc-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Interested in future opportunities? Send us your resume and tell us why you'd be a great addition to the team. We'll keep your information on file and reach out when we have positions that match your skills.
            </p>
            <a
              href="mailto:careers@forgrin.com"
              className="skeuo-button inline-flex items-center gap-2 px-8 py-4 text-white font-medium text-lg"
            >
              <span>Send Your Resume</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
