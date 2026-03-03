'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
      </div>

      <MarketingNav />

      <div className="relative z-10">
        <section className="max-w-4xl mx-auto px-6 pt-40 pb-20">
          <h1 className="text-5xl font-bold mb-6 embossed-text tracking-tight">Terms of Service</h1>
          <p className="text-zinc-400 mb-12">Last updated: February 22, 2026</p>

          <div className="space-y-8 text-zinc-300">
            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Agreement to Terms</h2>
              <p>By accessing or using Forgrin, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Use License</h2>
              <p className="mb-4">Permission is granted to temporarily use Forgrin for personal or commercial productivity purposes. This license shall automatically terminate if you violate any of these restrictions.</p>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">User Accounts</h2>
              <p className="mb-4">When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Prohibited Uses</h2>
              <p className="mb-4">You may not use Forgrin:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>In any way that violates applicable laws</li>
                <li>To transmit malicious code or viruses</li>
                <li>To harass, abuse, or harm another person</li>
                <li>To impersonate or attempt to impersonate Forgrin or another user</li>
              </ul>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Termination</h2>
              <p>We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms.</p>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Contact Us</h2>
              <p>If you have questions about these Terms, please contact us at legal@forgrin.com</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
