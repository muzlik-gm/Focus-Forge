import Link from 'next/link';
import { Metadata } from 'next';
import { BarChart3, TrendingUp, Clock, Target, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Analytics & Insights',
  description: 'Deep dive into your productivity patterns with FocusForge analytics and AI-driven insights.',
};

export default function AnalyticsMarketingPage() {
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
              <img src="/logo.png" alt="FocusForge" className="w-10 h-10" />
              <span className="text-xl font-bold embossed-text tracking-tight">FocusForge</span>
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
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>ANALYTICS</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Understand your productivity<br />like never before
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Powerful analytics and AI-driven insights help you identify patterns, optimize your workflow, and achieve your goals.
            </p>
          </div>

          <div className="skeuo-panel p-12 mb-16">
            <div className="aspect-video flex items-center justify-center">
              <BarChart3 className="w-32 h-32 text-zinc-600" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">Time Tracking</h3>
              <p className="text-zinc-300 leading-relaxed">
                See exactly where your time goes with detailed session breakdowns and daily summaries.
              </p>
            </div>

            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">Trend Analysis</h3>
              <p className="text-zinc-300 leading-relaxed">
                Identify patterns in your productivity and discover your peak performance hours.
              </p>
            </div>

            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">Goal Tracking</h3>
              <p className="text-zinc-300 leading-relaxed">
                Set goals and track your progress with visual charts and milestone celebrations.
              </p>
            </div>
          </div>

          {/* Detailed Features */}
          <div className="space-y-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6 embossed-text">Daily Dashboard</h2>
                <p className="text-zinc-300 mb-8 leading-relaxed">
                  Start each day with a clear view of your productivity metrics. See your focus hours, completed tasks, current streak, and distraction count at a glance.
                </p>
                <div className="space-y-4">
                  {['Real-time focus tracking', 'Weekly comparison charts', 'Task completion rates'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeuo-avatar w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="skeuo-panel p-12 aspect-square flex items-center justify-center">
                <BarChart3 className="w-32 h-32 text-zinc-600" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="skeuo-panel p-12 aspect-square flex items-center justify-center md:order-first">
                <TrendingUp className="w-32 h-32 text-zinc-600" />
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-6 embossed-text">Weekly & Monthly Reports</h2>
                <p className="text-zinc-300 mb-8 leading-relaxed">
                  Dive deep into your productivity patterns with comprehensive weekly and monthly reports. Understand what works and what doesn't.
                </p>
                <div className="space-y-4">
                  {['Distraction heatmaps', 'Focus time by hour', 'Month-over-month comparison'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeuo-avatar w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="skeuo-panel p-12 text-center">
            <h2 className="text-4xl font-bold mb-6 embossed-text">Start tracking your productivity today</h2>
            <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
              Get insights that help you work smarter, not harder.
            </p>
            <Link
              href="/register"
              className="skeuo-button inline-flex items-center gap-3 px-8 py-4 text-white font-medium text-lg"
            >
              <span>Try Analytics Free</span>
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
