'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Zap, Calendar } from 'lucide-react';

/**
 * Desktop Analytics Page
 * 
 * Displays analytics and reports using Tauri commands to fetch data from
 * the local SQLite database. Features:
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

export default function DesktopAnalyticsPage() {
  const [isDesktop, setIsDesktop] = useState(false);
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
          setIsDesktop(true);
        } catch (e) {
          setError('Failed to initialize Tauri');
        }
      } else {
        setError('This page only works in the desktop app');
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

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Desktop Only</h1>
          <p className="text-gray-600">This page only works in the desktop app.</p>
        </div>
      </div>
    );
  }

  const stats = timeRange === 'today' ? dailyStats : weeklyStats;
  const productivityScore = stats?.productivity_score || 0;
  const totalDuration = stats?.total_duration || 0;
  const productiveDuration = stats?.productive_duration || 0;
  const distractingDuration = stats?.distracting_duration || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Track your productivity and application usage</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            This Month
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Total Time</span>
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(totalDuration)}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Productivity Score</span>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {productivityScore.toFixed(0)}%
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Productive Time</span>
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(productiveDuration)}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Distractions</span>
                  <BarChart3 className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(distractingDuration)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Application Usage Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Applications
                </h2>
                <div className="space-y-3">
                  {topApplications.slice(0, 10).map((app, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {app.application}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatDuration(app.total_duration)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getCategoryColor(app.category)}`}
                            style={{ width: `${app.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {topApplications.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No data available</p>
                  )}
                </div>
              </div>

              {/* Daily Breakdown Chart (for weekly view) */}
              {timeRange === 'week' && weeklyStats?.daily_breakdown && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Daily Breakdown
                  </h2>
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
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                <div className="font-semibold">{formatDuration(day.total_duration)}</div>
                                <div className="text-gray-300">
                                  {day.productivity_score.toFixed(0)}% productive
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{dayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Productivity Score Visualization */}
              {timeRange === 'today' && dailyStats && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Time Distribution
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Productive</span>
                        <span className="text-sm text-gray-600">
                          {formatDuration(dailyStats.productive_duration)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-green-500"
                          style={{
                            width: `${
                              totalDuration > 0
                                ? (dailyStats.productive_duration / totalDuration) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Neutral</span>
                        <span className="text-sm text-gray-600">
                          {formatDuration(dailyStats.neutral_duration)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-blue-500"
                          style={{
                            width: `${
                              totalDuration > 0
                                ? (dailyStats.neutral_duration / totalDuration) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Distracting</span>
                        <span className="text-sm text-gray-600">
                          {formatDuration(dailyStats.distracting_duration)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-red-500"
                          style={{
                            width: `${
                              totalDuration > 0
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
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Focus Session Trends
                </h2>
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
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              <div className="font-semibold">
                                {trend.avg_productivity_score.toFixed(0)}% avg score
                              </div>
                              <div className="text-gray-300">
                                {trend.session_count} sessions
                              </div>
                              <div className="text-gray-300">
                                {formatDuration(trend.avg_duration)} avg
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
