import Link from 'next/link';
import { Book, Code, Zap, Shield, Search, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function DocsPage() {
  const sections = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of FocusForge',
      color: 'from-blue-500 to-cyan-400',
      links: [
        { title: 'Quick Start Guide', href: '/docs/quick-start' },
        { title: 'Creating Your First Session', href: '/docs/first-session' },
        { title: 'Managing Tasks', href: '/docs/tasks' },
        { title: 'Understanding Analytics', href: '/docs/analytics' }
      ]
    },
    {
      icon: Zap,
      title: 'Features',
      description: 'Deep dive into FocusForge features',
      color: 'from-purple-500 to-pink-400',
      links: [
        { title: 'Focus Sessions', href: '/docs/focus-sessions' },
        { title: 'Task Management', href: '/docs/task-management' },
        { title: 'Weekly Reviews', href: '/docs/weekly-reviews' },
        { title: 'Team Collaboration', href: '/docs/team' }
      ]
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Integrate with FocusForge',
      color: 'from-green-500 to-emerald-400',
      links: [
        { title: 'Authentication', href: '/docs/api/auth' },
        { title: 'Sessions API', href: '/docs/api/sessions' },
        { title: 'Tasks API', href: '/docs/api/tasks' },
        { title: 'Webhooks', href: '/docs/api/webhooks' }
      ]
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'How we protect your data',
      color: 'from-orange-500 to-red-400',
      links: [
        { title: 'Security Overview', href: '/docs/security' },
        { title: 'Privacy Policy', href: '/docs/privacy' },
        { title: 'Data Export', href: '/docs/data-export' },
        { title: 'GDPR Compliance', href: '/docs/gdpr' }
      ]
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
              <Link href="/docs/api" className="skeuo-chip">
                <span className="text-sm">API</span>
              </Link>
              <Link href="/help" className="skeuo-chip">
                <span className="text-sm">Help</span>
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
        <section className="max-w-7xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>DOCUMENTATION</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Documentation
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Everything you need to know about using FocusForge.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-16">
            <div className="skeuo-input relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="search"
                placeholder="Search documentation..."
                className="w-full pl-12 pr-4 py-4 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div key={index} className="skeuo-panel p-10">
                  <div className={`skeuo-avatar w-14 h-14 mb-6 bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 embossed-text">{section.title}</h2>
                  <p className="text-zinc-300 mb-6">{section.description}</p>
                  <ul className="space-y-3">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <Link href={link.href} className="text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-3">
                          <div className={`skeuo-avatar w-6 h-6 bg-gradient-to-br ${section.color}`}>
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
