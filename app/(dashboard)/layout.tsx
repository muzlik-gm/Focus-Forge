'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { SessionProvider } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-[#0f0f10] text-white">
        <Navbar />
        <Sidebar />
        <main className="lg:ml-60 mt-16 mb-16 lg:mb-0 transition-all duration-300">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
