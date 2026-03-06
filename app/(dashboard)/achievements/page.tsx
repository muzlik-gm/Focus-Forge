'use client';

import { useState, useEffect } from 'react';
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
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const res = await fetch('/api/achievements');
            if (res.ok) {
                setUnlocked(await res.json());
            }
        } catch {
            toast.error('Telemetry interference fetching Gamification Data');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/achievements/sync', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error('Sync failed');

            setStats(data.stats);

            if (data.newUnlocks && data.newUnlocks.length > 0) {
                toast.success(`SYSTEM_UPGRADE: Unlocked ${data.newUnlocks.length} badges!`);
                fetchAchievements();
            } else {
                toast.success('Matrix Sync Complete - No New Unlocks');
            }
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    const totalPoints = unlocked.reduce((acc, curr) => acc + curr.achievement.points, 0);

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-10">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black mb-1 embossed-text tracking-tighter uppercase italic">Gamification_Matrix</h1>
                    <p className="text-black/50 text-[10px] font-black uppercase tracking-widest">Progress Data / Honors / Rewards</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="bg-black text-white px-6 py-4 border-4 border-black shadow-[4px_4px_0px_white] ring-2 ring-black">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block leading-none mb-1">Total_Reputation</span>
                        <span className="text-2xl font-black leading-none">{totalPoints}_XP</span>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="skeuo-button h-16 w-16 bg-zinc-100 text-black border-4 border-black flex items-center justify-center font-black uppercase tracking-tighter shadow-[4px_4px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-6 h-6 ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-black" />
                </div>
            ) : unlocked.length === 0 ? (
                <div className="text-center py-24 skeuo-panel bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black relative overflow-hidden">
                    <Trophy className="w-16 h-16 text-black/10 mx-auto mb-6" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-2">No_Honors_Found</h3>
                    <p className="text-black/50 font-bold uppercase text-xs mb-8">Initiate tasks and focus sessions to unlock operational achievements.</p>
                    <button
                        onClick={handleSync}
                        className="skeuo-button px-10 py-5 bg-black text-white font-black uppercase tracking-tighter shadow-[6px_6px_0px_black] ring-2 ring-black hover:bg-zinc-800 transition-all text-sm mx-auto"
                    >
                        Force_Scan_Matrix
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unlocked.map(({ achievement, unlockedAt }) => {
                        const IconComp = ICON_MAP[achievement.icon] || Star;
                        return (
                            <div key={achievement.id} className="skew-panel bg-white border-4 border-black ring-2 ring-black shadow-[8px_8px_0px_black] hover:shadow-[12px_12px_0px_black] transform hover:-translate-y-1 transition-all group overflow-hidden relative p-8">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center border-4 border-black">
                                    <IconComp className="w-10 h-10 text-black mb-4 mr-4" />
                                </div>

                                <div className="mb-8 pr-16 relative z-10">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">{achievement.name}</h3>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-black/50 mb-1">{achievement.category}_Track</div>
                                </div>

                                <p className="text-black/80 font-bold text-sm mb-10 h-10 line-clamp-2 pr-4 relative z-10">
                                    {achievement.description}
                                </p>

                                <div className="border-t-4 border-black pt-4 flex items-center justify-between relative z-10">
                                    <div className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_black] ring-1 ring-white">
                                        <Zap className="w-3 h-3" />
                                        {achievement.points} XP
                                    </div>
                                    <div className="text-[8px] font-black uppercase text-black/40">
                                        Unlocked: {new Date(unlockedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Placeholder Locked Section to show aesthetic */}
            {!loading && unlocked.length > 0 && (
                <div className="mt-20">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic border-b-4 border-black pb-2 mb-8 inline-block">Secure_Vault (Locked)</h2>
                    <div className="grid md:grid-cols-4 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="border-4 border-black border-dashed p-6 flex flex-col items-center justify-center text-center bg-zinc-50 relative overflow-hidden group">
                                <Lock className="w-8 h-8 text-black mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black uppercase tracking-tighter italic text-sm mb-1">Classified</h4>
                                <p className="text-[8px] font-black uppercase text-black/40">Requires higher clearance level</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
