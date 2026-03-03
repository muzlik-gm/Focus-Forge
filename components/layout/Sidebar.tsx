'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  BarChart3,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { tauriApi } from '@/lib/tauri-api';

/**
 * Responsive Sidebar Component
 * 
 * Provides navigation with:
 * - Collapsible sidebar
 * - Active state indicator
 * - Tooltips for collapsed state
 * - Responsive design (collapses on mobile)
 * 
 * Requirements: 17, 47
 */

const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Focus Sessions', href: '/focus', icon: Clock },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const desktopOnlyNavigation = [
  { name: 'Desktop Monitor', href: '/desktop-monitor', icon: Monitor, desktopOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(tauriApi.isTauriEnvironment());
  }, []);

  const navigation = isDesktop
    ? [...baseNavigation.slice(0, 1), ...desktopOnlyNavigation, ...baseNavigation.slice(1)]
    : baseNavigation;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 240,
          marginLeft: collapsed ? 0 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 pt-16 sidebar-nav'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-[#1a1a1d] border-2 border-black rounded-full flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500 transition-all z-50 shadow-[2px_2px_0_#000]"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all group',
                    isActive
                      ? 'bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/5'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)]'
                  )}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full"
                      transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                    />
                  )}

                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-all",
                    collapsed && "mx-auto",
                    isActive && "text-indigo-400"
                  )} />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-xl">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={false}
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 border-t-2 border-black z-40 safe-area-pb"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                  isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-[var(--text-secondary)]'
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}