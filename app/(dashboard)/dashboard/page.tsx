'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Loader2 } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-zinc-400 text-sm">Track your focus and productivity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">TODAY</div>
          <div className="text-2xl font-bold">{data?.todayFocusHours || 0}h</div>
          <div className="text-zinc-500 text-xs">Focus time</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">TODAY</div>
          <div className="text-2xl font-bold">{data?.todayTasksCompleted || 0}</div>
          <div className="text-zinc-500 text-xs">Tasks done</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">STREAK</div>
          <div className="text-2xl font-bold">{data?.currentStreak || 0}</div>
          <div className="text-zinc-500 text-xs">Days</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">TODAY</div>
          <div className="text-2xl font-bold">{data?.todayDistractions || 0}</div>
          <div className="text-zinc-500 text-xs">Distractions</div>
        </div>
      </div>

      {!hasData && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center mb-8">
          <h2 className="text-lg font-medium mb-2">Start your first focus session</h2>
          <p className="text-zinc-400 text-sm mb-4">Track your productivity and build better work habits</p>
          <Link 
            href="/focus"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Focus Session
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium">This Week</h2>
            <Link href="/analytics" className="text-xs text-zinc-400 hover:text-zinc-300">
              View analytics →
            </Link>
          </div>
          <div className="flex items-end gap-2 h-32">
            {data?.weeklyFocus.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-blue-600 rounded-sm"
                  style={{ height: `${(d.hours / maxHours) * 100}%`, minHeight: d.hours > 0 ? '4px' : '0' }}
                />
                <span className="text-[10px] text-zinc-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Today</h2>
            <Link href="/tasks" className="text-xs text-zinc-400 hover:text-zinc-300">
              All tasks →
            </Link>
          </div>
          {data?.todayTasks && data.todayTasks.length > 0 ? (
            <div className="space-y-2">
              {data.todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-start gap-2 text-sm">
                  <div className={`w-4 h-4 rounded border mt-0.5 flex-shrink-0 ${
                    task.completed ? 'bg-blue-600 border-blue-600' : 'border-zinc-700'
                  }`} />
                  <span className={task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm mb-3">No tasks yet</p>
              <Link 
                href="/tasks"
                className="text-xs text-blue-500 hover:text-blue-400"
              >
                Create your first task
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
