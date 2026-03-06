'use client';

import Link from 'next/link';
import { Rocket, Clock, BarChart3, Users, Sparkles, Star, Target, Check } from 'lucide-react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { useEffect, useRef } from 'react';

export function LandingContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import('animejs').then((module) => {
      const anime = (module as any).default || module;

      // Snappy entrance
      if (heroRef.current) {
        anime({
          targets: heroRef.current.querySelectorAll('.animate-in'),
          translateY: [10, 0],
          opacity: [0, 1],
          duration: 400,
          delay: anime.stagger(50),
          easing: 'easeOutQuad'
        });
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && featuresRef.current) {
            anime({
              targets: featuresRef.current.querySelectorAll('.feature-card'),
              translateY: [20, 0],
              opacity: [0, 1],
              duration: 400,
              delay: anime.stagger(60),
              easing: 'easeOutQuad'
            });
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      if (featuresRef.current) {
        observer.observe(featuresRef.current);
      }
    }).catch(() => { });
  }, []);

  return (
    <div className="neo-landing min-h-screen text-white relative overflow-x-hidden">

      <MarketingNav />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section with Enhanced Skeuomorphism */}
        <section className="pt-32 pb-24 px-6 relative overflow-visible" ref={heroRef}>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="skeuo-badge mb-6 flex items-center gap-3 animate-in w-fit bg-white border-2 border-black">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black uppercase tracking-tighter">New: Enhanced Productivity Insights</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black mb-4 leading-[0.9] embossed-text tracking-tighter uppercase">
                  Master your <span className="text-blue-600">focus.</span><br />reclaim your day.
                </h1>
                <p className="text-base text-black font-bold mb-6 leading-tight animate-in max-w-lg">
                  Forgrin eliminates distractions with a proven methodology. Built for high-performance teams who value deep work.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 animate-in">
                  <Link
                    href="/register"
                    className="skeuo-button text-xl px-10 py-5 group"
                  >
                    <span>Get Started Free</span>
                    <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                  <button className="skeuo-input bg-zinc-100 text-black text-xl px-10 py-5 flex items-center gap-3 hover:translate-x-1 hover:translate-y-1 transition-all">
                    <Star className="w-6 h-6 fill-yellow-400 text-black" />
                    <span>View Showcase</span>
                  </button>
                </div>
              </div>
              <div className="relative animate-in perspective-1000">
                <div className="relative z-10 rotate-[2deg] hover:rotate-0 transition-all duration-500 ease-out">
                  <div className="skeuo-panel p-10 bg-white min-h-[400px] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-10 border-b-4 border-black pb-6">
                      <div className="flex gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-black" />
                        <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-black" />
                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
                      </div>
                      <div className="skeuo-badge bg-zinc-100 px-4 py-1 text-[10px] font-black">FORGRIN DASHBOARD</div>
                    </div>

                    <div className="flex-grow space-y-8">
                      <div className="flex items-end gap-4 h-32">
                        {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500 border-2 border-black shadow-[2px_2px_0px_black]" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="skeuo-card p-4 bg-pink-100 border-2 border-black">
                          <div className="text-[10px] font-black text-pink-600 mb-1 uppercase">Deep Work</div>
                          <div className="text-2xl font-black">4.2h</div>
                        </div>
                        <div className="skeuo-card p-4 bg-cyan-100 border-2 border-black">
                          <div className="text-[10px] font-black text-cyan-600 mb-1 uppercase">Efficiency</div>
                          <div className="text-2xl font-black">94%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative floating elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300 border-4 border-black rounded-full mix-blend-multiply animate-bounce z-0" style={{ animationDuration: '4s' }} />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-400 border-4 border-black shadow-[8px_8px_0px_black] z-20 rotate-[-12deg]" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="skeuo-card p-8 text-center bg-white border-4 border-black shadow-[8px_8px_0px_black]">
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Deep work is a superpower.</h2>
              <p className="text-lg text-black font-bold leading-tight">
                Research shows that context switching and constant notifications destroy focus.
                Forgrin provides the structure you need to enter the zone and stay there.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 relative z-10" ref={featuresRef}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="skeuo-badge mb-3 inline-flex bg-pink-400 border-2 border-black">
                <Sparkles className="w-4 h-4 text-black" />
                <span className="text-black font-black uppercase text-[10px]">Professional Tools</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black mb-3 embossed-text tracking-tighter uppercase leading-tight">
                Engineered for <br /><span className="bg-white px-3 border-2 border-black">Flow States</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: 'Focused Timer',
                  description: 'A distraction-free timer designed to keep you in the flow. Perfect for Pomodoro or custom deep work sessions.',
                  accent: 'var(--accent-blue)',
                  bg: 'bg-blue-50',
                  features: ['Custom session lengths', 'Visual focus goals', 'Automatic rest breaks', 'Session history']
                },
                {
                  icon: BarChart3,
                  title: 'Powerful Analytics',
                  description: 'Track your progress with beautiful, intuitive charts. Understand your focus patterns and peak performance hours.',
                  accent: 'var(--accent-pink)',
                  bg: 'bg-pink-50',
                  features: ['Focus time tracking', 'Efficiency metrics', 'Interactive heatmaps', 'Weekly performance summaries']
                },
                {
                  icon: Users,
                  title: 'Team Collaboration',
                  description: 'Work together with your team. Share focus goals and keep each other accountable without the noise.',
                  accent: 'var(--accent-cyan)',
                  bg: 'bg-cyan-50',
                  features: ['Shared focus goals', 'Team leaderboards', 'Presence indicators', 'Collaborative sessions']
                }
              ].map((feature, i) => {
                const IconComponent = feature.icon;
                return (
                  <div key={i} className={`skeuo-panel p-6 flex flex-col h-full feature-card ${feature.bg} transition-all duration-300 group`}>
                    <div className="mb-6">
                      <div className="skeuo-avatar w-12 h-12 mb-4 bg-white border-2 border-black shadow-[3px_3px_0px_black] group-hover:bg-black group-hover:text-white transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black mb-2 uppercase tracking-tighter leading-none">{feature.title}</h3>
                      <p className="text-sm font-bold text-black/70 leading-tight">{feature.description}</p>
                    </div>
                    <div className="space-y-3 mb-8 flex-grow">
                      {feature.features.map((item, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <Check className="w-3.5 h-3.5 text-black flex-shrink-0" />
                          <span className="text-[11px] font-black uppercase text-black/80 tracking-tight">{item}</span>
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
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <div className="text-left mb-16 border-l-4 border-black pl-6">
              <h2 className="text-4xl lg:text-5xl font-black mb-2 uppercase tracking-tighter leading-tight text-black">The Forgrin<br />Method.</h2>
              <p className="text-black text-lg font-black opacity-80">Simple. Effective. Professional.</p>
            </div>

            <div className="space-y-48">
              {/* Step 1 */}
              <div className="grid lg:grid-cols-2 gap-32 items-center">
                <div>
                  <div className="skeuo-badge bg-blue-500 text-white px-4 py-1 mb-6 inline-block font-black text-xs border-2 border-black">
                    Step 01
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase leading-none tracking-tighter">Start your session.</h3>
                  <p className="text-black text-lg font-bold leading-tight mb-6">
                    Set your focus target, choose a session length, and enter the zone. Our interface provides the physical feedback your brain requires.
                  </p>
                  <div className="space-y-3">
                    {['Tactile Interface', 'Session Buffer', 'Goal Orientation'].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-10 h-5 border-2 border-black bg-zinc-100 group-hover:bg-blue-300 transition-colors flex-shrink-0" />
                        <span className="text-sm font-black uppercase">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="skeuo-panel p-6 bg-zinc-100 rotate-2 border-4 border-black shadow-[12px_12px_0px_black]">
                    <div className="aspect-video bg-white border-4 border-black flex flex-col items-center justify-center p-12 overflow-hidden relative">
                      {/* Timer visual */}
                      <div className="w-40 h-40 rounded-full border-[10px] border-blue-500 flex items-center justify-center border-t-zinc-200">
                        <div className="text-4xl font-black italic">25:00</div>
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 text-center font-black uppercase text-[10px] tracking-widest opacity-80">ACTIVE SESSION</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid lg:grid-cols-2 gap-32 items-center">
                <div className="order-2 lg:order-1 relative">
                  <div className="skeuo-panel p-6 bg-zinc-100 rotate-[-2deg] border-4 border-black shadow-[12px_12px_0px_black]">
                    <div className="aspect-video bg-white border-4 border-black flex flex-col p-8 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 border-b-2 border-zinc-200 pb-2">
                          <div className="w-6 h-6 border-2 border-black bg-pink-100" />
                          <div className="h-4 bg-zinc-200 rounded-full flex-grow border border-black/10" />
                        </div>
                      ))}
                      <div className="mt-auto bg-black text-white p-4 font-black uppercase text-center">
                        LOG_ENTRY_SAVED
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="skeuo-badge bg-pink-500 text-white px-4 py-1 mb-6 inline-block font-black text-xs border-2 border-black">
                    Step 02
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase leading-none tracking-tighter">Manage distractions.</h3>
                  <p className="text-black text-lg font-bold leading-tight mb-6">
                    Instantly capture distractions and get back to work. Organize your logs to understand your behavior patterns.
                  </p>
                  <div className="space-y-3">
                    {['Quick Entry', 'Categorization', 'Focus Protection'].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-10 h-5 border-2 border-black bg-zinc-100 group-hover:bg-pink-300 transition-colors flex-shrink-0" />
                        <span className="text-sm font-black uppercase">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid lg:grid-cols-2 gap-32 items-center">
                <div>
                  <div className="skeuo-badge bg-cyan-500 text-white px-4 py-1 mb-6 inline-block font-black text-xs border-2 border-black">
                    Step 03
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase leading-none tracking-tighter">Improve every day.</h3>
                  <p className="text-black text-lg font-bold leading-tight mb-6 opacity-70">
                    Review your progress with deep insights. Identify peak productivity hours and optimize your schedule.
                  </p>
                  <div className="space-y-3">
                    {['Productivity Trends', 'Peak Performance', 'Detailed Reports'].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-10 h-5 border-2 border-black bg-zinc-100 group-hover:bg-cyan-300 transition-colors flex-shrink-0" />
                        <span className="text-sm font-black uppercase">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="skeuo-panel p-6 bg-zinc-100 rotate-1 border-4 border-black shadow-[12px_12px_0px_black]">
                    <div className="aspect-video bg-white border-4 border-black flex items-end justify-between p-8 gap-2">
                      {[40, 20, 60, 45, 90, 70, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-cyan-500 border-2 border-black" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '2M+', label: 'Sessions' },
                { value: '95%', label: 'Retention' },
                { value: '40%', label: 'Higher output' }
              ].map((stat, i) => (
                <div key={i} className="skeuo-card p-6 text-center bg-white border-2 border-black shadow-[4px_4px_0px_black]">
                  <div className="text-3xl font-black text-blue-600 mb-1 uppercase">{stat.value}</div>
                  <div className="text-black font-black uppercase text-[9px] tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics Preview */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Focus Analytics.</h2>
              <p className="text-black font-black text-lg">Everything you need to optimize your workday.</p>
            </div>
            <div className="skeuo-card p-12 bg-zinc-50 border-4 border-black shadow-[16px_16px_0px_black]">
              <div className="grid lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2">
                  <div className="mb-10">
                    <h3 className="text-3xl font-black mb-2 uppercase">Your Focus Activity</h3>
                    <p className="text-sm text-black font-bold">Average sessions over the past week.</p>
                  </div>
                  <div className="h-80 flex items-end justify-between gap-4">
                    {[65, 45, 80, 55, 70, 40, 90].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                        <div
                          className="w-full bg-blue-500 border-4 border-black shadow-[4px_4px_0px_black] relative transition-all group-hover:bg-blue-400"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs font-black uppercase">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="p-8 bg-blue-100 border-4 border-black shadow-[8px_8px_0px_black]">
                    <p className="text-xs font-black uppercase text-blue-600 mb-2">Total Focus Time</p>
                    <p className="text-4xl font-black text-black">12.5h</p>
                  </div>
                  <div className="p-8 bg-green-100 border-4 border-black shadow-[8px_8px_0px_black]">
                    <p className="text-xs font-black uppercase text-green-600 mb-2">Tasks Completed</p>
                    <p className="text-4xl font-black text-black">18</p>
                  </div>
                  <div className="p-8 bg-pink-100 border-4 border-black shadow-[8px_8px_0px_black]">
                    <p className="text-xs font-black uppercase text-pink-600 mb-2">Focus Score</p>
                    <p className="text-4xl font-black text-black">92%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter leading-none">Trusted By Teams.</h2>
              <p className="text-black font-black text-sm">Real world experiences.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "Forgrin transformed how I work. Doubled my productivity in just a few days.",
                  author: "Sarah Chen",
                  role: "Software Engineer"
                },
                {
                  quote: "Identified peak performance windows instantly. Game changer for remote teams.",
                  author: "Marcus Rodriguez",
                  role: "Product Manager"
                },
                {
                  quote: "Finally, a productivity tool that actually works. Simple, effective, and sharp.",
                  author: "Emily Watson",
                  role: "Tech Lead"
                }
              ].map((testimonial, i) => (
                <div key={i} className="skeuo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_black]">
                  <p className="text-sm font-bold text-black mb-4 leading-normal italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black border-2 border-black flex-shrink-0" />
                    <div>
                      <div className="font-black text-[11px] uppercase tracking-tighter leading-none">{testimonial.author}</div>
                      <div className="text-black/60 font-black uppercase text-[9px]">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter leading-none text-black">Seamless Integrations.</h2>
              <p className="text-black font-bold text-sm opacity-70">Connect with your favorite apps.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Slack', 'GitHub', 'Jira', 'Notion', 'Trello', 'Asana', 'Linear', 'Discord'].map((tool, i) => (
                <div key={i} className="skeuo-card p-3 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0px_black] transition-all cursor-pointer group">
                  <span className="text-black font-black uppercase text-xs transition-transform">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter leading-none">Common Questions.</h2>
              <p className="text-black font-bold text-sm">Everything you need to know.</p>
            </div>
            <div className="space-y-6">
              {[
                {
                  q: "How does Forgrin track focus?",
                  a: "Via a high-precision timer. Start a session, execute your task, and we monitor the duration with zero-lag accuracy."
                },
                {
                  q: "Is team support available?",
                  a: "Yes, our Team plan enables real-time focus leaderboards and team accountability tools for your entire organization."
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. We use industry-standard encryption. Your focus data remains private, isolated, and secure at all times."
                }
              ].map((faq, i) => (
                <div key={i} className="skeuo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_black]">
                  <h3 className="text-lg font-black uppercase mb-2 tracking-tighter">{faq.q}</h3>
                  <p className="text-sm font-bold text-black/70 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 relative pricing-section bg-inherit">
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="skeuo-badge bg-black text-white mb-3 inline-flex border-2 border-black">
                <Target className="w-4 h-4" />
                <span className="font-black uppercase tracking-tighter text-[10px]">Simple Pricing</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black mb-4 embossed-text tracking-tighter uppercase leading-tight text-black">Built for your team.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto overflow-visible items-stretch">
              {/* Free Plan */}
              <div className="skeuo-panel p-5 flex flex-col h-full bg-white border-2 border-black shadow-[6px_6px_0px_black] text-black ring-2 ring-black">
                <div className="mb-4">
                  <h3 className="text-xl font-black mb-1 uppercase tracking-tighter italic">Free Plan</h3>
                  <div className="flex items-baseline mb-2 border-b-2 border-black/10 pb-2">
                    <span className="text-3xl font-black tracking-tighter">$0</span>
                    <span className="text-black/40 ml-1 font-bold uppercase text-[8px]">/month</span>
                  </div>
                </div>
                <div className="space-y-2 mb-8 flex-grow">
                  {['3 Daily Sessions', 'Pulse Analytics', 'Manual Tracking', 'Network access'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-tight text-black/70">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="skeuo-button bg-zinc-100 text-black border-2 border-black w-full text-[10px] font-black py-4 uppercase shadow-[4px_4px_0px_black] hover:bg-black hover:text-white transition-all text-center">
                  Initialize
                </Link>
              </div>

              {/* Pro Plan - Featured */}
              <div className="skeuo-panel p-5 flex flex-col h-full bg-white border-4 border-black shadow-[10px_10px_0px_black] relative z-20 overflow-visible text-black md:scale-105">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-fit bg-[#ff91e0] border-2 border-black px-4 py-0.5 shadow-[2px_2px_0px_black] z-30">
                  <span className="font-black uppercase tracking-tight text-[8px] italic">POPULAR CHOICE</span>
                </div>
                <div className="mb-4 pt-2">
                  <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter italic">Pro Plan</h3>
                  <div className="flex items-baseline mb-2 border-b-2 border-black/10 pb-2">
                    <span className="text-4xl font-black tracking-tighter">$12</span>
                    <span className="text-black/40 ml-1 font-black uppercase text-[8px]">/month</span>
                  </div>
                </div>
                <div className="space-y-2 mb-8 flex-grow">
                  {['Unlimited focus', 'Deep Telemetry', 'Focus Analysis', 'Cluster Shares', 'Open Interface'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-pink-500 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase text-black">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="skeuo-button bg-black text-white px-4 py-4 w-full text-xs font-black uppercase shadow-[6px_6px_0px_white] ring-2 ring-black hover:bg-zinc-800 text-center">
                  Upgrade Path
                </Link>
              </div>

              {/* Team Plan */}
              <div className="skeuo-panel p-5 flex flex-col h-full bg-white border-2 border-black shadow-[6px_6px_0px_black] text-black ring-2 ring-black">
                <div className="mb-4">
                  <h3 className="text-xl font-black mb-1 uppercase tracking-tighter italic">Team Plan</h3>
                  <div className="flex items-baseline mb-2 border-b-2 border-black/10 pb-2">
                    <span className="text-3xl font-black tracking-tighter">$29</span>
                    <span className="text-black/40 ml-1 font-bold uppercase text-[8px]">/month</span>
                  </div>
                </div>
                <div className="space-y-2 mb-8 flex-grow">
                  {['Multi-Node Support', 'Admin Oversight', 'Network Heatmaps', 'Priority Path'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-tight text-black/70">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="skeuo-button bg-zinc-100 text-black border-2 border-black w-full text-[10px] font-black py-4 uppercase shadow-[4px_4px_0px_black] hover:bg-black hover:text-white transition-all text-center">
                  Grid Access
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}