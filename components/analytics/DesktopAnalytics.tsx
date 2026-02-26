'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Zap } from 'lucide-react';

/**
 * Desktop Analytics Component
 * 
 * Reusable analytics component that fetches data from Tauri commands
 * for the desktop app. Can be integrated into the main analytics page.
 * 
 * Features:
 * - Time range selector (daily/weekly/monthly)
 * - Application usage charts
 * - Productivity score visualization
 * - Focus session history and trends
 * 
 * Requirements: 8.1, 8.2, 8.5
 * Task: 12.3
 */

interface ApplicationUsage {
  application: string;
  total_duration: number;
  category: string | null;
  percentage: number;
}

interface DailyStats {
  date: string;
  total_duration: number;
  productive_duration: number;
  neutral_duration: number;
  distracting_duration: number;
  productivity_score: number;
  top_applications: ApplicationUsage[];
}

interface WeeklyStats {
  week_start: string;
  week_end: string;
  total_duration: number;
  productive_duration: number;
  neutral_duration: number;
  distracting_duration: number;
  productivity_score: number;
  daily_breakdown: DailyStats[];
  top_applications: ApplicationUsage[];
}

interface SessionTrendPoint {
  date: string;
  avg_duration: number;
  avg_productivity_score: number;
  session_count: number;
}

type TimeRange = 'today' | 'week' | 'month';

interface DesktopAnalyticsProps {
  className?: string;
}

