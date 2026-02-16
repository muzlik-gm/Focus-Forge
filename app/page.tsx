'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Clock, BarChart3, Users, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple fade-in animation for hero elements
    const elements = heroRef.current?.querySelectorAll('.hero-animate');
    elements?.forEach((el, index) => {
      setTimeout(() => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'translateY(0)';
      }, index * 100);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white antialiased">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-500/[0.02] rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-purple-500/[0.015] rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white rounded-sm"></div>
              <span className="text-base font-semibold tracking-tight">FocusForge</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Features</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">Sign in</Link>
              <Link href="/register" className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-100 transition">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative">
        <div className="max-w-[1300px] mx-auto px-8 pt-32 pb-24">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-20 items-center">
            <div className="max-w-[580px]">
              <h1 className="hero-animate text-[68px] font-bold tracking-[-0.02em] leading-[1] mb-8 opacity-0 translate-y-10 transition-all duration-800">
                Deep work for developers
              </h1>
              
              <p className="hero-animate text-xl text-gray-400 mb-10 leading-relaxed max-w-[500px] opacity-0 translate-y-10 transition-all duration-800">
                Track focus sessions, eliminate distractions, and analyze productivity patterns. Built for engineering teams who ship.
              </p>
              
              <div className="hero-animate flex items-center gap-4 mb-14 opacity-0 translate-y-10 transition-all duration-800">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition hover:scale-105 transform"
                >
                  Start free trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition"
                >
                  View demo
                </Link>
              </div>

              {/* Social proof */}
              <div className="hero-animate opacity-0 translate-y-10 transition-all duration-800">
                <p className="text-xs font-medium text-gray-600 mb-4 tracking-wider">TRUSTED BY TEAMS AT</p>
                <div className="flex items-center gap-8">
                  {['Stripe', 'Vercel', 'Linear', 'Raycast'].map((company, i) => (
                    <div key={i} className="text-sm font-semibold text-gray-600">{company}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product UI Mockup */}
            <div className="relative product-mockup">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-[#0D0D0D] border border-white/[0.08] rounded-lg overflow-hidden shadow-2xl"
              >
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0A0A0A]">
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                </div>
                
                {/* Dashboard content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-500 mb-1">Focus hours</div>
                      <div className="text-2xl font-bold mb-1">4.2h</div>
                      <div className="text-xs text-gray-600">+12%</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-500 mb-1">Tasks done</div>
                      <div className="text-2xl font-bold mb-1">8</div>
                      <div className="text-xs text-gray-600">+3</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4">
                    <div className="text-xs font-medium text-gray-500 mb-3">Weekly focus</div>
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                        <div key={i} className="flex-1 bg-white rounded-sm" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative border-t border-white/[0.06]">
        <div className="max-w-[1300px] mx-auto px-8 py-32">
          
          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="max-w-[480px]">
              <div className="inline-flex items-center justify-center w-10 h-10 border border-white/10 rounded-lg mb-6 bg-white/[0.02]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-4xl font-bold mb-5 tracking-tight">
                Focus sessions with distraction tracking
              </h3>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Start a Pomodoro timer and log every distraction. Pause, resume, and review your session history.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Customizable timer durations
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  One-click distraction logging
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Session notes and reflection
                </li>
              </ul>
            </div>
            
            <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-lg p-12 shadow-xl">
              <div className="text-center max-w-md mx-auto">
                <div className="text-7xl font-bold mb-3 tracking-tight">25:00</div>
                <div className="text-sm text-gray-500 mb-8">Focus session</div>
                <div className="flex gap-3 justify-center mb-6">
                  <button className="px-7 py-2.5 bg-white text-black text-sm font-semibold rounded-lg">Pause</button>
                  <button className="px-7 py-2.5 border border-white/20 text-sm font-medium rounded-lg">Stop</button>
                </div>
                <div className="text-sm text-gray-500">3 distractions logged</div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="order-2 lg:order-1">
              <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-lg p-6 shadow-xl">
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5">
                    <div className="text-xs font-medium text-gray-500 mb-3">Focus by time of day</div>
                    <div className="flex items-end gap-1.5 h-28">
                      {[20, 15, 10, 25, 45, 65, 80, 85, 75, 60, 50, 40, 35, 30].map((height, i) => (
                        <div key={i} className="flex-1 bg-white rounded-sm" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Peak hours</div>
                      <div className="text-lg font-bold">9-11am</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Avg session</div>
                      <div className="text-lg font-bold">42min</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Streak</div>
                      <div className="text-lg font-bold">12 days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 max-w-[480px] lg:ml-auto">
              <div className="inline-flex items-center justify-center w-10 h-10 border border-white/10 rounded-lg mb-6 bg-white/[0.02]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-4xl font-bold mb-5 tracking-tight">
                Analytics that reveal your patterns
              </h3>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Understand when you work best with weekly graphs and focus-by-time-of-day insights.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Weekly and monthly comparisons
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Distraction pattern analysis
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  AI-powered productivity insights
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="max-w-[480px]">
              <div className="inline-flex items-center justify-center w-10 h-10 border border-white/10 rounded-lg mb-6 bg-white/[0.02]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-4xl font-bold mb-5 tracking-tight">
                Team collaboration without interruptions
              </h3>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                See who&apos;s in focus mode. Weekly leaderboards create healthy competition.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Real-time focus status
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Weekly performance leaderboards
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Team analytics dashboard
                </li>
              </ul>
            </div>
            
            <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-lg p-6 shadow-xl">
              <div className="text-sm font-semibold mb-5">Team leaderboard</div>
              <div className="space-y-1">
                {[
                  { name: 'Sarah Chen', hours: '28.5h', rank: 1 },
                  { name: 'Marcus Rodriguez', hours: '26.2h', rank: 2 },
                  { name: 'Aisha Patel', hours: '24.8h', rank: 3 },
                  { name: 'You', hours: '22.1h', rank: 4 }
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-600 w-6">{member.rank}</div>
                      <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                      <div className="text-sm font-medium">{member.name}</div>
                    </div>
                    <div className="text-sm font-semibold">{member.hours}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative border-t border-white/[0.06]">
        <div className="max-w-[1300px] mx-auto px-8 py-32">
          <div className="max-w-[600px] mx-auto text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight mb-5">
              Trusted by developers at leading companies
            </h2>
            <p className="text-lg text-gray-400">
              Join thousands who&apos;ve transformed their productivity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Chen', role: 'Senior Engineer, Stripe', quote: 'FocusForge helped me double my deep work hours. The analytics are invaluable.' },
              { name: 'Marcus Rodriguez', role: 'Founder, TechStart', quote: 'Finally, a productivity tool that actually understands how developers work.' },
              { name: 'Aisha Patel', role: 'Tech Lead, Meta', quote: 'The team leaderboard transformed how our remote team stays accountable.' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-7">
                <p className="text-base text-gray-300 leading-relaxed mb-6">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative border-t border-white/[0.06]">
        <div className="max-w-[1300px] mx-auto px-8 py-32">
          <div className="max-w-[600px] mx-auto text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight mb-5">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-400">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
            {/* Free */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-8">
              <div className="text-lg font-semibold mb-2">Free</div>
              <div className="mb-8">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-500 text-base">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited focus sessions', 'Basic task management', 'Weekly analytics'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center py-2.5 border border-white/20 text-sm font-medium rounded-lg hover:bg-white/5 transition">
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white/[0.03] border-2 border-white/20 rounded-lg p-8 relative shadow-xl">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-white text-black text-xs font-semibold rounded-md">
                Popular
              </div>
              <div className="text-lg font-semibold mb-2">Pro</div>
              <div className="mb-8">
                <span className="text-5xl font-bold">$9</span>
                <span className="text-gray-500 text-base">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Free', 'Advanced analytics', 'AI-powered insights', 'Priority support', 'Export data'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition">
                Get started
              </Link>
            </div>

            {/* Team */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-8">
              <div className="text-lg font-semibold mb-2">Team</div>
              <div className="mb-8">
                <span className="text-5xl font-bold">$19</span>
                <span className="text-gray-500 text-base">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Pro', 'Team collaboration', 'Leaderboards', 'Admin controls', 'SSO'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center py-2.5 border border-white/20 text-sm font-medium rounded-lg hover:bg-white/5 transition">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/[0.06]">
        <div className="max-w-[1300px] mx-auto px-8 py-32">
          <div className="max-w-[680px] mx-auto text-center">
            <h2 className="text-6xl font-bold tracking-tight mb-6 leading-tight">
              Start building better focus habits today
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              Join 10,000+ developers who&apos;ve transformed their productivity with FocusForge.
            </p>
            <div className="flex items-center gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 bg-white rounded-sm"></div>
                <span className="text-base font-semibold tracking-tight">FocusForge</span>
              </div>
              <p className="text-sm text-gray-600">
                Deep work command center for developers.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-gray-600 hover:text-white transition">Features</a></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-white transition">Pricing</Link></li>
                <li><Link href="/dashboard" className="text-gray-600 hover:text-white transition">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-white transition">Terms</a></li>
                <li><a href="#" className="text-gray-600 hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-sm text-gray-600">
            <p>&copy; 2024 FocusForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
