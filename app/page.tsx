'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FocusForge - Master Deep Focus and Build Lasting Productivity Habits',
  description: 'FocusForge helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques. Track your deep work, analyze patterns, and build lasting habits.',
  keywords: ['productivity', 'focus timer', 'deep work', 'task management', 'analytics', 'developer tools', 'time tracking', 'distraction logging'],
  authors: [{ name: 'FocusForge' }],
  openGraph: {
    title: 'FocusForge - Master Deep Focus and Build Lasting Productivity Habits',
    description: 'FocusForge helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques.',
    url: 'https://focusforge.app',
    siteName: 'FocusForge',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/FocusForge.png',
        width: 1200,
        height: 630,
        alt: 'FocusForge Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FocusForge - Master Deep Focus and Build Lasting Productivity Habits',
    description: 'FocusForge helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques.',
    images: ['/FocusForge.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://focusforge.app',
  },
};

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const parallaxOffset = (speed: number) => scrollY * speed;

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      {/* Advanced Parallax Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600"
          style={{ 
            transform: `translateY(${parallaxOffset(0.5)}px)`,
            willChange: 'transform'
          }}
        />
        <div 
          className="absolute top-[40%] left-[5%] w-[400px] h-[400px] gradient-orb bg-purple-600"
          style={{ 
            transform: `translateY(${parallaxOffset(0.3)}px)`,
            willChange: 'transform'
          }}
        />
        <div 
          className="absolute top-[60%] right-[20%] w-[350px] h-[350px] gradient-orb bg-cyan-600"
          style={{ 
            transform: `translateY(${parallaxOffset(0.2)}px)`,
            willChange: 'transform'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 glass-nav z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="FocusForge" className="w-8 h-8" />
              <span className="text-lg font-semibold embossed-text">FocusForge</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-400 hover:text-white transition">Features</a>
              <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition">How it works</a>
              <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition">Pricing</a>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">Sign in</Link>
              <Link href="/register" className="skeuo-button px-5 py-2.5 text-white text-sm font-medium">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight embossed-text">
                  Master deep focus and build lasting productivity habits
                </h1>
                <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                  FocusForge helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques.
                </p>
                <Link 
                  href="/register"
                  className="skeuo-button inline-block px-6 py-3 text-white font-medium"
                >
                  Start focusing for free
                </Link>
              </div>
              <div className="relative">
                <div className="relative aspect-square max-w-lg mx-auto">
                  <div className="skeuo-card h-full flex items-center justify-center p-12">
                    <svg className="w-40 h-40 text-blue-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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

        {/* Features */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 embossed-text">Why FocusForge?</h2>
              <p className="text-zinc-400 text-lg">Everything you need to master deep work</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                  title: 'Precision time tracking',
                  description: 'Track every focus session with millisecond accuracy. Understand exactly where your time goes.'
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                  title: 'Deep analytics',
                  description: 'Visualize your productivity with detailed charts, heatmaps, and actionable insights.'
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                  title: 'Team accountability',
                  description: 'Work together with your team. Share progress and stay accountable to your goals.'
                }
              ].map((feature, i) => (
                <div key={i} className="skeuo-card skeuo-card-hover p-8">
                  <div className="icon-depth w-14 h-14 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 embossed-text">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
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

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 embossed-text">Simple, transparent pricing</h2>
              <p className="text-zinc-400 text-lg">Choose the plan that fits your needs</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free */}
              <div className="notch-card p-8">
                <h3 className="text-xl font-semibold mb-2 embossed-text">Free</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold embossed-text">$0</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Unlimited focus sessions', 'Basic analytics', 'Task management', 'Mobile app'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="skeuo-input block w-full px-4 py-2.5 text-center text-sm font-medium hover:bg-zinc-800/50 transition">
                  Get started
                </Link>
              </div>

              {/* Pro */}
              <div className="pricing-featured p-8 md:scale-105">
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                  Popular
                </div>
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-blue-100">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Free', 'Advanced analytics', 'Weekly reviews', 'Priority support', 'Export data'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-50">
                      <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-600 text-center text-sm font-medium rounded-[20px] transition shadow-lg">
                  Start free trial
                </Link>
              </div>

              {/* Team */}
              <div className="notch-card p-8">
                <h3 className="text-xl font-semibold mb-2 embossed-text">Team</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold embossed-text">$29</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Pro', 'Up to 10 members', 'Team analytics', 'API access', 'Custom integrations'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="skeuo-input block w-full px-4 py-2.5 text-center text-sm font-medium hover:bg-zinc-800/50 transition">
                  Contact sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="skeuo-card p-12">
              <h2 className="text-4xl font-bold mb-6 embossed-text">Ready to master deep focus?</h2>
              <p className="text-xl text-zinc-400 mb-8">
                Join thousands of developers who are already building better productivity habits with FocusForge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/register"
                  className="skeuo-button px-6 py-3 text-white font-medium"
                >
                  Start for free
                </Link>
                <Link 
                  href="/dashboard"
                  className="skeuo-input px-6 py-3 font-medium hover:bg-zinc-800/50 transition"
                >
                  View demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="/logo.png" alt="FocusForge" className="w-8 h-8" />
                  <span className="text-lg font-semibold embossed-text">FocusForge</span>
                </div>
                <p className="text-sm text-zinc-500">
                  Deep work command center for developers.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4 embossed-text">Product</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#features" className="text-zinc-500 hover:text-white transition">Features</a></li>
                  <li><a href="#pricing" className="text-zinc-500 hover:text-white transition">Pricing</a></li>
                  <li><Link href="/dashboard" className="text-zinc-500 hover:text-white transition">Demo</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4 embossed-text">Company</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="text-zinc-500 hover:text-white transition">About</a></li>
                  <li><a href="#" className="text-zinc-500 hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="text-zinc-500 hover:text-white transition">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4 embossed-text">Legal</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="text-zinc-500 hover:text-white transition">Privacy</a></li>
                  <li><a href="#" className="text-zinc-500 hover:text-white transition">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-zinc-800/50 text-center text-sm text-zinc-500">
              © 2026 FocusForge. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
