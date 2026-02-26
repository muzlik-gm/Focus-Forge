'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[DashboardLayout] Auth state:', { user: user?.email, loading, isAuthenticated });

    if (!loading && !isAuthenticated) {
      console.log('[DashboardLayout] Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [user, loading, isAuthenticated, router]);

  // Start cloud sync once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Dynamically import to avoid SSR issues
    import('@/lib/cloud-sync').then(({ cloudSync }) => {
      cloudSync.startAutoSync();
      console.log('[DashboardLayout] Cloud sync started for:', user?.email);
    });

    return () => {
      import('@/lib/cloud-sync').then(({ cloudSync }) => {
        cloudSync.stopAutoSync();
      });
    };
  }, [isAuthenticated, user?.email]);

  // Show loading state
  if (loading) {
    console.log('[DashboardLayout] Loading authentication...');
    return (
      <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    console.log('[DashboardLayout] Not authenticated, showing nothing');
    return null;
  }

  console.log('[DashboardLayout] Rendering dashboard for user:', user?.email);

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-60 mt-16 mb-16 lg:mb-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
