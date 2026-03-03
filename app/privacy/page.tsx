'use client';

import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0f0f10] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#151518] to-[#0f0f10] opacity-100" />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] gradient-orb bg-blue-600" />
      </div>

      <MarketingNav />

      <div className="relative z-10">
        <section className="max-w-4xl mx-auto px-6 pt-40 pb-20">
          <h1 className="text-5xl font-bold mb-6 embossed-text tracking-tight">Privacy Policy</h1>
          <p className="text-zinc-400 mb-12">Last updated: February 22, 2026</p>

          <div className="space-y-8 text-zinc-300">
            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Introduction</h2>
              <p>Forgrin ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Information We Collect</h2>
              <p className="mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (name, email, password)</li>
                <li>Focus session data and productivity metrics</li>
                <li>Task and project information</li>
                <li>Usage data and analytics</li>
              </ul>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns and trends</li>
              </ul>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </div>

            <div className="skeuo-card p-8">
              <h2 className="text-2xl font-semibold mb-4 embossed-text">Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at privacy@forgrin.com</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
