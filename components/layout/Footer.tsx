import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative z-10 border-t-4 border-black mt-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
          {/* Product */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40">Product</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/features" className="hover:underline transition-all">Features</Link></li>
              <li><Link href="/pricing" className="hover:underline transition-all">Pricing</Link></li>
              <li><Link href="/analytics-page" className="hover:underline transition-all">Analytics</Link></li>
              <li><Link href="/integrations" className="hover:underline transition-all">Integrations</Link></li>
              <li><Link href="/mobile" className="hover:underline transition-all">Mobile App</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40">Company</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/about" className="hover:underline transition-all">About</Link></li>
              <li><Link href="/blog" className="hover:underline transition-all">Blog</Link></li>
              <li><Link href="/careers" className="hover:underline transition-all">Careers</Link></li>
              <li><Link href="/press" className="hover:underline transition-all">Press</Link></li>
              <li><Link href="/contact" className="hover:underline transition-all">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40">Resources</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/docs" className="hover:underline transition-all">Documentation</Link></li>
              <li><Link href="/docs/api" className="hover:underline transition-all">API Reference</Link></li>
              <li><Link href="/help" className="hover:underline transition-all">Help Center</Link></li>
              <li><Link href="/community" className="hover:underline transition-all">Community</Link></li>
              <li><Link href="/status" className="hover:underline transition-all">Status</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40">Legal</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/privacy" className="hover:underline transition-all">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline transition-all">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:underline transition-all">Security</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-black/40">Follow Us</h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><a href="https://twitter.com/forgrin" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">Twitter</a></li>
              <li><a href="https://github.com/forgrin" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">GitHub</a></li>
              <li><a href="https://discord.gg/forgrin" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">Discord</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t-4 border-black flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo_black.png" alt="Forgrin" className="h-8" />
            <span className="text-xs font-black uppercase tracking-widest text-black/30">
              © 2026 Forgrin. All rights reserved.
            </span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
            <span>Made with love for developers</span>
            <span>v1.0.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
