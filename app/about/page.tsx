import Link from 'next/link';
import { Metadata } from 'next';
import { Target, Users, Heart, Rocket } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the Forgrin team and our mission to help you achieve deep work.',
};

export default function AboutPage() {
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
              <Link href="/features" className="skeuo-chip">
                <span className="text-sm">Features</span>
              </Link>
              <Link href="/pricing" className="skeuo-chip">
                <span className="text-sm">Pricing</span>
              </Link>
              <Link href="/login" className="skeuo-chip">
                <span className="text-sm">Sign in</span>
              </Link>
              <Link href="/register" className="skeuo-button px-6 py-3 text-white font-medium flex items-center gap-2">
                <span>Get started</span>
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
              <Rocket className="w-4 h-4" />
              <span>ABOUT US</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              About Forgrin
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              We're on a mission to help people achieve deep work and build lasting productivity habits.
            </p>
          </div>

          {/* Our Story */}
          <div className="skeuo-panel p-10 mb-12">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Our Story</h2>
            <p className="text-zinc-300 mb-6 leading-relaxed">
              Forgrin was born from a simple observation: in an age of constant distractions, achieving deep, focused work has become increasingly difficult. We built Forgrin to help individuals and teams reclaim their attention and accomplish meaningful work.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Our design philosophy brings a tactile, real-world feel to digital productivity tools, making the experience more intuitive and engaging. We believe that beautiful, thoughtful design can make productivity tools not just functional, but delightful to use.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">Our Mission</h3>
              <p className="text-zinc-300 leading-relaxed">
                Empower people to do their best work through focus and intentionality.
              </p>
            </div>

            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">Our Team</h3>
              <p className="text-zinc-300 leading-relaxed">
                A small, dedicated team passionate about productivity and focus.
              </p>
            </div>

            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">Our Values</h3>
              <p className="text-zinc-300 leading-relaxed">
                Privacy-first, user-focused, and committed to sustainable productivity.
              </p>
            </div>
          </div>

          {/* Why Forgrin */}
          <div className="skeuo-panel p-10 mb-12">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Why Forgrin?</h2>
            <p className="text-zinc-300 mb-6 leading-relaxed">
              Unlike other productivity tools that add complexity, Forgrin is designed to be simple, focused, and effective. We believe that the best productivity tool is one that gets out of your way and lets you work.
            </p>
            <div className="space-y-4">
              {[
                'No unnecessary features or distractions',
                'Privacy-first approach - your data is yours',
                'Built by people who care about deep work',
                'Continuously improving based on user feedback',
                'Beautiful design that feels real'
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="skeuo-avatar w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-zinc-300 leading-relaxed pt-1">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Join Us CTA */}
          <div className="skeuo-panel p-10 text-center">
            <h3 className="text-3xl font-bold mb-4 embossed-text">Join Us</h3>
            <p className="text-zinc-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              We're always looking for talented people who share our passion for productivity and focus. Check out our open positions and become part of the team.
            </p>
            <Link
              href="/careers"
              className="skeuo-button inline-flex items-center gap-2 px-8 py-4 text-white font-medium text-lg"
            >
              <span>View Open Positions</span>
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
