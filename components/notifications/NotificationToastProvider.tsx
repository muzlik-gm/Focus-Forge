'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Zap, Cloud, Trophy, Clock, Info } from 'lucide-react';
import type { DesktopNotification, NotificationType } from '@/lib/desktop-notifications';

interface ToastNotification extends DesktopNotification {
    id: string;
    createdAt: number;
}

const ICONS: Record<NotificationType, React.ElementType> = {
    focus: Zap,
    distraction: Bell,
    sync: Cloud,
    achievement: Trophy,
    reminder: Clock,
    info: Info,
};

const COLORS: Record<NotificationType, string> = {
    focus: 'border-blue-500/30 bg-blue-500/5',
    distraction: 'border-amber-500/30 bg-amber-500/5',
    sync: 'border-emerald-500/30 bg-emerald-500/5',
    achievement: 'border-purple-500/30 bg-purple-500/5',
    reminder: 'border-cyan-500/30 bg-cyan-500/5',
    info: 'border-zinc-500/30 bg-zinc-500/5',
};

const ICON_COLORS: Record<NotificationType, string> = {
    focus: 'text-blue-400',
    distraction: 'text-amber-400',
    sync: 'text-emerald-400',
    achievement: 'text-purple-400',
    reminder: 'text-cyan-400',
    info: 'text-zinc-400',
};

export function NotificationToastProvider() {
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<DesktopNotification>).detail;
            const id = Math.random().toString(36).slice(2);
            const toast: ToastNotification = {
                ...detail,
                id,
                createdAt: Date.now(),
                durationMs: detail.durationMs ?? 5000,
            };

            setToasts(prev => [...prev, toast]);

            // Auto-remove after duration
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, toast.durationMs);
        };

        window.addEventListener('focusforge:notification', handler);
        return () => window.removeEventListener('focusforge:notification', handler);
    }, []);

    const dismiss = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="sync">
                {toasts.map((toast) => {
                    const type = toast.type ?? 'info';
                    const Icon = ICONS[type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 60, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl
                border backdrop-blur-xl shadow-2xl skeuo-panel
                ${COLORS[type]}`}
                        >
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                bg-black/30 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]`}>
                                <Icon className={`w-5 h-5 ${ICON_COLORS[type]}`} strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white leading-tight mb-0.5">{toast.title}</p>
                                <p className="text-xs font-medium text-zinc-400 leading-relaxed">{toast.body}</p>
                            </div>

                            {/* Close */}
                            <button
                                onClick={() => dismiss(toast.id)}
                                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg
                  text-zinc-600 hover:text-white hover:bg-white/5 transition-colors mt-0.5"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>,
        document.body
    );
}
