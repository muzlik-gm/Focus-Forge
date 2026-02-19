'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut, Settings, CreditCard, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { CommandPalette } from './CommandPalette';
import { NotificationDropdown } from './NotificationDropdown';
import { WorkspaceSelector } from './WorkspaceSelector';

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
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] z-50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="FocusForge" className="w-9 h-9" />
            <span className="font-bold text-lg">FocusForge</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Command Palette */}
          <CommandPalette />

          {/* Workspace Selector */}
          <WorkspaceSelector />

          {/* Notifications */}
          <NotificationDropdown />

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-indigo-500/20">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="hidden sm:block w-4 h-4 text-[var(--text-secondary)]" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-[70]"
                  >
                    <div className="p-4 border-b border-[var(--border)]">
                      <p className="font-semibold truncate">{session?.user?.name || 'User'}</p>
                      <p className="text-sm text-[var(--text-secondary)] truncate">
                        {session?.user?.email || 'user@example.com'}
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
                        onClick={() => signOut()}
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