import Link from 'next/link';
import { Metadata } from 'next';
import { Mail, MessageSquare, HelpCircle, Send } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Forgrin team. We\'re here to help.',
};

export default function ContactPage() {
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        <section className="max-w-5xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>CONTACT</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Get in Touch
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Have a question or need help? We're here for you.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="skeuo-panel p-8 text-center skeuo-card-hover">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">Email</h3>
              <a href="mailto:support@forgrin.com" className="text-blue-400 hover:text-blue-300 transition">
                support@forgrin.com
              </a>
            </div>

            <div className="skeuo-panel p-8 text-center skeuo-card-hover">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">Live Chat</h3>
              <button className="text-purple-400 hover:text-purple-300 transition">
                Start Chat
              </button>
            </div>

            <div className="skeuo-panel p-8 text-center skeuo-card-hover">
              <div className="skeuo-avatar w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 embossed-text">Help Center</h3>
              <Link href="/help" className="text-green-400 hover:text-green-300 transition">
                Browse Docs
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="skeuo-panel p-10">
            <h2 className="text-3xl font-bold mb-8 embossed-text">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-3 text-zinc-300">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="skeuo-input w-full px-4 py-3 text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-3 text-zinc-300">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="skeuo-input w-full px-4 py-3 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-3 text-zinc-300">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="skeuo-input w-full px-4 py-3 text-sm"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-3 text-zinc-300">Message</label>
                <textarea
                  id="message"
                  rows={6}
                  className="skeuo-input w-full px-4 py-3 text-sm resize-none"
                  placeholder="Tell us more..."
                />
              </div>
              <button type="submit" className="skeuo-button w-full px-6 py-4 text-white font-medium flex items-center justify-center gap-2">
                <span>Send Message</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
