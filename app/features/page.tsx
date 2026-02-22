import Link from 'next/link';
import { Clock, Target, BarChart3, Users, Zap, Shield, Bell, Calendar, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function FeaturesPage() {
  const features = [
    {
      icon: Clock,
      title: 'Focus Sessions',
      description: 'Pomodoro-style focus sessions with automatic distraction tracking and comprehensive session history.',
      benefits: ['Customizable durations', 'Pause/resume functionality', 'Session notes', 'Distraction logging'],
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: Target,
      title: 'Task Management',
      description: 'Organize your work with a powerful task management system designed specifically for deep work.',
      benefits: ['Kanban board view', 'Priority levels', 'Time estimates', 'Tag organization'],
      color: 'from-purple-500 to-pink-400'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track your productivity with detailed analytics and AI-powered insights that help you improve.',
      benefits: ['Daily/weekly/monthly reports', 'Focus patterns', 'Distraction analysis', 'Streak tracking'],
      color: 'from-green-500 to-emerald-400'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team and track collective productivity with shared workspaces.',
      benefits: ['Team leaderboards', 'Shared workspaces', 'Member status', 'Team analytics'],
      color: 'from-orange-500 to-red-400'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay informed with intelligent notifications that don\'t break your flow or distract you.',
      benefits: ['Session reminders', 'Achievement alerts', 'Team updates', 'Customizable preferences'],
      color: 'from-indigo-500 to-purple-400'
    },
    {
      icon: Calendar,
      title: 'Weekly Reviews',
      description: 'Reflect on your week with structured reviews and AI-generated summaries of your progress.',
      benefits: ['Automated summaries', 'Reflection prompts', 'Progress tracking', 'Goal setting'],
      color: 'from-pink-500 to-rose-400'
    },
    {
      icon: Zap,
      title: 'Integrations',
      description: 'Connect with your favorite tools and streamline your workflow with powerful integrations.',
      benefits: ['Calendar sync', 'API access', 'Webhooks', 'Export data'],
      color: 'from-yellow-500 to-orange-400'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your data is encrypted and secure. We never sell your information to third parties.',
      benefits: ['End-to-end encryption', 'GDPR compliant', 'Data export', 'Account deletion'],
      color: 'from-cyan-500 to-blue-400'
    }
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
      <nav className="fixed top-0 left-0 right-0 z-50 skeuo-panel" style={{ borderRadius: '0 0 32px 32px' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 skeuo-card-hover p-3 rounded-2xl">
              <img src="/logo.png" alt="FocusForge" className="w-10 h-10" />
              <span className="text-xl font-bold embossed-text tracking-tight">FocusForge</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
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
        <section className="max-w-7xl mx-auto px-6 pt-40 pb-20 text-center">
          <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>FEATURES</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
            Everything you need to<br />stay focused
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            FocusForge combines powerful productivity tools with intelligent insights to help you achieve deep work and build lasting habits.
          </p>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="skeuo-panel p-10">
                  <div className={`skeuo-avatar w-16 h-16 mb-6 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 embossed-text">{feature.title}</h3>
                  <p className="text-zinc-300 mb-6 leading-relaxed">{feature.description}</p>
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`skeuo-avatar w-6 h-6 flex-shrink-0 bg-gradient-to-br ${feature.color}`}>
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-zinc-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="skeuo-panel p-12 text-center">
            <h2 className="text-4xl font-bold mb-6 embossed-text">Ready to transform your productivity?</h2>
            <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
              Start your free trial today. No credit card required. Experience the power of our design.
            </p>
            <Link 
              href="/register" 
              className="skeuo-button inline-flex items-center gap-3 px-8 py-4 text-white font-medium text-lg"
            >
              <span>Get Started Free</span>
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
