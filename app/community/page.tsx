import Link from 'next/link';
import { Users, MessageCircle, Github, Twitter, BookOpen, CheckCircle } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function CommunityPage() {
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
              <Link href="/blog" className="skeuo-chip">
                <span className="text-sm">Blog</span>
              </Link>
              <Link href="/docs" className="skeuo-chip">
                <span className="text-sm">Docs</span>
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
              <Users className="w-4 h-4" />
              <span>COMMUNITY</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Join Our Community
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Connect with thousands of focused individuals building better productivity habits together.
            </p>
          </div>

          {/* Community Channels */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <a
              href="https://discord.gg/forgrin"
              target="_blank"
              rel="noopener noreferrer"
              className="skeuo-panel p-8 skeuo-card-hover"
            >
              <div className="skeuo-avatar w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">Discord</h3>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Join our Discord server to chat with other users, share tips, and get help from the community.
              </p>
              <span className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium">
                <span>Join Discord</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>

            <a
              href="https://github.com/forgrin"
              target="_blank"
              rel="noopener noreferrer"
              className="skeuo-panel p-8 skeuo-card-hover"
            >
              <div className="skeuo-avatar w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <Github className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">GitHub</h3>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Contribute to our open-source projects, report issues, and help shape the future of Forgrin.
              </p>
              <span className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium">
                <span>View on GitHub</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>

            <a
              href="https://twitter.com/forgrin"
              target="_blank"
              rel="noopener noreferrer"
              className="skeuo-panel p-8 skeuo-card-hover"
            >
              <div className="skeuo-avatar w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                <Twitter className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">Twitter</h3>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Follow us for updates, productivity tips, and insights from the Forgrin team.
              </p>
              <span className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium">
                <span>Follow @forgrin</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>

            <Link href="/blog" className="skeuo-panel p-8 skeuo-card-hover">
              <div className="skeuo-avatar w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 embossed-text">Blog</h3>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Read stories, tips, and insights from the Forgrin community and team.
              </p>
              <span className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium">
                <span>Read the blog</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Community Guidelines */}
          <div className="skeuo-panel p-10">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Community Guidelines</h2>
            <p className="text-zinc-300 mb-8 leading-relaxed">
              Our community thrives on respect, collaboration, and shared learning. Here's how we keep it that way:
            </p>
            <div className="space-y-4">
              {[
                'Be respectful and supportive of other community members',
                'Share your productivity tips and learn from others',
                'Help newcomers get started with Forgrin',
                'Report bugs and suggest features constructively',
                'No spam, self-promotion, or off-topic content'
              ].map((guideline, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="skeuo-avatar w-8 h-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-zinc-300 leading-relaxed pt-1">{guideline}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
