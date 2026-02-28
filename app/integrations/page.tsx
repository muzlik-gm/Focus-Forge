import Link from 'next/link';
import { Metadata } from 'next';
import { Calendar, Webhook, Code, Zap, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Integrations',
  description: 'Connect FocusForge with your favorite tools like Google Calendar, Slack, and more using our integrations and REST API.',
};

export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'Google Calendar',
      description: 'Sync your focus sessions with Google Calendar',
      status: 'Coming Soon',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-400'
    },
    {
      name: 'Slack',
      description: 'Get notifications in your Slack workspace',
      status: 'Coming Soon',
      icon: Zap,
      color: 'from-purple-500 to-pink-400'
    },
    {
      name: 'Webhooks',
      description: 'Send events to your custom endpoints',
      status: 'Available',
      icon: Webhook,
      color: 'from-green-500 to-emerald-400'
    },
    {
      name: 'REST API',
      description: 'Full programmatic access to your data',
      status: 'Available',
      icon: Code,
      color: 'from-orange-500 to-red-400'
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
      <nav className="marketing-nav-fixed">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 p-3 rounded-2xl">
              <img src="/logo.png" alt="FocusForge" className="w-10 h-10" />
              <span className="text-xl font-bold embossed-text tracking-tight">FocusForge</span>
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
        <section className="max-w-7xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>INTEGRATIONS</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">
              Connect Your Workflow
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Connect FocusForge with your favorite tools and build custom workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {integrations.map((integration, index) => {
              const IconComponent = integration.icon;
              return (
                <div key={index} className="skeuo-panel p-10 skeuo-card-hover">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`skeuo-avatar w-14 h-14 bg-gradient-to-br ${integration.color} flex items-center justify-center`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <span className={`skeuo-badge ${integration.status === 'Available'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white'
                        : 'text-zinc-400'
                      }`}>
                      {integration.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 embossed-text">{integration.name}</h3>
                  <p className="text-zinc-300 leading-relaxed">{integration.description}</p>
                </div>
              );
            })}
          </div>

          <div className="skeuo-panel p-12 text-center">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Need a custom integration?</h2>
            <p className="text-zinc-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Our API gives you full access to build custom integrations tailored to your workflow.
            </p>
            <Link
              href="/docs/api"
              className="skeuo-button inline-flex items-center gap-2 px-8 py-4 text-white font-medium text-lg"
            >
              <span>View API Documentation</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
