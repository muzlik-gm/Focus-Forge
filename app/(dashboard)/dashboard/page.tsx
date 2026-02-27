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
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 embossed-text tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 text-sm">Track your focus and productivity</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={loading}
          className="skeuo-button px-4 py-2 text-sm text-white font-medium inline-flex items-center gap-2"
        >
          <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid - Compact Layout */}
      <div className="grid grid-cols-12 gap-3 mb-5">
        {/* Focus Time Card */}
        <div className="col-span-3 skeuo-panel p-5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="skeuo-badge text-[9px] px-1.5 py-0.5">TODAY</div>
          </div>
          <div className="text-3xl font-black mb-0.5 embossed-text group-hover:scale-105 transition-transform duration-300">
            {data?.todayFocusHours || 0}<span className="text-lg text-zinc-500">h</span>
          </div>
          <div className="text-zinc-400 text-xs font-medium mb-2">Focus time</div>
          <div className="skeuo-progress h-1.5">
            <div 
              className="skeuo-progress-bar h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000" 
              style={{ width: `${Math.min((data?.todayFocusHours || 0) * 10, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-500">
            {data?.todayFocusHours === 0 ? 'Start a session' :
             data?.todayFocusHours && data.todayFocusHours < 2 ? 'Keep going!' :
             data?.todayFocusHours && data.todayFocusHours < 4 ? 'Great progress!' :
             'Excellent work!'}
          </div>
        </div>
        
        {/* Tasks Completed Card */}
        <div className="col-span-3 skeuo-panel p-5 hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="skeuo-badge text-[9px] px-1.5 py-0.5">TODAY</div>
          </div>
          <div className="text-3xl font-black mb-0.5 embossed-text group-hover:scale-105 transition-transform duration-300">
            {data?.todayTasksCompleted || 0}
          </div>
          <div className="text-zinc-400 text-xs font-medium mb-2">Tasks completed</div>
          <div className="skeuo-progress h-1.5">
            <div 
              className="skeuo-progress-bar h-1.5 bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000" 
              style={{ width: `${Math.min((data?.todayTasksCompleted || 0) * 20, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-500">
            {data?.todayTasksCompleted === 0 ? 'Create a task' :
             data?.todayTasksCompleted === 1 ? 'One down!' :
             data?.todayTasksCompleted && data.todayTasksCompleted < 5 ? 'Making progress!' :
             'Crushing it!'}
          </div>
        </div>
        
        {/* Distractions Card */}
        <div className="col-span-3 skeuo-panel p-5 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="skeuo-badge text-[9px] px-1.5 py-0.5">TODAY</div>
          </div>
          <div className="text-3xl font-black mb-0.5 embossed-text group-hover:scale-105 transition-transform duration-300">
            {data?.todayDistractions || 0}
          </div>
          <div className="text-zinc-400 text-xs font-medium mb-2">Distractions</div>
          <div className="skeuo-progress h-1.5">
            <div 
              className="skeuo-progress-bar h-1.5 bg-gradient-to-r from-orange-500 to-red-400 transition-all duration-1000" 
              style={{ width: `${Math.min((data?.todayDistractions || 0) * 20, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-500">
            {data?.todayDistractions === 0 ? 'Perfect focus!' :
             data?.todayDistractions === 1 ? 'Almost perfect' :
             data?.todayDistractions && data.todayDistractions < 3 ? 'Room to improve' :
             'Try app blockers'}
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="col-span-3 skeuo-panel p-5 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 group cursor-pointer">
          <Link href="/focus" className="block h-full">
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Play className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div className="text-base font-bold text-white mb-0.5 embossed-text">Start Session</div>
              <div className="text-[10px] text-zinc-400">Begin focusing now</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Streak Card - Full Width Spotlight */}
      <div className="mb-6">
        <PremiumStreakCard currentStreak={data?.currentStreak || 0} />
      </div>

      {/* Work Health Monitoring */}
      <div className="mb-6">
        <WorkHealthCard 
          health={calculateWorkHealth(
            (data?.todayTotalMinutes || data?.todayFocusHours ? data.todayFocusHours * 60 : 0),
            (data?.weekTotalMinutes || 0)
          )}
        />
      </div>

      {!hasData && (
        <div className="skeuo-panel p-10 text-center mb-6 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative z-10">
            <div className="skeuo-avatar w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2 embossed-text bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Ready to Build Your Focus Habit?
            </h2>
            <p className="text-zinc-300 text-sm mb-6 max-w-2xl mx-auto leading-relaxed">
              Start your first focus session and begin tracking your productivity journey. 
              Build streaks, eliminate distractions, and achieve deep work mastery.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
              <div className="skeuo-card p-3">
                <div className="text-2xl mb-1.5">🎯</div>
                <div className="text-xs font-bold text-white mb-0.5">Smart Tracking</div>
                <div className="text-[10px] text-zinc-400">Automatic distraction detection</div>
              </div>
              <div className="skeuo-card p-3">
                <div className="text-2xl mb-1.5">🔥</div>
                <div className="text-xs font-bold text-white mb-0.5">Build Streaks</div>
                <div className="text-[10px] text-zinc-400">Stay consistent, see results</div>
              </div>
              <div className="skeuo-card p-3">
                <div className="text-2xl mb-1.5">💡</div>
                <div className="text-xs font-bold text-white mb-0.5">Get Insights</div>
                <div className="text-[10px] text-zinc-400">Personalized productivity tips</div>
              </div>
            </div>
            
            <Link 
              href="/focus"
              className="skeuo-button inline-flex items-center gap-2.5 px-8 py-4 text-white font-bold text-base shadow-xl hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              <span>Start Your First Session</span>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Weekly Chart - Enhanced */}
        <div className="col-span-2 skeuo-panel p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-1 embossed-text text-white">
                  Weekly Focus Hours
                </h2>
                <p className="text-zinc-400 text-xs">Your productivity trend over the last 7 days</p>
              </div>
            </div>
            <Link href="/analytics" className="skeuo-chip hover:bg-blue-500/20 transition-colors flex-shrink-0">
              <span className="text-xs font-medium">View analytics →</span>
            </Link>
          </div>
          
          <div className="flex items-end gap-3 h-48 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-zinc-600 pr-2">
              <span>{maxHours}h</span>
              <span>{Math.round(maxHours * 0.75)}h</span>
              <span>{Math.round(maxHours * 0.5)}h</span>
              <span>{Math.round(maxHours * 0.25)}h</span>
              <span>0h</span>
            </div>
            
            {/* Bars */}
            <div className="flex-1 flex items-end gap-2 ml-8">
              {data?.weeklyFocus.map((d, i) => {
                const height = maxHours > 0 ? (d.hours / maxHours) * 100 : 0;
                const isToday = i === new Date().getDay();
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full h-full flex items-end">
                      {/* Bar */}
                      <div 
                        className={`w-full rounded-t-lg relative overflow-hidden transition-all duration-500 ${
                          isToday 
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
                            : 'bg-gradient-to-t from-blue-600/40 to-blue-500/60 group-hover:from-blue-600/60 group-hover:to-blue-500/80'
                        }`}
                        style={{ height: `${height}%`, minHeight: d.hours > 0 ? '8px' : '0' }}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Value tooltip */}
                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-lg">
                          {d.hours}h
                        </div>
                      </div>
                    </div>
                    
                    {/* Day label */}
                    <div className={`text-[10px] font-bold transition-colors ${
                      isToday ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}>
                      {d.day}
                      {isToday && <div className="w-1 h-1 bg-blue-400 rounded-full mx-auto mt-0.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Summary stats */}
          <div className="mt-6 pt-4 border-t border-zinc-800/50 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400 mb-0.5">
                {data?.weeklyFocus.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">Total This Week</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400 mb-0.5">
                {data?.weeklyFocus.filter(d => d.hours > 0).length}
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">Active Days</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400 mb-0.5">
                {(data?.weeklyFocus.reduce((sum, d) => sum + d.hours, 0) / 7).toFixed(1)}h
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">Daily Average</div>
            </div>
          </div>
        </div>

        {/* Tasks - Enhanced */}
        <div className="skeuo-panel p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-1 embossed-text text-white">
                  Today's Tasks
                </h2>
                <p className="text-zinc-400 text-xs">Your focus for today</p>
              </div>
            </div>
            <Link href="/tasks" className="skeuo-chip hover:bg-green-500/20 transition-colors flex-shrink-0">
              <span className="text-xs font-medium">All tasks →</span>
            </Link>
          </div>
          
          {data?.todayTasks && data.todayTasks.length > 0 ? (
            <div className="space-y-2.5">
              {data.todayTasks.slice(0, 5).map((task, index) => (
                <div 
                  key={task.id} 
                  className="skeuo-card p-3 flex items-center gap-3 hover:bg-white/5 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    task.completed 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                      : 'bg-zinc-800 group-hover:bg-zinc-700'
                  }`}>
                    {task.completed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={`text-xs flex-grow transition-all ${
                    task.completed 
                      ? 'text-zinc-500 line-through' 
                      : 'text-zinc-300 group-hover:text-white'
                  }`}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <div className="skeuo-badge bg-gradient-to-r from-green-500 to-emerald-400 px-1.5 py-0.5 flex-shrink-0">
                      <span className="text-[9px] font-bold">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="skeuo-avatar w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                No tasks yet.<br />Create your first task to get started!
              </p>
              <Link 
                href="/tasks"
                className="skeuo-chip inline-flex items-center gap-2 hover:bg-green-500/20 transition-colors"
              >
                <span className="text-xs font-medium">+ Create Task</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
