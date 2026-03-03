'use client';

import Link from 'next/link';
import { Clock, Target, BarChart3, Users, Zap, Shield, Bell, Calendar, Sparkles, Check, Rocket } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { useEffect, useRef } from 'react';

export default function FeaturesPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Clock,
      title: 'Focus Sessions',
      description: 'Pomodoro-style focus sessions with automatic distraction tracking.',
      benefits: ['Custom durations', 'Pause/resume', 'Session notes', 'Distraction logs'],
      bg: 'bg-blue-50',
      accent: 'var(--accent-blue)'
    },
    {
      icon: Target,
      title: 'Task Management',
      description: 'Organize your work with a powerful task system designed for deep work.',
      benefits: ['Kanban view', 'Priority levels', 'Time estimates', 'Tag organization'],
      bg: 'bg-pink-50',
      accent: 'var(--accent-pink)'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track your productivity with detailed analytics and focus patterns.',
      benefits: ['Daily reports', 'Pattern detection', 'Distraction analysis', 'Streak tracking'],
      bg: 'bg-cyan-50',
      accent: 'var(--accent-cyan)'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team and track collective productivity.',
      benefits: ['Team leaderboards', 'Workspaces', 'Member status', 'Team analytics'],
      bg: 'bg-zinc-50',
      accent: '#000'
    },
    {
      icon: Zap,
      title: 'Smart Workflow',
      description: 'Integrate with your favorite tools and streamline your entire process.',
      benefits: ['Calendar sync', 'API access', 'Webhooks', 'Export data'],
      bg: 'bg-yellow-50',
      accent: '#facc15'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your data is encrypted and secure. We never sell your info.',
      benefits: ['End-to-end encryption', 'Privacy local', 'Data export', 'Account deletion'],
      bg: 'bg-green-50',
      accent: '#22c55e'
    }
  ];

  return (
    <div className="neo-landing min-h-screen text-black relative flex flex-col" ref={pageRef}>
      <MarketingNav />

      <main className="flex-grow pt-32 px-6">
        {/* Hero */}
        <section className="max-w-5xl mx-auto pb-16 text-center border-b-4 border-black">
          <div className="skeuo-badge mb-6 inline-flex items-center gap-3 bg-white border-2 border-black">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-tight">Features</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight text-center">
            Precision Built<br />For Deep Focus.
          </h1>
          <p className="text-base font-bold text-black/70 max-w-xl mx-auto">
            Everything you need to eliminate distractions and reach your peak potential.
          </p>
        </section>

        {/* Features Grid */}
        <section className="max-w-5xl mx-auto py-20">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className={`skeuo-panel p-6 flex flex-col h-full feature-card ${feature.bg} transition-all duration-300 group`}>
                  <div className="mb-6">
                    <div className="skeuo-avatar w-12 h-12 mb-4 bg-white border-2 border-black shadow-[3px_3px_0px_black] group-hover:bg-black group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black mb-2 uppercase tracking-tighter leading-none">{feature.title}</h3>
                    <p className="text-sm font-bold text-black/70 leading-tight">{feature.description}</p>
                  </div>
                  <div className="space-y-3 mb-8 flex-grow">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Check className="w-3.5 h-3.5 text-black flex-shrink-0" />
                        <span className="text-[11px] font-black uppercase text-black/80 tracking-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <button className="skeuo-button bg-white text-black border-2 border-black w-fit hover:bg-black hover:text-white py-2 px-4 text-xs font-black">
                    Details
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto pb-32">
          <div className="skeuo-panel p-12 text-center bg-white border-4 border-black shadow-[10px_10px_0px_black]">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Ready to scale focus?</h2>
            <p className="text-lg font-bold text-black/70 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have mastered their workflow with Forgrin.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register" className="skeuo-button bg-black text-white px-10 py-4 flex items-center gap-3 group">
                <span>Join Forgrin</span>
                <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
