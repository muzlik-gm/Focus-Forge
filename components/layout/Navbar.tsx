'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut, Settings, CreditCard, Key, CloudCog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CommandPalette } from './CommandPalette';
import { NotificationDropdown } from './NotificationDropdown';
import { WorkspaceSelector } from './WorkspaceSelector';
import { useAuth } from '@/contexts/AuthContext';
import type { SyncStatus } from '@/lib/cloud-sync';

/**
 * Responsive Navbar Component
 * 
 * Provides navigation with:
 * - Logo and workspace selector
 * - Search/Command palette
 * - Notifications
 * - Profile dropdown menu
 * - Mobile menu toggle
 * 
 * Requirements: 17, 47
 */

export function Navbar() {
  const { user, signOut: handleSignOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    import('@/lib/cloud-sync').then(({ cloudSync }) => {
      unsub = cloudSync.subscribe(setSyncStatus);
    });
    return () => { unsub?.(); };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#1a1a1d] border-b-2 border-black z-50 shadow-[0_2px_0_#000]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="FocusForge" className="w-9 h-9" />
            <span className="font-bold text-lg">FocusForge</span>
          </Link>

          {/* Dev Mode Indicator */}
          {isDev && (
            <Link
              href="/dev/change-plan"
              className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs font-medium text-yellow-500 hover:bg-yellow-500/20 transition-colors"
              title="Development Plan Changer"
            >
              DEV
            </Link>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Command Palette */}
          <CommandPalette />

          {/* Workspace Selector */}
          <WorkspaceSelector />

          {/* Notifications */}
          <NotificationDropdown />

          {/* Cloud Sync Indicator */}
          {syncStatus?.authenticated && (
            <Link
              href="/settings?tab=cloud-sync"
              title={syncStatus.isSyncing ? 'Syncing...' : `Last synced: ${syncStatus.lastSyncAt ? new Date(syncStatus.lastSyncAt).toLocaleTimeString() : 'Never'}`}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
            >
              <CloudCog className={`w-4 h-4 ${syncStatus.isSyncing ? 'text-blue-400 animate-pulse' : 'text-zinc-400'}`} />
              {!syncStatus.isSyncing && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              )}
            </Link>
          )}

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors border-2 border-transparent hover:border-black active:translate-y-0.5"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold border-2 border-black shadow-[2px_2px_0_#000]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className={cn("hidden sm:block w-4 h-4 text-zinc-400 transition-transform", showProfileMenu && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="absolute right-0 top-full mt-3 w-64 bg-[#1a1a1d] border-2 border-black rounded-xl shadow-[8px_8px_0px_#000] overflow-hidden z-[70]"
                  >
                    <div className="p-4 border-b border-[var(--border)]">
                      <p className="font-semibold truncate">{user?.name || 'User'}</p>
                      <p className="text-sm text-[var(--text-secondary)] truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors text-sm"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <Link
                        href="/billing"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors text-sm"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Billing
                      </Link>
                      <Link
                        href="/settings?tab=api"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors text-sm"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Key className="w-4 h-4" />
                        API Keys
                      </Link>
                    </div>

                    <div className="p-2 border-t border-[var(--border)]">
                      <button
                        onClick={() => handleSignOut()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-400 hover:text-red-300 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}