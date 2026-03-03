import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative z-10 border-t-4 border-black mt-24 bg-transparent pb-12">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
          {/* Product */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40 italic">Product</h3>
            <ul className="space-y-3 text-[10px] font-black uppercase tracking-tight">
              <li><Link href="/features" className="hover:text-blue-600 transition-all">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 transition-all">Pricing</Link></li>
              <li><Link href="/analytics-page" className="hover:text-blue-600 transition-all">Analytics</Link></li>
              <li><Link href="/integrations" className="hover:text-blue-600 transition-all">Integrations</Link></li>
              <li><Link href="/mobile-app" className="hover:text-blue-600 transition-all">Mobile App</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40 italic">Company</h3>
            <ul className="space-y-3 text-[10px] font-black uppercase tracking-tight">
              <li><Link href="/about" className="hover:text-blue-600 transition-all">About</Link></li>
              <li><Link href="/blog" className="hover:text-blue-600 transition-all">Blog</Link></li>
              <li><Link href="/company" className="hover:text-blue-600 transition-all">Careers</Link></li>
              <li><Link href="/company" className="hover:text-blue-600 transition-all">Press</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-all">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40 italic">Resources</h3>
            <ul className="space-y-3 text-[10px] font-black uppercase tracking-tight">
              <li><Link href="/docs" className="hover:text-blue-600 transition-all">Documentation</Link></li>
              <li><Link href="/docs" className="hover:text-blue-600 transition-all">API Reference</Link></li>
              <li><Link href="/help" className="hover:text-blue-600 transition-all">Help Center</Link></li>
              <li><Link href="/community" className="hover:text-blue-600 transition-all">Community</Link></li>
              <li><Link href="/status" className="hover:text-blue-600 transition-all">Status</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40 italic">Legal</h3>
            <ul className="space-y-3 text-[10px] font-black uppercase tracking-tight">
              <li><Link href="/privacy" className="hover:text-blue-600 transition-all">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-all">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-blue-600 transition-all">Security</Link></li>
              <li><Link href="/legal" className="hover:text-blue-600 transition-all">Compliance Hub</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40 italic">Follow Us</h3>
            <ul className="space-y-3 text-[10px] font-black uppercase tracking-tight">
              <li><a href="https://twitter.com/forgrin" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-all">Twitter</a></li>
              <li><a href="https://github.com/muzlik-gm/Focus-Forge" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-all">GitHub</a></li>
              <li><a href="https://discord.gg/forgrin" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-all">Discord</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t-4 border-black flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo_black.png" alt="Forgrin" className="h-8" />
            <span className="text-[9px] font-black uppercase tracking-widest text-black/30 italic">
              © 2026 Forgrin Node_A1. All rights reserved.
            </span>
          </div>
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-black/40">
            <span>Made with precision for focus clusters</span>
            <span>v1.0.8_ALPHA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
