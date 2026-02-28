'use client';

import Link from 'next/link';
import { Rocket, Clock, BarChart3, Users, Sparkles, Star, Target } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { useEffect, useRef } from 'react';

export function LandingContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import('animejs').then((module) => {
      const anime = (module as any).default || module;

      // Hero section animation
      if (heroRef.current) {
        anime({
          targets: heroRef.current.querySelectorAll('.animate-in'),
          translateY: [40, 0],
          opacity: [0, 1],
          duration: 1200,
          delay: anime.stagger(100),
          easing: 'easeOutExpo'
        });
      }

      // Features animation on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && featuresRef.current) {
            anime({
              targets: featuresRef.current.querySelectorAll('.feature-card'),
              translateY: [60, 0],
              opacity: [0, 1],
              duration: 1000,
              delay: anime.stagger(150),
              easing: 'easeOutExpo'
            });
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      if (featuresRef.current) {
        observer.observe(featuresRef.current);
      }
    }).catch(() => {
      // Silently fail if anime.js doesn't load
    });
  }, []);

  return (
    <div className="neo-landing min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      {/* Simplified Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)`,
        }} />

        {/* Blue gradient orbs only */}
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
        <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] gradient-orb bg-blue-500" />
        <div className="absolute top-[60%] right-[20%] w-[350px] h-[350px] gradient-orb bg-cyan-600" />
      </div>

      <MarketingNav />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section with Enhanced Skeuomorphism */}
        <section className="pt-40 pb-32 px-6" ref={heroRef}>
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="skeuo-badge mb-6 flex items-center gap-2 animate-in">
                  <Rocket className="w-4 h-4" />
                  <span>NEW: AI-Powered Focus Insights</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight embossed-text tracking-tight animate-in">
                  Master <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">deep focus</span> and build lasting productivity habits
                </h1>
                <p className="text-xl text-zinc-300 mb-10 leading-relaxed animate-in">
                  FocusForge helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques. Experience an interface that feels as real as it looks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 animate-in">
                  <Link
                    href="/register"
                    className="skeuo-button inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-medium text-lg"
                  >
                    <span>Start focusing for free</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <button className="skeuo-input inline-flex items-center justify-center gap-3 px-8 py-4 font-medium text-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Watch demo</span>
                  </button>
                </div>
              </div>
              <div className="relative animate-in">
                <div className="relative max-w-lg mx-auto">
                  <div className="skeuo-panel p-8">
                    <h3 className="text-xl font-bold mb-6 embossed-text">Key Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Smart Timer</h4>
                          <p className="text-sm text-zinc-400">Customizable focus sessions with automatic tracking</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Analytics Dashboard</h4>
                          <p className="text-sm text-zinc-400">Visualize patterns and track your progress</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center flex-shrink-0">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Task Management</h4>
                          <p className="text-sm text-zinc-400">Organize work and stay on track</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Team Collaboration</h4>
                          <p className="text-sm text-zinc-400">Work together and stay accountable</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="skeuo-card p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 embossed-text">The productivity crisis</h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Research shows developers lose 23 minutes of productivity after each interruption.
                Context switching, endless notifications, and lack of structure destroy deep work.
                FocusForge provides the framework to reclaim your focus and build sustainable productivity habits.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6" ref={featuresRef}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="skeuo-badge mb-4 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>KEY FEATURES</span>
              </div>
              <h2 className="text-5xl font-bold mb-6 embossed-text tracking-tight">Why FocusForge?</h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto">Everything you need to master deep work, wrapped in a tactile experience.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: 'Precision Time Tracking',
                  description: 'Track every focus session with millisecond accuracy. Understand exactly where your time goes with our tactile interface.',
                  color: 'from-blue-500 to-cyan-400',
                  features: ['Session duration tracking', 'Pause/resume functionality', 'Automatic time logging', 'Custom timer presets']
                },
                {
                  icon: BarChart3,
                  title: 'Deep Analytics',
                  description: 'Visualize your productivity with detailed charts, heatmaps, and actionable insights in a beautifully designed dashboard.',
                  color: 'from-blue-600 to-cyan-500',
                  features: ['Weekly performance charts', 'Distraction heatmaps', 'Productivity trends', 'Peak hour analysis']
                },
                {
                  icon: Users,
                  title: 'Team Accountability',
                  description: 'Work together with your team. Share progress and stay accountable to your goals through collaborative features.',
                  color: 'from-cyan-500 to-blue-400',
                  features: ['Team leaderboards', 'Shared goals tracking', 'Progress sharing', 'Collaborative sessions']
                }
              ].map((feature, i) => {
                const IconComponent = feature.icon;
                return (
                  <div key={i} className="skeuo-panel p-10 flex flex-col h-full feature-card">
                    <div className="mb-8">
                      <div className={`skeuo-avatar w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 embossed-text text-center">{feature.title}</h3>
                      <p className="text-zinc-300 text-center leading-relaxed mb-8">{feature.description}</p>
                    </div>
                    <div className="space-y-3 mb-10 flex-grow">
                      {feature.features.map((item, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className={`skeuo-avatar w-6 h-6 flex-shrink-0 bg-gradient-to-br ${feature.color}`}>
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-zinc-300">{item}</span>
                        </div>
                      ))}
                    </div>
                    <button className="skeuo-input w-full px-4 py-3 text-center font-medium hover:bg-zinc-800/50 transition">
                      Learn more
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 embossed-text">How it works</h2>
              <p className="text-zinc-400 text-lg">Simple, effective, and built for your workflow</p>
            </div>
            <div className="space-y-32">
              {/* Step 1 */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-block px-4 py-1.5 skeuo-card text-blue-400 text-sm font-medium mb-4">
                    Step 1
                  </div>
                  <h3 className="text-3xl font-bold mb-4 embossed-text">Start your focus session</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                    Set your timer, choose your task, and begin. FocusForge tracks your session automatically,
                    so you can stay in the zone without worrying about the clock.
                  </p>
                  <ul className="space-y-3">
                    {['Customizable session durations', 'Automatic time tracking', 'Task association'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="step-visual aspect-video p-12">
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-32 h-32 text-blue-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <div className="step-visual aspect-video p-12">
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-32 h-32 text-green-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-block px-4 py-1.5 skeuo-card text-blue-400 text-sm font-medium mb-4">
                    Step 2
                  </div>
                  <h3 className="text-3xl font-bold mb-4 embossed-text">Track and manage distractions</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                    When something pulls your attention away, log it with one click. Build awareness of your
                    distraction patterns and learn to minimize them over time.
                  </p>
                  <ul className="space-y-3">
                    {['One-click distraction logging', 'Pattern recognition', 'Actionable insights'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-block px-4 py-1.5 skeuo-card text-blue-400 text-sm font-medium mb-4">
                    Step 3
                  </div>
                  <h3 className="text-3xl font-bold mb-4 embossed-text">Review and continuously improve</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                    Analyze your weekly performance with detailed analytics. See your progress, identify
                    peak productivity hours, and continuously refine your focus practice.
                  </p>
                  <ul className="space-y-3">
                    {['Weekly performance reviews', 'Peak productivity identification', 'Habit formation tracking'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-400">
                        <div className="w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="step-visual aspect-video p-12">
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-32 h-32 text-purple-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { value: '50K+', label: 'Active users' },
                { value: '2M+', label: 'Focus sessions' },
                { value: '95%', label: 'Satisfaction rate' },
                { value: '40%', label: 'Productivity boost' }
              ].map((stat, i) => (
                <div key={i} className="skeuo-card p-8 text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2 embossed-text">{stat.value}</div>
                  <div className="text-zinc-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics Preview */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 embossed-text">Deep insights at a glance</h2>
              <p className="text-zinc-400 text-lg">Visualize your productivity patterns</p>
            </div>
            <div className="skeuo-card p-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 embossed-text">Weekly Focus Hours</h3>
                    <p className="text-sm text-zinc-500">Hours logged per day for the last 7 days</p>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[65, 45, 80, 55, 70, 40, 90].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div
                          className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500/50 rounded-t-lg relative overflow-hidden"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs text-zinc-500">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                    <p className="text-sm text-zinc-400 mb-1">Total Focus Time</p>
                    <p className="text-3xl font-bold text-white mb-2">12.5h</p>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>+23% vs last week</span>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                    <p className="text-sm text-zinc-400 mb-1">Tasks Completed</p>
                    <p className="text-3xl font-bold text-white mb-2">18</p>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>+12% vs last week</span>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
                    <p className="text-sm text-zinc-400 mb-1">Distraction Rate</p>
                    <p className="text-3xl font-bold text-white mb-2">12%</p>
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                      <span>-5% vs last week</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 embossed-text">Loved by developers worldwide</h2>
              <p className="text-zinc-400 text-lg">See what our users have to say</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "FocusForge transformed how I work. I've doubled my deep work hours in just 3 weeks.",
                  author: "Sarah Chen",
                  role: "Senior Developer"
                },
                {
                  quote: "The analytics helped me identify my peak productivity hours. Game changer for remote work.",
                  author: "Marcus Rodriguez",
                  role: "Tech Lead"
                },
                {
                  quote: "Finally, a productivity tool that actually works. Simple, effective, and beautifully designed.",
                  author: "Emily Watson",
                  role: "Product Engineer"
                }
              ].map((testimonial, i) => (
                <div key={i} className="skeuo-card p-8">
                  <p className="text-zinc-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                    <div>
                      <div className="font-semibold text-sm embossed-text">{testimonial.author}</div>
                      <div className="text-zinc-500 text-xs">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 embossed-text">Integrates with your workflow</h2>
              <p className="text-zinc-400 text-lg">Connect with the tools you already use</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Slack', 'GitHub', 'Jira', 'Notion', 'Trello', 'Asana', 'Linear', 'Discord'].map((tool, i) => (
                <div key={i} className="skeuo-card skeuo-card-hover p-6 flex items-center justify-center">
                  <span className="text-zinc-400 font-medium">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 embossed-text">Frequently asked questions</h2>
              <p className="text-zinc-400 text-lg">Everything you need to know</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "How does FocusForge track my focus sessions?",
                  a: "FocusForge uses a simple timer-based system. Start a session, work on your task, and we'll track the duration automatically. You can pause, resume, or stop anytime."
                },
                {
                  q: "Can I use FocusForge with my team?",
                  a: "Yes! Our Team plan supports up to 10 members with shared analytics, leaderboards, and team insights to keep everyone accountable."
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. We use industry-standard encryption and never share your data with third parties. Your productivity data is yours alone."
                },
                {
                  q: "What's the difference between Free and Pro?",
                  a: "Free includes unlimited sessions and basic analytics. Pro adds advanced analytics, weekly reviews, priority support, and data export capabilities."
                }
              ].map((faq, i) => (
                <div key={i} className="skeuo-card p-6">
                  <h3 className="text-lg font-semibold mb-2 embossed-text">{faq.q}</h3>
                  <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="skeuo-badge mb-4 inline-flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Transparent Pricing</span>
              </div>
              <h2 className="text-5xl font-bold mb-6 embossed-text tracking-tight">Simple, transparent pricing</h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto">Choose the plan that fits your needs. All plans include our signature experience.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-8 overflow-visible">
              {/* Free Plan */}
              <div className="notch-card p-10 flex flex-col h-full mt-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 embossed-text">Free</h3>
                  <p className="text-zinc-400 text-sm mb-6">Perfect for getting started</p>
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-bold embossed-text">$0</span>
                    <span className="text-zinc-400 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-zinc-500">Forever free, no credit card required</p>
                </div>
                <div className="space-y-4 mb-10 flex-grow">
                  {['Up to 3-hour focus sessions', 'Basic session history', 'Manual distraction logging', 'Simple task list', 'Community support'].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="skeuo-input block w-full px-6 py-4 text-center font-medium hover:bg-zinc-800/50 transition text-lg">
                  Get started free
                </Link>
              </div>

              {/* Pro Plan - Featured */}
              <div className="notch-card p-10 flex flex-col h-full relative -mt-4">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="px-5 py-2.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white text-sm font-bold rounded-full shadow-[0_8px_24px_rgba(59,130,246,0.4)] flex items-center gap-2 whitespace-nowrap border border-blue-400/30">
                    <Star className="w-4 h-4 fill-white" />
                    <span>Most Popular</span>
                  </div>
                </div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 embossed-text">Pro</h3>
                  <p className="text-zinc-400 text-sm mb-6">For serious productivity seekers</p>
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-bold embossed-text">$12</span>
                    <span className="text-zinc-400 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-zinc-500">14-day free trial included</p>
                </div>
                <div className="space-y-4 mb-10 flex-grow">
                  {['Everything in Free', 'Unlimited session durations', 'Advanced analytics & productivity insights', 'AI-powered focus recommendations', 'Automatic distraction detection', 'Weekly & monthly performance reports', 'Priority email support', 'Export all your data (CSV/JSON)'].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="skeuo-button block w-full px-6 py-4 text-center font-medium text-white transition text-lg">
                  Start free trial
                </Link>
              </div>

              {/* Team Plan */}
              <div className="notch-card p-10 flex flex-col h-full mt-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 embossed-text">Team</h3>
                  <p className="text-zinc-400 text-sm mb-6">For teams that focus together</p>
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-bold embossed-text">$29</span>
                    <span className="text-zinc-400 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-zinc-500">Per team, up to 10 members</p>
                </div>
                <div className="space-y-4 mb-10 flex-grow">
                  {['Everything in Pro', 'Up to 10 team members', 'Team productivity dashboard', 'Shared focus goals & challenges', 'Team leaderboards & accountability', 'Admin controls & permissions', 'Full API access for integrations', 'SSO & advanced security'].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="skeuo-input block w-full px-6 py-4 text-center font-medium hover:bg-zinc-800/50 transition text-lg">
                  Contact sales
                </Link>
              </div>
            </div>
            <div className="text-center mt-12">
              <p className="text-zinc-400 text-sm">All plans include our signature interface • No hidden fees • Cancel anytime</p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}