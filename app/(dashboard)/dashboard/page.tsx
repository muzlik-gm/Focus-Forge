'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Loader2, Clock, CheckCircle2, Flame, AlertCircle, Target, FileText } from 'lucide-react';
import { get } from '@/lib/api-client';

interface DashboardData {
  todayFocusHours: number;
  todayTasksCompleted: number;
  currentStreak: number;
  todayDistractions: number;
  weeklyFocus: { day: string; hours: number }[];
  todayTasks: { id: string; title: string; completed: boolean }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/api/analytics/dashboard')
      .then(res => res.ok ? res.json() : null)
      .then(d => {
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
  }, []);

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
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Dashboard</h1>
        <p className="text-zinc-300 text-lg">Track your focus and productivity in our tactile interface</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="skeuo-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="skeuo-badge">TODAY</div>
          </div>
          <div className="text-3xl font-bold mb-1 embossed-text">{data?.todayFocusHours || 0}h</div>
          <div className="text-zinc-400 text-sm">Focus time</div>
          <div className="skeuo-progress mt-4">
            <div className="skeuo-progress-bar" style={{ width: `${Math.min((data?.todayFocusHours || 0) * 10, 100)}%` }} />
          </div>
        </div>
        
        <div className="skeuo-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="skeuo-badge">TODAY</div>
          </div>
          <div className="text-3xl font-bold mb-1 embossed-text">{data?.todayTasksCompleted || 0}</div>
          <div className="text-zinc-400 text-sm">Tasks completed</div>
          <div className="skeuo-progress mt-4">
            <div className="skeuo-progress-bar" style={{ width: `${Math.min((data?.todayTasksCompleted || 0) * 20, 100)}%` }} />
          </div>
        </div>
        
        <div className="skeuo-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="skeuo-badge">STREAK</div>
          </div>
          <div className="text-3xl font-bold mb-1 embossed-text">{data?.currentStreak || 0}</div>
          <div className="text-zinc-400 text-sm">Day streak</div>
          <div className="skeuo-progress mt-4">
            <div className="skeuo-progress-bar" style={{ width: `${Math.min((data?.currentStreak || 0) * 10, 100)}%` }} />
          </div>
        </div>
        
        <div className="skeuo-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="skeuo-badge">TODAY</div>
          </div>
          <div className="text-3xl font-bold mb-1 embossed-text">{data?.todayDistractions || 0}</div>
          <div className="text-zinc-400 text-sm">Distractions</div>
          <div className="skeuo-progress mt-4">
            <div className="skeuo-progress-bar" style={{ width: `${Math.min((data?.todayDistractions || 0) * 20, 100)}%` }} />
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="skeuo-panel p-10 text-center mb-10">
          <div className="skeuo-avatar w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 embossed-text">Start your first focus session</h2>
          <p className="text-zinc-300 text-lg mb-6 max-w-md mx-auto">Track your productivity and build better work habits with our tactile interface</p>
          <Link 
            href="/focus"
            className="skeuo-button inline-flex items-center gap-3 px-8 py-4 text-white font-medium text-lg"
          >
            <Play className="w-5 h-5" />
            <span>Start Focus Session</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        {/* Weekly Chart */}
        <div className="col-span-2 skeuo-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold mb-1 embossed-text">Weekly Focus Hours</h2>
              <p className="text-zinc-400 text-sm">Hours logged per day this week</p>
            </div>
            <Link href="/analytics" className="skeuo-chip">
              <span className="text-sm">View analytics →</span>
            </Link>
          </div>
          <div className="flex items-end gap-3 h-48">
            {data?.weeklyFocus.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="relative w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600/30 to-blue-500/50 rounded-t-xl relative overflow-hidden transition-all duration-300 group-hover:from-blue-500/40 group-hover:to-blue-400/60"
                    style={{ height: `${(d.hours / maxHours) * 100}%`, minHeight: d.hours > 0 ? '8px' : '0' }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {d.day}
                  </div>
                </div>
                <div className="text-xs text-zinc-400 mt-8">{d.hours}h</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="skeuo-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold mb-1 embossed-text">Today's Tasks</h2>
              <p className="text-zinc-400 text-sm">Your tasks for today</p>
            </div>
            <Link href="/tasks" className="skeuo-chip">
              <span className="text-sm">All tasks →</span>
            </Link>
          </div>
          {data?.todayTasks && data.todayTasks.length > 0 ? (
            <div className="space-y-3">
              {data.todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="skeuo-card p-4 flex items-center gap-3">
                  <div className={`skeuo-toggle ${task.completed ? 'active' : ''}`} />
                  <span className={`text-sm flex-grow ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <div className="skeuo-badge bg-gradient-to-r from-green-500 to-emerald-400">
                      <span className="text-xs">Done</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="skeuo-avatar w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-400 text-sm mb-4">No tasks yet</p>
              <Link 
                href="/tasks"
                className="skeuo-chip inline-block"
              >
                <span className="text-sm">Create your first task</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