export function DesktopAnalytics({ className = '' }: DesktopAnalyticsProps) {
  const [tauriInvoke, setTauriInvoke] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics data
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [sessionTrends, setSessionTrends] = useState<SessionTrendPoint[]>([]);
  const [topApplications, setTopApplications] = useState<ApplicationUsage[]>([]);

  useEffect(() => {
    const initTauri = async () => {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        try {
          const { invoke } = await import('@tauri-apps/api/tauri');
          setTauriInvoke(() => invoke);
        } catch (e) {
          setError('Failed to initialize Tauri');
        }
      }
    };

    initTauri();
  }, []);

  useEffect(() => {
    if (tauriInvoke) {
      fetchAnalytics();
    }
  }, [tauriInvoke, timeRange]);

  const fetchAnalytics = async () => {
    if (!tauriInvoke) return;

    setLoading(true);
    setError(null);

    try {
      let startTime: number, endTime: number;

      // Get time range
      if (timeRange === 'today') {
        [startTime, endTime] = await tauriInvoke('get_time_range_today');
      } else if (timeRange === 'week') {
        [startTime, endTime] = await tauriInvoke('get_time_range_this_week');
      } else {
        [startTime, endTime] = await tauriInvoke('get_time_range_this_month');
      }

      // Fetch analytics data based on time range
      if (timeRange === 'today') {
        const stats = await tauriInvoke('get_analytics_daily_stats', {
          startTime,
          endTime,
        });
        setDailyStats(stats);
        setTopApplications(stats.top_applications || []);
      } else if (timeRange === 'week') {
        const stats = await tauriInvoke('get_analytics_weekly_stats', {
          startTime,
          endTime,
        });
        setWeeklyStats(stats);
        setTopApplications(stats.top_applications || []);
      } else {
        // For monthly, we'll use weekly stats for now
        const stats = await tauriInvoke('get_analytics_weekly_stats', {
          startTime,
          endTime,
        });
        setWeeklyStats(stats);
        setTopApplications(stats.top_applications || []);
      }

      // Fetch session trends
      const trends = await tauriInvoke('generate_session_trends', {
        startTime,
        endTime,
      });
      setSessionTrends(trends || []);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCategoryColor = (category: string | null): string => {
    switch (category) {
      case 'Productive':
        return 'bg-green-500';
      case 'Neutral':
        return 'bg-blue-500';
      case 'Distracting':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const stats = timeRange === 'today' ? dailyStats : weeklyStats;
  const productivityScore = stats?.productivity_score || 0;
  const totalDuration = stats?.total_duration || 0;
  const productiveDuration = stats?.productive_duration || 0;
  const distractingDuration = stats?.distracting_duration || 0;

  return (
    <div className={className}>
      {/* Time Range Selector */}
      <div className="mb-8 flex gap-3">
        <button
          onClick={() => setTimeRange('today')}
          className={`skeuo-button px-6 py-3 font-medium transition-all ${timeRange === 'today'
            ? 'text-white shadow-lg'
            : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 !shadow-none'
            }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeRange('week')}
          className={`skeuo-button px-6 py-3 font-medium transition-all ${timeRange === 'week'
            ? 'text-white shadow-lg'
            : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 !shadow-none'
            }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`skeuo-button px-6 py-3 font-medium transition-all ${timeRange === 'month'
            ? 'text-white shadow-lg'
            : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 !shadow-none'
            }`}
        >
          This Month
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading analytics...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="skeuo-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider">TOTAL TIME</span>
              </div>
              <div className="text-4xl font-bold text-white embossed-text tracking-tight mt-2">
                {formatDuration(totalDuration)}
              </div>
            </div>

            <div className="skeuo-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider">PRODUCTIVITY</span>
              </div>
              <div className="text-4xl font-bold text-white embossed-text tracking-tight mt-2">
                {productivityScore.toFixed(0)}%
              </div>
            </div>

            <div className="skeuo-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider">PRODUCTIVE</span>
              </div>
              <div className="text-4xl font-bold text-white embossed-text tracking-tight mt-2">
                {formatDuration(productiveDuration)}
              </div>
            </div>

            <div className="skeuo-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider">DISTRACTIONS</span>
              </div>
              <div className="text-4xl font-bold text-white embossed-text tracking-tight mt-2">
                {formatDuration(distractingDuration)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Application Usage Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="font-medium text-white mb-6">Top Applications</h2>
              <div className="space-y-3">
                {topApplications.slice(0, 10).map((app, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {app.application}
                        </span>
                        <span className="text-sm text-zinc-400">
                          {formatDuration(app.total_duration)}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCategoryColor(app.category)}`}
                          style={{ width: `${app.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {topApplications.length === 0 && (
                  <p className="text-zinc-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>

            {/* Daily Breakdown Chart (for weekly view) */}
            {timeRange === 'week' && weeklyStats?.daily_breakdown && (
              <div className="skeuo-panel p-8">
                <h2 className="font-bold text-xl text-white mb-8 embossed-text">Daily Breakdown</h2>
                <div className="flex items-end justify-between gap-2 h-64">
                  {weeklyStats.daily_breakdown.map((day, index) => {
                    const maxDuration = Math.max(
                      ...weeklyStats.daily_breakdown.map((d) => d.total_duration),
                      1
                    );
                    const heightPercent = (day.total_duration / maxDuration) * 100;
                    const dayName = new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                    });

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full group">
                          <div
                            className="w-full bg-blue-600 rounded-t-lg transition-opacity hover:opacity-80 cursor-pointer"
                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              <div className="font-semibold">{formatDuration(day.total_duration)}</div>
                              <div className="text-zinc-300">
                                {(day.productivity_score || 0).toFixed(0)}% productive
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-zinc-500 font-medium">{dayName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time Distribution (for today view) */}
            {timeRange === 'today' && dailyStats && (
              <div className="skeuo-panel p-8">
                <h2 className="font-bold text-xl text-white mb-8 embossed-text">Time Distribution</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-zinc-300">Productive</span>
                      <span className="text-base font-bold text-zinc-400 embossed-text">
                        {formatDuration(dailyStats.productive_duration)}
                      </span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-3 skeuo-input border-0">
                      <div
                        className="h-3 rounded-full bg-green-500"
                        style={{
                          width: `${totalDuration > 0
                            ? (dailyStats.productive_duration / totalDuration) * 100
                            : 0
                            }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-zinc-300">Neutral</span>
                      <span className="text-base font-bold text-zinc-400 embossed-text">
                        {formatDuration(dailyStats.neutral_duration)}
                      </span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-3 skeuo-input border-0">
                      <div
                        className="h-3 rounded-full bg-blue-500"
                        style={{
                          width: `${totalDuration > 0
                            ? (dailyStats.neutral_duration / totalDuration) * 100
                            : 0
                            }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-zinc-300">Distracting</span>
                      <span className="text-base font-bold text-zinc-400 embossed-text">
                        {formatDuration(dailyStats.distracting_duration)}
                      </span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-3 skeuo-input border-0">
                      <div
                        className="h-3 rounded-full bg-red-500"
                        style={{
                          width: `${totalDuration > 0
                            ? (dailyStats.distracting_duration / totalDuration) * 100
                            : 0
                            }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Focus Session Trends */}
          {sessionTrends.length > 0 && (
            <div className="skeuo-panel p-8 mb-8">
              <h2 className="font-bold text-xl text-white mb-8 embossed-text">Focus Session Trends</h2>
              <div className="flex items-end justify-between gap-2 h-48">
                {sessionTrends.map((trend, index) => {
                  const maxScore = Math.max(
                    ...sessionTrends.map((t) => t.avg_productivity_score),
                    1
                  );
                  const heightPercent = (trend.avg_productivity_score / maxScore) * 100;
                  const date = new Date(trend.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full group">
                        <div
                          className="w-full bg-purple-600 rounded-t-lg transition-opacity hover:opacity-80 cursor-pointer"
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            <div className="font-semibold">
                              {(trend.avg_productivity_score || 0).toFixed(0)}% avg score
                            </div>
                            <div className="text-zinc-300">
                              {trend.session_count} sessions
                            </div>
                            <div className="text-zinc-300">
                              {formatDuration(trend.avg_duration)} avg
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500 font-medium">{date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
