'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Target, Zap, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';

interface AnalyticsData {
  totalFocusMinutes: number;
  avgSessionMinutes: number;
  totalSessions: number;
  dailyBreakdown: { date: string; minutes: number }[];
  focusByTimeOfDay: { hour: number; percentage: number }[];
  streak: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const weekStartDate = monday.toISOString().split('T')[0];

      const res = await fetch(`/api/analytics/weekly?weekStartDate=${weekStartDate}`);
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

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <div className="h-10 w-64 bg-[var(--surface)] rounded-lg animate-pulse mb-3"></div>
          <div className="h-5 w-96 bg-[var(--surface)] rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--surface)] rounded-2xl p-6 h-40 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const maxDaily = Math.max(...(analytics?.dailyBreakdown.map(d => d.minutes) || [1]), 1);
  const maxHourly = Math.max(...(analytics?.focusByTimeOfDay.map(d => d.percentage) || [1]), 1);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep insights into your productivity patterns and focus trends"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Focus Time"
          value={formatTime(analytics?.totalFocusMinutes || 0)}
          subtitle={`${analytics?.totalSessions || 0} sessions completed`}
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Average Session"
          value={formatTime(analytics?.avgSessionMinutes || 0)}
          subtitle="Per session"
          icon={Target}
          color="emerald"
        />
        <StatCard
          title="Peak Hours"
          value={getPeakHour()}
          subtitle="Most productive time"
          icon={TrendingUp}
          color="orange"
        />
        <StatCard
          title="Current Streak"
          value={`${analytics?.streak || 0}d`}
          subtitle="Keep it going!"
          icon={Zap}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Breakdown */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Weekly Breakdown</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Focus time by day
              </p>
            </div>
            <Calendar className="w-5 h-5 text-[var(--text-tertiary)]" />
          </div>

          <div className="flex items-end justify-between gap-3 h-64 px-2">
            {analytics?.dailyBreakdown && analytics.dailyBreakdown.length > 0 ? (
              analytics.dailyBreakdown.map((day, i) => {
                const heightPercent = (day.minutes / maxDaily) * 100;
                const isHovered = hoveredDay === i;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-3 group"
                    onMouseEnter={() => setHoveredDay(i)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="relative w-full">
                      {isHovered && (
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-2 rounded-xl shadow-xl z-10 whitespace-nowrap">
                          <div className="text-xs text-[var(--text-secondary)] mb-0.5">{getDayLabel(i)}</div>
                          <div className="text-sm font-bold">{formatTime(day.minutes)}</div>
                        </div>
                      )}

                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                        style={{
                          height: `${Math.max(heightPercent, 4)}%`,
                          opacity: isHovered ? 1 : 0.8,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium transition-colors ${isHovered ? 'text-white' : 'text-[var(--text-tertiary)]'}`}>
                      {getDayLabel(i)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Time of Day */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Focus by Hour</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Productivity throughout the day
              </p>
            </div>
            <Clock className="w-5 h-5 text-[var(--text-tertiary)]" />
          </div>

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
                    className="flex-1 flex flex-col items-center gap-2 group"
                    onMouseEnter={() => setHoveredHour(i)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    <div className="relative w-full">
                      {isHovered && (
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[var(--surface-elevated)] border border-[var(--border)] px-3 py-2 rounded-xl shadow-xl z-10 whitespace-nowrap">
                          <div className="text-xs text-[var(--text-secondary)] mb-0.5">{hourLabel}</div>
                          <div className="text-sm font-bold">{item.percentage.toFixed(0)}%</div>
                        </div>
                      )}

                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all duration-300 cursor-pointer"
                        style={{
                          height: `${Math.max(heightPercent, 4)}%`,
                          opacity: isHovered ? 1 : 0.7,
                        }}
                      ></div>
                    </div>
                    {i % 3 === 0 && (
                      <span className="text-[10px] text-[var(--text-tertiary)]">{hourLabel}</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Productivity Insights</h3>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              {analytics?.streak && analytics.streak > 0 ? (
                <p>
                  You&apos;ve maintained a {analytics.streak}-day streak. Consistency is building your focus muscle.
                </p>
              ) : (
                <p>Start your focus journey today and build a streak!</p>
              )}
              {analytics?.totalFocusMinutes && analytics.totalFocusMinutes > 0 && (
                <p>
                  Your peak productivity is around {getPeakHour()}. Schedule deep work during these hours for maximum impact.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
