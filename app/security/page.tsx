'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { Shield, Lock, Eye, Server, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
      </div>

      <MarketingNav />

      <div className="relative z-10">
        <section className="max-w-4xl mx-auto px-6 pt-40 pb-20">
          <div className="text-center mb-16">
            <div className="skeuo-badge mb-6 inline-flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SECURITY</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 embossed-text tracking-tight">Security at Forgrin</h1>
            <p className="text-xl text-zinc-300">Your data security and privacy are our top priorities</p>
          </div>

          <div className="space-y-8">
            <div className="skeuo-card p-8">
              <div className="flex items-start gap-4">
                <div className="icon-depth p-3">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-3 embossed-text">Encryption</h2>
                  <p className="text-zinc-300">All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your sensitive information is protected with industry-standard security protocols.</p>
                </div>
              </div>
            </div>

            <div className="skeuo-card p-8">
              <div className="flex items-start gap-4">
                <div className="icon-depth p-3">
                  <Server className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-3 embossed-text">Infrastructure Security</h2>
                  <p className="text-zinc-300 mb-4">Our infrastructure is hosted on secure, SOC 2 compliant cloud providers with:</p>
                  <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                    <li>Regular security audits and penetration testing</li>
                    <li>Automated backup and disaster recovery</li>
                    <li>24/7 monitoring and intrusion detection</li>
                    <li>DDoS protection and rate limiting</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="skeuo-card p-8">
              <div className="flex items-start gap-4">
                <div className="icon-depth p-3">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-3 embossed-text">Privacy Controls</h2>
                  <p className="text-zinc-300">You have full control over your data. Export, delete, or modify your information at any time. We never sell your data to third parties.</p>
                </div>
              </div>
            </div>

            <div className="skeuo-card p-8">
              <div className="flex items-start gap-4">
                <div className="icon-depth p-3">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-3 embossed-text">Compliance</h2>
                  <p className="text-zinc-300 mb-4">Forgrin is compliant with:</p>
                  <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                    <li>GDPR (General Data Protection Regulation)</li>
                    <li>CCPA (California Consumer Privacy Act)</li>
                    <li>SOC 2 Type II</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="skeuo-card p-8">
              <div className="flex items-start gap-4">
                <div className="icon-depth p-3">
                  <AlertTriangle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-3 embossed-text">Report a Vulnerability</h2>
                  <p className="text-zinc-300 mb-4">We take security seriously. If you discover a security vulnerability, please report it to:</p>
                  <a href="mailto:security@forgrin.com" className="text-blue-400 hover:text-blue-300 transition">security@forgrin.com</a>
                  <p className="text-zinc-400 text-sm mt-4">We appreciate responsible disclosure and will respond within 48 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
