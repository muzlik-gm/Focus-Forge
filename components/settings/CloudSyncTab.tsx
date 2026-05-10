'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle,
    Upload, Download, Wifi, Clock, Database, ShieldCheck,
} from 'lucide-react';
import { cloudSync, SyncStatus } from '@/lib/cloud-sync';

export function CloudSyncTab() {
    const [status, setStatus] = useState<SyncStatus>({
        isSyncing: false,
        lastSyncAt: null,
        error: null,
        stats: { cloudSessions: 0, cloudTasks: 0, localSessionsPushed: 0 },
        authenticated: false,
        syncAvailable: false,
        email: null,
        lastCheckAt: null,
    });
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [, forceUpdate] = useState(0);

    // Refresh the "time ago" display every 10 seconds
    useEffect(() => {
        const timer = setInterval(() => forceUpdate(n => n + 1), 10000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Subscribe to sync status updates
        const unsubscribe = cloudSync.subscribe(setStatus);

        // Check current status on mount
        cloudSync.checkStatus();

        // Start auto-sync only if in desktop environment
        if (typeof window !== 'undefined' && '__TAURI__' in window) {
            cloudSync.startAutoSync();
        }

        return () => {
            unsubscribe();
        };
    }, []);

    const handleFullSync = useCallback(async () => {
        setLastAction(null);
        await cloudSync.sync();
        setLastAction('sync');
    }, []);

    const handlePush = useCallback(async () => {
        setLastAction(null);
        const result = await cloudSync.push();
        setLastAction(`Pushed ${result.pushed} sessions to cloud`);
    }, []);

    const handlePull = useCallback(async () => {
        setLastAction(null);
        const data = await cloudSync.pull();
        if (data) {
            setLastAction(`Pulled ${data.tasks.length} tasks and ${data.recentFocusSessions.length} sessions from cloud`);
        }
    }, []);

    const formatTime = (isoString: string | null) => {
        if (!isoString) return 'Never';
        const d = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        const diffHours = Math.round(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        return d.toLocaleDateString();
    };

    const isDesktop = typeof window !== 'undefined' && '__TAURI__' in window;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black mb-2 text-white tracking-tight">Cloud Sync</h2>
                <p className="text-base text-zinc-400">
                    Sync your focus sessions and tasks across all your devices in real-time.
                </p>
            </div>

            {/* Connection Status Card */}
            <div className={`p-8 skeuo-panel ${status.authenticated
                ? 'border-emerald-500/30'
                : 'border-zinc-800'
                }`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${status.authenticated
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-zinc-800 border border-zinc-700'
                            }`}>
                            {status.authenticated
                                ? <Cloud className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
                                : <CloudOff className="w-8 h-8 text-zinc-500" strokeWidth={1.5} />
                            }
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white mb-1">
                                {status.authenticated ? 'Cloud Sync Active' : 'Cloud Sync Unavailable'}
                            </p>
                            <p className="text-sm font-medium text-zinc-400">
                                {status.authenticated
                                    ? `Signed in as ${status.email}`
                                    : 'Sign in with your account to enable cloud sync'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${status.authenticated
                            ? 'bg-emerald-400'
                            : 'bg-zinc-600'
                            }`} />
                        <span className={`text-sm font-semibold ${status.authenticated ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {status.authenticated ? 'Connected' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            {status.authenticated && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        {
                            icon: Database,
                            label: 'Cloud Sessions',
                            value: status.stats.cloudSessions,
                            color: 'blue',
                        },
                        {
                            icon: CheckCircle2,
                            label: 'Cloud Tasks',
                            value: status.stats.cloudTasks,
                            color: 'purple',
                        },
                        {
                            icon: Upload,
                            label: 'Sessions Pushed',
                            value: status.stats.localSessionsPushed,
                            color: 'emerald',
                        },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="p-6 skeuo-panel text-center group">
                                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                                    <Icon className={`w-6 h-6 text-${stat.color}-400`} strokeWidth={1.5} />
                                </div>
                                <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Last Sync Info */}
            {status.authenticated && (
                <div className="flex items-center justify-between p-6 skeuo-panel">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Clock className={`w-5 h-5 ${status.isSyncing ? 'text-blue-400' : 'text-zinc-500'}`} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-white">Cloud Status</p>
                                {status.isSyncing && (
                                    <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                                )}
                            </div>
                            <p className="text-sm font-medium text-zinc-400">
                                {status.isSyncing ? 'Synchronizing now...' : `Last check: ${formatTime(status.lastCheckAt)}`}
                            </p>
                        </div>
                    </div>
                    {status.lastSyncAt && (
                        <span className="text-xs text-zinc-600 font-mono">
                            {new Date(status.lastSyncAt).toLocaleString()}
                        </span>
                    )}
                </div>
            )}

            {/* Error Message */}
            {status.error && (
                <div className="flex items-start gap-4 p-5 skeuo-panel border-red-500/30 bg-red-500/5">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                        <p className="text-sm font-bold text-red-400 mb-1">Sync Error</p>
                        <p className="text-sm text-zinc-400">{status.error}</p>
                    </div>
                </div>
            )}

            {/* Success Action Feedback */}
            {lastAction && !status.error && (
                <div className="flex items-center gap-4 p-5 skeuo-panel border-emerald-500/30 bg-emerald-500/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-sm font-bold text-emerald-400">{lastAction}</p>
                </div>
            )}

            {/* Sync Actions */}
            {status.authenticated && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Sync Controls</h3>

                    <div className="grid sm:grid-cols-3 gap-4">
                        {/* Full Sync */}
                        <button
                            onClick={handleFullSync}
                            disabled={status.isSyncing}
                            className="flex flex-col items-center gap-3 p-6 skeuo-button text-white disabled:opacity-50 transition-all group"
                        >
                            <RefreshCw className={`w-7 h-7 ${status.isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} strokeWidth={1.5} />
                            <div className="text-center">
                                <p className="font-bold text-sm">Full Sync</p>
                                <p className="text-xs font-medium text-white/60">Push & Pull</p>
                            </div>
                        </button>

                        {/* Push Only */}
                        <button
                            onClick={handlePush}
                            disabled={status.isSyncing || !isDesktop}
                            className="flex flex-col items-center gap-3 p-6 skeuo-panel text-zinc-300 hover:text-white disabled:opacity-40 transition-all hover:bg-zinc-800 group"
                        >
                            <Upload className="w-7 h-7 group-hover:-translate-y-1 transition-transform" strokeWidth={1.5} />
                            <div className="text-center">
                                <p className="font-bold text-sm">Push Local</p>
                                <p className="text-xs font-medium text-zinc-500">Upload to cloud</p>
                            </div>
                        </button>

                        {/* Pull Only */}
                        <button
                            onClick={handlePull}
                            disabled={status.isSyncing}
                            className="flex flex-col items-center gap-3 p-6 skeuo-panel text-zinc-300 hover:text-white disabled:opacity-40 transition-all hover:bg-zinc-800 group"
                        >
                            <Download className="w-7 h-7 transition-transform" strokeWidth={1.5} />
                            <div className="text-center">
                                <p className="font-bold text-sm">Pull Cloud</p>
                                <p className="text-xs font-medium text-zinc-500">Download to device</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Auto-Sync Info */}
            {status.authenticated && (
                <div className="p-6 skeuo-panel">
                    <div className="flex items-center gap-4 mb-4">
                        <Wifi className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
<<<<<<< HEAD
                        <p className="font-bold text-white">Real-time Auto-Sync</p>
=======
                        <p className="font-bold text-white">Auto-Sync</p>
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
                        <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                            Live
                        </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                        Your data automatically syncs to the cloud every <strong className="text-white">30 seconds</strong>.
                        Focus sessions are uploaded immediately after completion. Cloud tasks are synced instantly whenever you open the app.
                    </p>
                </div>
            )}

            {/* Security Note */}
            <div className="p-6 skeuo-panel">
                <div className="flex items-center gap-4 mb-3">
                    <ShieldCheck className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                    <p className="font-bold text-zinc-300 text-sm">Data & Privacy</p>
                </div>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                    All synced data is encrypted in transit using TLS. Focus sessions include duration, distraction counts, and goals —
                    no screen content or keystrokes are ever recorded. You can delete your cloud data at any time from Account Settings.
                </p>
            </div>

            {/* Not authenticated CTA */}
            {!status.authenticated && (
                <div className="p-10 skeuo-panel text-center">
                    <Cloud className="w-16 h-16 mx-auto mb-6 text-zinc-600" strokeWidth={1} />
                    <h3 className="text-xl font-bold text-white mb-3">Sign in to Enable Cloud Sync</h3>
                    <p className="text-zinc-400 font-medium mb-8 max-w-sm mx-auto">
                        Access your productivity data from any device. Your focus sessions, tasks,
                        and analytics will sync automatically.
                    </p>
                    <a
                        href="/login"
                        className="skeuo-button inline-flex items-center gap-3 px-10 py-4 text-white font-bold shadow-xl transition-all"
                    >
                        <Cloud className="w-5 h-5" />
                        Sign In to Sync
                    </a>
                </div>
            )}
        </motion.div>
    );
}
