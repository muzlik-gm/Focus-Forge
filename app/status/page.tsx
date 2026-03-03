import Link from 'next/link';
import { Metadata } from 'next';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Real-time status updates and uptime information for Forgrin services.',
};

export default function StatusPage() {
  const services = [
    { name: 'API', status: 'operational', uptime: '99.99%' },
    { name: 'Web Application', status: 'operational', uptime: '99.98%' },
    { name: 'Database', status: 'operational', uptime: '99.99%' },
    { name: 'Authentication', status: 'operational', uptime: '100%' },
    { name: 'Notifications', status: 'operational', uptime: '99.95%' }
  ];

  const incidents = [
    {
      date: '2026-02-15',
      title: 'Scheduled Maintenance',
      description: 'Database optimization and performance improvements',
      status: 'resolved',
      duration: '30 minutes'
    }
  ];

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

      <nav className="marketing-nav-fixed">
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
        <section className="max-w-5xl mx-auto px-6 pt-40 pb-20">
          <div className="mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>SYSTEM STATUS</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 embossed-text tracking-tight">System Status</h1>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-2xl text-green-400 embossed-text">All Systems Operational</span>
            </div>
          </div>

          <div className="skeuo-panel p-10 mb-8">
            <h2 className="text-3xl font-bold mb-8 embossed-text">Services</h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="skeuo-card p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium text-lg">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-zinc-400">Uptime: {service.uptime}</span>
                    <span className="skeuo-badge bg-gradient-to-r from-green-600 to-emerald-500 text-white">Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="skeuo-panel p-10 mb-8">
            <h2 className="text-3xl font-bold mb-8 embossed-text">Recent Incidents</h2>
            {incidents.length === 0 ? (
              <p className="text-zinc-300">No incidents in the last 30 days.</p>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident, index) => (
                  <div key={index} className="skeuo-card p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-lg embossed-text">{incident.title}</h3>
                          <p className="text-sm text-zinc-300">{incident.description}</p>
                        </div>
                      </div>
                      <span className="skeuo-badge bg-gradient-to-r from-green-600 to-emerald-500 text-white">Resolved</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mt-4">
                      <span>{new Date(incident.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>Duration: {incident.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="skeuo-panel p-10">
            <h2 className="text-3xl font-bold mb-6 embossed-text">Subscribe to Updates</h2>
            <p className="text-zinc-300 mb-8 leading-relaxed">Get notified when we post status updates.</p>
            <div className="flex gap-4">
              <input type="email" placeholder="Enter your email" className="skeuo-input flex-1 px-4 py-3 text-sm" />
              <button className="skeuo-button px-6 py-3 text-white font-medium whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
