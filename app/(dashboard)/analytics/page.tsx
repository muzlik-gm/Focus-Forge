'use client';

import { useState, useEffect } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { get } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { DesktopAnalytics } from '@/components/analytics/DesktopAnalytics';

interface AnalyticsData {
  totalFocusMinutes: number;
  avgSessionMinutes: number;
  totalSessions: number;
  dailyBreakdown: { date: string; minutes: number }[];
  focusByTimeOfDay: { hour: number; percentage: number }[];
  streak: number;
}

export default function AnalyticsPage() {
  const { isDesktop } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  useEffect(() => {
    // Only fetch web analytics if not in desktop mode
    if (!isDesktop) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [isDesktop]);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const weekStartDate = monday.toISOString().split('T')[0];

      const res = await get(`/api/analytics/weekly?weekStartDate=${weekStartDate}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics({
          totalFocusMinutes: data.totalFocusMinutes || 0,
          avgSessionMinutes: data.avgSessionMinutes || 0,
          totalSessions: data.totalSessions || 0,
          dailyBreakdown: data.dailyBreakdown || [],
          focusByTimeOfDay: data.focusByTimeOfDay || [],
          streak: data.streak || 0,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPeakHour = () => {
    if (!analytics?.focusByTimeOfDay.length) return 'N/A';
    const sorted = [...analytics.focusByTimeOfDay].sort((a, b) => b.percentage - a.percentage);
    const hour = sorted[0]?.hour || 0;
    if (hour === 0) return '12am';
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return '12pm';
    return `${hour - 12}pm`;
  };

  const getDayLabel = (index: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[index] || '';
  };

  // If running in desktop app, use desktop analytics component
  if (isDesktop) {
    return (
      <div className="w-full max-w-7xl mx-auto p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Analytics</h1>
          <p className="text-zinc-300 text-lg">Desktop app analytics with local data tracking</p>
        </div>
        <DesktopAnalytics />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
        </div>
      </div>
    );
  }

  const maxDaily = Math.max(...(analytics?.dailyBreakdown.map(d => d.minutes) || [1]), 1);
  const maxHourly = Math.max(...(analytics?.focusByTimeOfDay.map(d => d.percentage) || [1]), 1);

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Analytics</h1>
        <p className="text-zinc-300 text-lg">Understand your productivity patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="skeuo-panel p-6">
          <div className="text-zinc-400 text-xs font-medium mb-3">TOTAL FOCUS</div>
          <div className="text-3xl font-bold mb-2 embossed-text tracking-tight">{formatTime(analytics?.totalFocusMinutes || 0)}</div>
          <div className="text-zinc-500 text-sm font-medium">{analytics?.totalSessions || 0} sessions</div>
        </div>
        <div className="skeuo-panel p-6">
          <div className="text-zinc-400 text-xs font-medium mb-3">AVG SESSION</div>
          <div className="text-3xl font-bold mb-2 embossed-text tracking-tight">{formatTime(analytics?.avgSessionMinutes || 0)}</div>
          <div className="text-zinc-500 text-sm font-medium">Per session</div>
        </div>
        <div className="skeuo-panel p-6">
          <div className="text-zinc-400 text-xs font-medium mb-3">PEAK HOUR</div>
          <div className="text-3xl font-bold mb-2 embossed-text tracking-tight">{getPeakHour()}</div>
          <div className="text-zinc-500 text-sm font-medium">Most productive</div>
        </div>
        <div className="skeuo-panel p-6">
          <div className="text-zinc-400 text-xs font-medium mb-3">STREAK</div>
          <div className="text-3xl font-bold mb-2 embossed-text tracking-tight">{analytics?.streak || 0}d</div>
          <div className="text-zinc-500 text-sm font-medium">Keep it going</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="skeuo-panel p-8">
          <h2 className="text-xl font-bold mb-8 embossed-text">Weekly Breakdown</h2>
          <div className="flex items-end justify-between gap-3 h-64 px-2">
            {analytics?.dailyBreakdown && analytics.dailyBreakdown.length > 0 ? (
              analytics.dailyBreakdown.map((day, i) => {
                const heightPercent = (day.minutes / maxDaily) * 100;
                const isHovered = hoveredDay === i;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-3"
                    onMouseEnter={() => setHoveredDay(i)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="relative w-full">
                      {isHovered && (
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-lg shadow-xl z-10 whitespace-nowrap">
                          <div className="text-xs text-zinc-400 mb-0.5">{getDayLabel(i)}</div>
                          <div className="text-sm font-bold">{formatTime(day.minutes)}</div>
                        </div>
                      )}
                      <div
                        className="w-full bg-blue-600 rounded-t-lg transition-opacity cursor-pointer"
                        style={{
                          height: `${Math.max(heightPercent, 4)}%`,
                          opacity: isHovered ? 1 : 0.8,
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{getDayLabel(i)}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="skeuo-panel p-8">
          <h2 className="text-xl font-bold mb-8 embossed-text">Focus by Hour</h2>
          <div className="flex items-end justify-between gap-1 h-64">
            {analytics?.focusByTimeOfDay && analytics.focusByTimeOfDay.length > 0 ? (
              analytics.focusByTimeOfDay.map((item, i) => {
                const heightPercent = (item.percentage / maxHourly) * 100;
                const isHovered = hoveredHour === i;
                const hour = item.hour;
                const hourLabel = hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                    onMouseEnter={() => setHoveredHour(i)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    <div className="relative w-full">
                      {isHovered && (
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-lg shadow-xl z-10 whitespace-nowrap">
                          <div className="text-xs text-zinc-400 mb-0.5">{hourLabel}</div>
                          <div className="text-sm font-bold">{item.percentage.toFixed(0)}%</div>
                        </div>
                      )}
                      <div
                        className="w-full bg-blue-600 rounded-t-md transition-opacity cursor-pointer"
                        style={{
                          height: `${Math.max(heightPercent, 4)}%`,
                          opacity: isHovered ? 1 : 0.7,
                        }}
                      />
                    </div>
                    {i % 3 === 0 && (
                      <span className="text-[10px] text-zinc-500">{hourLabel}</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="skeuo-panel p-8">
        <div className="flex items-start gap-5">
          <div className="skeuo-avatar w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 mt-1">
            <h3 className="text-xl font-bold mb-3 embossed-text">Insights</h3>
            <div className="space-y-3 text-base text-zinc-300">
              {analytics?.streak && analytics.streak > 0 ? (
                <p>{analytics.streak}-day streak maintained</p>
              ) : (
                <p>Start your focus journey today</p>
              )}
              {analytics?.totalFocusMinutes && analytics.totalFocusMinutes > 0 && (
                <p>Peak productivity around <strong className="text-white">{getPeakHour()}</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
