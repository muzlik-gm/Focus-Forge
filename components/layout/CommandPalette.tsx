'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Calendar, CheckSquare, BarChart2, Users, Settings, LogOut } from 'lucide-react';

/**
 * Command Palette Component
 * 
 * Provides a keyboard-accessible command palette (Cmd/Ctrl+K)
 * for quick navigation and actions.
 * 
 * Requirements: 15
 */

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  }, [router]);

  // Build commands array inside component to have access to router and signOut
  const COMMANDS: Command[] = useMemo(() => [
    {
      id: 'goto-dashboard',
      label: 'Go to Dashboard',
      icon: <BarChart2 className="w-4 h-4" />,
      action: () => router.push('/dashboard'),
      category: 'Navigation',
    },
    {
      id: 'goto-tasks',
      label: 'Go to Tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => router.push('/tasks'),
      category: 'Navigation',
    },
    {
      id: 'goto-analytics',
      label: 'Go to Analytics',
      icon: <BarChart2 className="w-4 h-4" />,
      action: () => router.push('/analytics'),
      category: 'Navigation',
    },
    {
      id: 'goto-team',
      label: 'Go to Team',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/team'),
      category: 'Navigation',
    },
    {
      id: 'goto-review',
      label: 'Go to Weekly Review',
      icon: <Calendar className="w-4 h-4" />,
      action: () => router.push('/review'),
      category: 'Navigation',
    },
    {
      id: 'goto-settings',
      label: 'Go to Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/settings'),
      category: 'Navigation',
    },
    {
      id: 'create-task',
      label: 'Create New Task',
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => router.push('/tasks?new=true'),
      category: 'Actions',
    },
    {
      id: 'start-focus',
      label: 'Start Focus Session',
      icon: <BarChart2 className="w-4 h-4" />,
      action: () => router.push('/focus'),
      category: 'Actions',
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: <LogOut className="w-4 h-4" />,
      action: signOut,
      category: 'Account',
    },
  ], [router, signOut]);

  // Filter commands based on search query
  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          command.action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle command execution
  const handleCommandClick = useCallback((command: Command) => {
    command.action();
    setIsOpen(false);
  }, []);

  const modalContent = isOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal content */}
      <div className="relative z-[110] w-full max-w-2xl mx-4 bg-[#0f0f10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden skeuo-panel p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold embossed-text tracking-tight text-white">Command Palette</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-black/20">
          <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-zinc-600 font-medium"
            autoFocus
          />
        </div>

        {/* Command list */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="mb-3 last:mb-0">
              <div className="px-6 py-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {category}
              </div>
              {commands.map((command) => {
                const globalIndex = filteredCommands.indexOf(command);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <button
                    key={command.id}
                    onClick={() => handleCommandClick(command)}
                    className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all ${isSelected
                        ? 'bg-blue-500/20 text-white border-l-2 border-blue-500'
                        : 'hover:bg-white/5 text-zinc-400 hover:text-white border-l-2 border-transparent'
                      }`}
                  >
                    <div className={`${isSelected ? 'text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}>
                      {command.icon}
                    </div>
                    <span className="flex-1 font-medium text-sm tracking-wide">{command.label}</span>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-6 py-12 text-center text-zinc-600 font-medium">
              No commands found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 px-6 py-4 border-t border-white/5 bg-black/40 text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-zinc-900 rounded-[6px] border border-zinc-800 text-zinc-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)]">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-zinc-900 rounded-[6px] border border-zinc-800 text-zinc-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)]">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-zinc-900 rounded-[6px] border border-zinc-800 text-zinc-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)]">esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] bg-[var(--surface-elevated)] hover:bg-[var(--border)] rounded-xl transition-all border border-[var(--border)]"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--surface)] rounded-md border border-[var(--border)]">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {modalContent}
    </>
  );
}