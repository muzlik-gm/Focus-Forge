import Link from 'next/link';
import { Code, Key, Webhook, Book, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function APIReferencePage() {
  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`,
        }} />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
        <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] gradient-orb bg-purple-600" />
      </div>

      <nav className="marketing-nav-fixed" style={{ borderRadius: '0 0 32px 32px' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 p-3 rounded-2xl">
              <img src="/logo.png" alt="Forgrin" className="w-10 h-10" />
              <span className="text-xl font-bold embossed-text tracking-tight">Forgrin</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/docs" className="skeuo-chip"><span className="text-sm">Docs</span></Link>
              <Link href="/login" className="skeuo-chip"><span className="text-sm">Sign in</span></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>API REFERENCE</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">API Reference</h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">Build powerful integrations with the Forgrin API.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="skeuo-panel p-10">
              <div className="skeuo-avatar w-14 h-14 mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Key className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 embossed-text">Authentication</h2>
              <p className="text-zinc-300 mb-4">All API requests require authentication using API keys. Generate your API key in the settings.</p>
              <code className="block skeuo-input p-4 text-sm text-green-400 mb-4">Authorization: Bearer YOUR_API_KEY</code>
              <Link href="/settings?tab=api" className="text-blue-400 hover:text-blue-300 text-sm">Generate API Key →</Link>
            </div>

            <div className="skeuo-panel p-10">
              <div className="skeuo-avatar w-14 h-14 mb-6 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                <Code className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 embossed-text">Base URL</h2>
              <p className="text-zinc-300 mb-4">All API endpoints are relative to the base URL:</p>
              <code className="block skeuo-input p-4 text-sm text-green-400">https://api.forgrin.com/v1</code>
            </div>
          </div>

          <div className="skeuo-panel p-10 mb-12">
            <h2 className="text-3xl font-bold mb-8 embossed-text">Endpoints</h2>
            <div className="space-y-8">
              {[
                {
                  title: 'Sessions', endpoints: [
                    { method: 'GET', path: '/sessions', desc: 'List all sessions' },
                    { method: 'POST', path: '/sessions', desc: 'Create a session' },
                    { method: 'GET', path: '/sessions/:id', desc: 'Get session details' }
                  ]
                },
                {
                  title: 'Tasks', endpoints: [
                    { method: 'GET', path: '/tasks', desc: 'List all tasks' },
                    { method: 'POST', path: '/tasks', desc: 'Create a task' },
                    { method: 'PATCH', path: '/tasks/:id', desc: 'Update a task' }
                  ]
                },
                {
                  title: 'Analytics', endpoints: [
                    { method: 'GET', path: '/analytics/dashboard', desc: 'Get dashboard metrics' },
                    { method: 'GET', path: '/analytics/weekly', desc: 'Get weekly analytics' }
                  ]
                }
              ].map((section, i) => (
                <div key={i}>
                  <h3 className="text-xl font-bold mb-4 embossed-text">{section.title}</h3>
                  <div className="space-y-3">
                    {section.endpoints.map((endpoint, j) => (
                      <div key={j} className="skeuo-card p-4 flex items-center gap-4 text-sm">
                        <span className={`skeuo-badge ${endpoint.method === 'GET' ? 'bg-gradient-to-r from-green-600 to-emerald-500' : endpoint.method === 'POST' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-gradient-to-r from-yellow-600 to-orange-500'} text-white font-mono`}>{endpoint.method}</span>
                        <code className="text-zinc-300 flex-1">{endpoint.path}</code>
                        <span className="text-zinc-500">{endpoint.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="skeuo-panel p-10">
              <div className="skeuo-avatar w-14 h-14 mb-6 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <Webhook className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 embossed-text">Webhooks</h2>
              <p className="text-zinc-300 mb-4">Receive real-time notifications when events occur in your account.</p>
              <Link href="/docs/api/webhooks" className="text-green-400 hover:text-green-300 text-sm">Learn about webhooks →</Link>
            </div>

            <div className="skeuo-panel p-10">
              <div className="skeuo-avatar w-14 h-14 mb-6 bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center">
                <Book className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 embossed-text">Examples</h2>
              <p className="text-zinc-300 mb-4">Check out code examples in various programming languages.</p>
              <Link href="/docs/api/examples" className="text-orange-400 hover:text-orange-300 text-sm">View examples →</Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
