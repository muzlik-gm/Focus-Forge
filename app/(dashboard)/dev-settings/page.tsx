'use client';

import { useState } from 'react';
import { Settings, RefreshCw, Flame, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DevSettingsPage() {
    const [streakLengthStr, setStreakLengthStr] = useState<string>('7');
    const [isLoading, setIsLoading] = useState(false);

    // Safeguard
    if (process.env.NODE_ENV !== 'development') {
        return (
            <div className="max-w-3xl mx-auto p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Access Denied</h1>
                <p className="text-zinc-500 font-medium text-sm">
                    This area is restricted to local development environments only.
                </p>
            </div>
        );
    }

    const handleAction = async (action: string, value?: any) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/dev/gamification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, value }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(data.message || 'Operation Successful');
        } catch (err: any) {
            toast.error(err.message || 'Action failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStreakSubmit = () => {
        const parsed = parseInt(streakLengthStr, 10);
        if (isNaN(parsed) || parsed < 1) {
            toast.error('Please enter a valid number of days (minimum 1)');
            return;
        }
        handleAction('set_streak', parsed);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black mb-1 tracking-tight text-white flex items-center gap-3">
                        Dev Control Panel
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest">Danger Zone</span>
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium mt-2">
                        Manipulate internal application state for testing.
                    </p>
                </div>
                <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900/50 flex flex-shrink-0 items-center justify-center">
                    <Settings className="w-5 h-5 text-zinc-500" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

                {/* Streak Manipulation Panel */}
                <div className="skeuo-panel p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex flex-shrink-0 items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-500" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Streak Override</h2>
                    </div>

                    <p className="text-sm font-medium text-zinc-400 mb-6 leading-relaxed">
                        Forces your streak to exactly N days by injecting consecutive historical focus sessions and breaking the chain before that.
                    </p>

                    <div className="flex gap-4 items-center mb-6">
                        <input
                            type="number"
                            min={1}
                            value={streakLengthStr}
                            onChange={(e) => setStreakLengthStr(e.target.value)}
                            placeholder="7"
                            className="skeuo-input w-24 px-4 py-3 text-center text-lg font-bold"
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Days</span>
                    </div>

                    <button
                        onClick={handleStreakSubmit}
                        disabled={isLoading}
                        className="skeuo-button w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white shadow-lg transition-all"
                    >
                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Force Overwrite'}
                    </button>
                </div>

                {/* Global Reset Wipe Panel */}
                <div className="skeuo-panel p-8 border border-red-900/30 bg-red-950/5">
                    <div className="flex items-center gap-3 mb-6 border-b border-red-900/20 pb-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex flex-shrink-0 items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-lg font-bold text-red-400">Clear All Data</h2>
                    </div>

                    <p className="text-sm font-medium text-zinc-400 mb-6 leading-relaxed">
                        Wipes ALL your Focus Sessions and unlocked Achievements. Resets your timeline to Day 0. This cannot be undone.
                    </p>

                    <div className="mt-auto pt-6">
                        <button
                            onClick={() => {
                                if (window.confirm("Are you SURE? This destroys all your session data permanently!")) {
                                    handleAction('clear_data');
                                }
                            }}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl bg-red-600 hover:bg-red-500 border border-red-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(239,68,68,0.2)] transition-all disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Wipe All Data'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
