'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flame, Trophy, Crown, Star, Zap, Sparkles, Loader2, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    category: string;
}

interface UserAchievement {
    achievement: Achievement;
    unlockedAt: string;
}

const ICON_MAP: Record<string, any> = {
    Flame, Trophy, Crown, Star, Zap, Sparkles, CheckCircle2
};

export default function AchievementsPage() {
    const [unlocked, setUnlocked] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchAchievements = useCallback(async () => {
        try {
            const res = await fetch('/api/achievements');
            if (res.ok) {
                setUnlocked(await res.json());
            }
        } catch {
            // silently fail on background refresh
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSync = useCallback(async (silent = false) => {
        setSyncing(true);
        try {
            const res = await fetch('/api/achievements/sync', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error('Sync failed');

            if (data.newUnlocks && data.newUnlocks.length > 0) {
                if (!silent) toast.success(`🎉 Unlocked ${data.newUnlocks.length} new achievement${data.newUnlocks.length > 1 ? 's' : ''}!`);
                await fetchAchievements();
            } else {
                await fetchAchievements();
                if (!silent) toast.success('All up to date!');
            }
        } catch (error) {
            if (!silent) toast.error('Sync failed. Please try again.');
        } finally {
            setSyncing(false);
        }
    }, [fetchAchievements]);

    // Auto-sync on mount (real-time on page load)
    useEffect(() => {
        handleSync(true); // silent=true on auto load
    }, [handleSync]);

    // Re-sync whenever window regains focus (user switches back to tab)
    useEffect(() => {
        const onFocus = () => handleSync(true);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [handleSync]);

    const totalPoints = unlocked.reduce((acc, curr) => acc + curr.achievement.points, 0);

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-10">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-1 tracking-tight uppercase italic text-white">Achievements</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">Your Progress and Rewards</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="skeuo-panel px-6 py-4 flex flex-col justify-center min-w-[120px]">
                        <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 block leading-none mb-1">Total Points</span>
                        <span className="text-2xl font-bold leading-none text-white">{totalPoints} XP</span>
                    </div>

                    <button
                        onClick={() => handleSync(false)}
                        disabled={syncing}
                        title="Sync Achievements"
                        className="skeuo-button h-[68px] px-6"
                    >
                        <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-zinc-500" />
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Checking your achievements...</p>
                </div>
            ) : unlocked.length === 0 ? (
                <div className="text-center py-24 skeuo-panel">
                    <Trophy className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold uppercase tracking-tight italic mb-2 text-white">No Achievements Yet</h3>
                    <p className="text-zinc-500 font-bold uppercase text-xs mb-8">Complete tasks and focus sessions to unlock achievements.</p>
                    <button
                        onClick={() => handleSync(false)}
                        className="skeuo-button"
                    >
                        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync Achievements'}
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unlocked.map(({ achievement, unlockedAt }) => {
                        const IconComp = ICON_MAP[achievement.icon] || Star;
                        return (
                            <div key={achievement.id} className="skeuo-card p-6 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 pr-4">
                                        <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 mb-1">{achievement.category}</div>
                                        <h3 className="text-xl font-bold tracking-tight uppercase italic text-white line-clamp-1">{achievement.name}</h3>
                                    </div>
                                    <div className="skeuo-icon-container w-12 h-12 flex-shrink-0">
                                        <IconComp className="w-6 h-6 text-indigo-400" />
                                    </div>
                                </div>

                                <p className="text-zinc-400 font-medium text-sm mb-6 line-clamp-2 flex-grow">
                                    {achievement.description}
                                </p>

                                <div className="border-t border-zinc-800 pt-4 flex items-center justify-between mt-auto">
                                    <div className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 border border-indigo-500/20">
                                        <Zap className="w-3 h-3" />
                                        {achievement.points} XP
                                    </div>
                                    <div className="text-[9px] font-bold uppercase text-zinc-500">
                                        Unlocked: {new Date(unlockedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Locked Section */}
            {!loading && unlocked.length > 0 && (
                <div className="mt-20">
                    <h2 className="text-xl font-bold uppercase tracking-tight italic text-zinc-400 mb-6 flex items-center gap-3">
                        <Lock className="w-5 h-5" />
                        Locked Achievements
                    </h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="skeuo-card bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center opacity-70 cursor-not-allowed hover:transform-none hover:shadow-none hover:bg-zinc-900/40">
                                <Lock className="w-8 h-8 text-zinc-600 mb-4" />
                                <h4 className="font-bold uppercase tracking-tight text-sm mb-1 text-zinc-500">Locked</h4>
                                <p className="text-[10px] font-bold uppercase text-zinc-600">Keep working to unlock</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
