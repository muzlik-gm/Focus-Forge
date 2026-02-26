'use client';

import { useEffect, useState } from 'react';
import { Download, Mail, Newspaper, Calendar } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MarketingNav } from '@/components/layout/MarketingNav';

export default function PressPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReleases() {
      try {
        const res = await fetch('/api/press', {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setReleases(data.releases || []);
        }
      } catch (error) {
        console.error('Failed to fetch press releases:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReleases();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)`,
        }} />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
        <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] gradient-orb bg-blue-500" />
      </div>

      <MarketingNav />

      {/* Main Content */}
      <div className="relative z-10">
        <section className="max-w-5xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              <span>PRESS KIT</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Press & Media
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Resources for journalists, bloggers, and media professionals covering FocusForge.
            </p>
          </div>

          {/* About Section */}
          <div className="skeuo-panel p-10 mb-8">
            <h2 className="text-3xl font-bold mb-6 embossed-text">About FocusForge</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              FocusForge is a productivity platform that helps individuals and teams achieve deep work through focus sessions, task management, and intelligent analytics. Founded in 2025, we're on a mission to help people reclaim their attention in an age of constant distractions.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Our platform combines proven productivity techniques like the Pomodoro method with modern analytics and AI-powered insights to help users understand and optimize their work patterns.
            </p>
          </div>

          {/* Company Facts */}
          <div className="skeuo-panel p-10 mb-8">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Company Facts</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="skeuo-card p-6">
                <p className="text-sm text-zinc-400 mb-1">Founded</p>
                <p className="text-2xl font-bold embossed-text">2025</p>
              </div>
              <div className="skeuo-card p-6">
                <p className="text-sm text-zinc-400 mb-1">Headquarters</p>
                <p className="text-2xl font-bold embossed-text">Remote-first</p>
              </div>
              <div className="skeuo-card p-6">
                <p className="text-sm text-zinc-400 mb-1">Team Size</p>
                <p className="text-2xl font-bold embossed-text">10-50</p>
              </div>
              <div className="skeuo-card p-6">
                <p className="text-sm text-zinc-400 mb-1">Funding</p>
                <p className="text-2xl font-bold embossed-text">Bootstrapped</p>
              </div>
            </div>
          </div>

          {/* Press Releases */}
          {!loading && releases.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6 embossed-text">Press Releases</h2>
              <div className="space-y-6">
                {releases.map((release: any) => (
                  <div key={release.id} className="skeuo-panel p-8 skeuo-card-hover">
                    <div className="flex items-center gap-2 mb-3 text-sm text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(release.publishedAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 embossed-text">{release.title}</h3>
                    <p className="text-zinc-300 leading-relaxed">{release.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Assets */}
          <div className="skeuo-panel p-10 mb-8">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Brand Assets</h2>
            <p className="text-zinc-300 mb-6">
              Download our logos, screenshots, and other brand assets for use in your coverage.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <button className="skeuo-input flex items-center justify-center gap-2 px-6 py-4 font-medium hover:bg-zinc-800/50 transition">
                <Download className="w-5 h-5" />
                <span>Logo Pack</span>
              </button>
              <button className="skeuo-input flex items-center justify-center gap-2 px-6 py-4 font-medium hover:bg-zinc-800/50 transition">
                <Download className="w-5 h-5" />
                <span>Screenshots</span>
              </button>
            </div>
          </div>

          {/* Media Contact */}
          <div className="skeuo-panel p-10">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Media Contact</h2>
            <p className="text-zinc-300 mb-6">
              For press inquiries, interviews, or additional information:
            </p>
            <a 
              href="mailto:press@focusforge.com" 
              className="skeuo-button inline-flex items-center gap-2 px-6 py-4 text-white font-medium"
            >
              <Mail className="w-5 h-5" />
              <span>press@focusforge.com</span>
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
