import Link from 'next/link';
import { Metadata } from 'next';
import { Smartphone, Download, Apple, PlaySquare, Globe } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Mobile App',
  description: 'Download the Forgrin mobile app and take your productivity tools with you on the go.',
};

export default function MobilePage() {
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
            <div className="skeuo-avatar w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>MOBILE APP</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Focus On The Go
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-8">
              Stay focused anywhere with our mobile app. Track sessions, manage tasks, and view analytics from your phone.
            </p>
            <div className="skeuo-badge inline-flex items-center gap-2 px-6 py-3 text-lg">
              <Download className="w-5 h-5" />
              <span>Coming Soon</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Apple className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">iOS</h3>
              <p className="text-zinc-300 mb-4">iPhone & iPad</p>
              <div className="skeuo-badge text-zinc-400">Coming Q2 2026</div>
            </div>

            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <PlaySquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">Android</h3>
              <p className="text-zinc-300 mb-4">All devices</p>
              <div className="skeuo-badge text-zinc-400">Coming Q2 2026</div>
            </div>

            <div className="skeuo-panel p-8 text-center">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">Web</h3>
              <p className="text-zinc-300 mb-4">All browsers</p>
              <Link href="/register" className="text-blue-400 hover:text-blue-300 transition">
                Available Now →
              </Link>
            </div>
          </div>

          <div className="skeuo-panel p-12 text-center">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Get notified when we launch</h2>
            <p className="text-zinc-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Be the first to know when our mobile apps are available. We'll send you an email as soon as they're ready.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="skeuo-input flex-1 px-4 py-3 text-sm"
              />
              <button className="skeuo-button px-6 py-3 text-white font-medium whitespace-nowrap">
                Notify Me
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
