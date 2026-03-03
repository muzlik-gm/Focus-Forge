'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Loader2, Clock, CheckCircle2, AlertCircle, Target, FileText, TrendingUp, Zap } from 'lucide-react';
import { get } from '@/lib/api-client';
import { PremiumStreakCard } from '@/components/gamification/PremiumStreakCard';
import { WorkHealthCard } from '@/components/dashboard/WorkHealthCard';
import { calculateWorkHealth } from '@/lib/work-health';

interface DashboardData {
  todayFocusHours: number;
  todayTasksCompleted: number;
  currentStreak: number;
  todayDistractions: number;
  weeklyFocus: { day: string; hours: number }[];
  todayTasks: { id: string; title: string; completed: boolean }[];
  todayTotalMinutes?: number;
  weekTotalMinutes?: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    get('/api/analytics/dashboard')
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        console.log('[Dashboard] Received data:', d);
        if (d) {
          setData({
            todayFocusHours: d.todayFocusHours || 0,
            todayTasksCompleted: d.todayTasksCompleted || 0,
            currentStreak: d.currentStreak || 0,
            todayDistractions: d.todayDistractions || 0,
            weeklyFocus: d.weeklyFocus || Array(7).fill(0).map((_, i) => ({
              day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
              hours: 0
            })),
            todayTasks: d.todayTasks || []
          });
        }
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
        </div>
      </div>
    );
  }

  const maxHours = Math.max(...(data?.weeklyFocus.map(d => d.hours) || [1]), 1);
  const hasData = data && (data.todayFocusHours > 0 || data.todayTasksCompleted > 0 || data.currentStreak > 0);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-10">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black mb-1 embossed-text tracking-tighter uppercase italic">Dashboard_Node</h1>
          <p className="text-black/50 text-[10px] font-black uppercase tracking-widest">Global Telemetry Status: ACTIVE [NODE_A1]</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={loading}
          className="skeuo-button h-14 px-8 bg-zinc-100 text-black border-4 border-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
        >
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'SYNCING...' : 'REFRESH_POOL'}
        </button>
      </div>

      {/* Stats Grid - Neo-Brutalist Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Focus Time Card */}
        <div className="skeuo-panel p-6 bg-white border-4 border-black shadow-[6px_6px_0px_black] ring-2 ring-black transform transition-transform hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 border-2 border-black flex items-center justify-center">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <div className="skeuo-badge bg-black text-white text-[8px] font-black uppercase px-2 py-0.5 shadow-none">REAL_TIME</div>
          </div>
          <div className="text-5xl font-black mb-1 tracking-tighter italic">
            {data?.todayFocusHours || 0}<span className="text-lg opacity-30">h</span>
          </div>
          <div className="text-[10px] font-black uppercase text-black/40 mb-4 italic">Focal_Hours / TODAY</div>
          <div className="h-6 w-full bg-zinc-100 border-2 border-black overflow-hidden relative">
            <div
              className="h-full bg-blue-500 border-r-2 border-black transition-all duration-1000"
              style={{ width: `${Math.min((data?.todayFocusHours || 0) * 10, 100)}%` }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase">LINKED</span>
          </div>
        </div>

        {/* Tasks Completed Card */}
        <div className="skeuo-panel p-6 bg-white border-4 border-black shadow-[6px_6px_0px_black] ring-2 ring-black transform transition-transform hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 border-2 border-black flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-black" />
            </div>
            <div className="skeuo-badge bg-black text-white text-[8px] font-black uppercase px-2 py-0.5 shadow-none">SYNCED</div>
          </div>
          <div className="text-5xl font-black mb-1 tracking-tighter italic">
            {data?.todayTasksCompleted || 0}
          </div>
          <div className="text-[10px] font-black uppercase text-black/40 mb-4 italic">Tasks_Resolved / TODAY</div>
          <div className="h-6 w-full bg-zinc-100 border-2 border-black overflow-hidden relative">
            <div
              className="h-full bg-green-500 border-r-2 border-black transition-all duration-1000"
              style={{ width: `${Math.min((data?.todayTasksCompleted || 0) * 20, 100)}%` }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase">RESOLVED</span>
          </div>
        </div>

        {/* Distractions Card */}
        <div className="skeuo-panel p-6 bg-white border-4 border-black shadow-[6px_6px_0px_black] ring-2 ring-black transform transition-transform hover:-translate-y-1 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 border-2 border-black flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-black" />
            </div>
            <div className="skeuo-badge bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 shadow-none">WARNING</div>
          </div>
          <div className="text-5xl font-black mb-1 tracking-tighter italic">
            {data?.todayDistractions || 0}
          </div>
          <div className="text-[10px] font-black uppercase text-black/40 mb-4 italic">Noise_Events / TODAY</div>
          <div className="h-6 w-full bg-zinc-100 border-2 border-black overflow-hidden relative">
            <div
              className="h-full bg-red-500 border-r-2 border-black transition-all duration-1000"
              style={{ width: `${Math.min((data?.todayDistractions || 0) * 20, 100)}%` }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase">DETECTED</span>
          </div>
        </div>

        {/* Quick Action Card */}
        <Link href="/focus" className="skeuo-panel p-6 bg-black text-white border-4 border-black shadow-[6px_6px_0px_blue] ring-2 ring-black transform transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex flex-col items-center justify-center text-center group cursor-pointer">
          <div className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-black" fill="currentColor" />
          </div>
          <div className="text-xl font-black uppercase tracking-tighter italic border-b-2 border-white pb-1 mb-2">Initialize_Session</div>
          <div className="text-[9px] font-black uppercase text-white/40">Sync Your Focus State</div>
        </Link>
      </div>

      {/* Streak Card - Spotlight */}
      <div className="mb-8 p-1 bg-black border-4 border-black shadow-[10px_10px_0px_white] ring-2 ring-black overflow-hidden">
        <PremiumStreakCard currentStreak={data?.currentStreak || 0} />
      </div>

      {/* Work Health Monitoring */}
      <div className="mb-10 p-1 bg-white border-4 border-black shadow-[10px_10px_0px_black] ring-2 ring-black">
        <WorkHealthCard
          health={calculateWorkHealth(
            (data?.todayTotalMinutes || data?.todayFocusHours ? data.todayFocusHours * 60 : 0),
            (data?.weekTotalMinutes || 0)
          )}
        />
      </div>

      {!hasData && (
        <div className="skeuo-panel p-16 text-center mb-10 bg-white border-4 border-black shadow-[15px_15px_0px_black] ring-4 ring-black relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-zinc-50 border-4 border-black mx-auto mb-8 flex items-center justify-center">
              <Target className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tighter uppercase italic border-b-4 border-black inline-block pb-2">
              Ready_To_Deploy?
            </h2>
            <p className="text-black/60 font-bold text-sm mb-10 leading-relaxed uppercase">
              Establish your first focus telemetry connection. Build consistent work patterns and optimize your cognitive cluster for maximum peak performance.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-zinc-50 border-2 border-black shadow-[4px_4px_0px_black]">
                <Target className="w-8 h-8 text-black mb-4 mx-auto" />
                <div className="text-[10px] font-black uppercase italic">Telemetry_Focus</div>
              </div>
              <div className="p-6 bg-zinc-50 border-2 border-black shadow-[4px_4px_0px_black]">
                <Zap className="w-8 h-8 text-black mb-4 mx-auto" />
                <div className="text-[10px] font-black uppercase italic">Streak_Control</div>
              </div>
              <div className="p-6 bg-zinc-50 border-2 border-black shadow-[4px_4px_0px_black]">
                <TrendingUp className="w-8 h-8 text-black mb-4 mx-auto" />
                <div className="text-[10px] font-black uppercase italic">Node_Analytics</div>
              </div>
            </div>

            <Link
              href="/focus"
              className="skeuo-button h-16 px-12 bg-black text-white font-black text-lg uppercase shadow-[8px_8px_0px_white] ring-4 ring-black hover:bg-zinc-800 transition-all"
            >
              <span>Initialize_Sync</span>
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 pb-10">
        {/* Weekly Chart - Enhanced */}
        <div className="lg:col-span-2 skeuo-panel p-10 bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-12 pb-6 border-b-2 border-black">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 border-2 border-black flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Weekly_Pulse</h2>
                <p className="text-black/40 text-[9px] font-black uppercase mt-1">Telemetry History / Node_A1</p>
              </div>
            </div>
            <Link href="/analytics-page" className="skeuo-button bg-black text-white px-6 py-3 uppercase font-black text-[10px] shadow-[4px_4px_0px_white]">
              View_Full_Insight
            </Link>
          </div>

          <div className="flex items-end gap-2 h-64 relative border-l-2 border-b-2 border-black/10 pt-4 px-2">
            {/* Bars */}
            <div className="flex-1 flex items-end gap-3 px-4">
              {data?.weeklyFocus.map((d, i) => {
                const height = maxHours > 0 ? (d.hours / maxHours) * 100 : 0;
                const isToday = i === new Date().getDay();
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full">
                    <div className="relative w-full h-full flex items-end">
                      <div
                        className={`w-full border-2 border-black transition-all duration-500 shadow-[2px_2px_0px_black] ${isToday
                          ? 'bg-blue-500'
                          : 'bg-zinc-100 group-hover:bg-zinc-200'
                          }`}
                        style={{ height: `${height}%`, minHeight: d.hours > 0 ? '8px' : '0' }}
                      >
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-black text-white px-2 py-1 text-[8px] font-black uppercase whitespace-nowrap border border-white">
                          {d.hours} HOURS
                        </div>
                      </div>
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-tighter ${isToday ? 'bg-black text-white px-2 py-0.5' : 'text-black/30'}`}>
                      {d.day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tasks - Enhanced */}
        <div className="skeuo-panel p-8 bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black">
          <div className="flex flex-col gap-6 mb-10 pb-6 border-b-2 border-black">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-50 border-2 border-black flex items-center justify-center">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Resolve_List</h2>
                <p className="text-black/40 text-[9px] font-black uppercase mt-1">Priority Tasks / TODAY</p>
              </div>
            </div>
            <Link href="/tasks" className="skeuo-button bg-black text-white px-6 py-4 uppercase font-black text-xs shadow-[4px_4px_0px_white] w-fit text-center">
              MANAGE_GRID
            </Link>
          </div>

          {data?.todayTasks && data.todayTasks.length > 0 ? (
            <div className="space-y-3">
              {data.todayTasks.slice(0, 6).map((task, index) => (
                <div
                  key={task.id}
                  className="bg-zinc-50 border-2 border-black p-4 flex items-center gap-4 hover:translate-x-1 transition-transform group"
                >
                  <div className={`w-6 h-6 border-2 border-black flex items-center justify-center flex-shrink-0 transition-colors ${task.completed ? 'bg-green-500' : 'bg-white'}`}>
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight flex-grow transition-all ${task.completed ? 'text-black/30' : 'text-black'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-50 border-2 border-black border-dashed">
              <FileText className="w-12 h-12 text-black/10 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase text-black/40">NO_RESOLUTIONS_DETECTED</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
