'use client';

import { useState, useEffect } from 'react';
import { TimeRangeSelector } from './TimeRangeSelector';
import { WeeklyFocusGraph } from './WeeklyFocusGraph';
import { MonthlyComparisonChart } from './MonthlyComparisonChart';
import { DistractionHeatmap } from './DistractionHeatmap';
import { FocusByTimeOfDay } from './FocusByTimeOfDay';
import { InsightsBox } from './InsightsBox';

export type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface WeeklyAnalytics {
  totalFocusMinutes: number;
  dailyBreakdown: { date: string; minutes: number }[];
  distractionHeatmap: { day: string; hour: number; count: number }[];
  focusByTimeOfDay: { hour: number; minutes: number }[];
}

interface MonthlyAnalytics {
  currentMonth: { date: string; minutes: number }[];
  previousMonth: { date: string; minutes: number }[];
  totalCurrentMonth: number;
  totalPreviousMonth: number;
}

/**
 * AnalyticsView Component
 * 
 * Main analytics view with time range selection and multiple visualizations
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 50
 */
export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalytics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      if (timeRange === 'week' || timeRange === 'custom') {
        // Fetch weekly analytics
        const weekStart = getWeekStartDate();
        const response = await fetch(`/api/analytics/weekly?weekStartDate=${weekStart.toISOString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weekly analytics');
        }
        
        const data = await response.json();
        setWeeklyData(data);
      }

      if (timeRange === 'month' || timeRange === 'quarter' || timeRange === 'year') {
        // Fetch monthly analytics
        const month = getCurrentMonth();
        const response = await fetch(`/api/analytics/monthly?month=${month}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch monthly analytics');
        }
        
        const data = await response.json();
        setMonthlyData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data based on selected time range
  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, customStartDate, customEndDate]);

  const getWeekStartDate = (): Date => {
    if (timeRange === 'custom' && customStartDate) {
      return new Date(customStartDate);
    }

    // Get Monday of current week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-900/20 border border-red-800 p-6">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <TimeRangeSelector
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={setCustomStartDate}
        onCustomEndDateChange={setCustomEndDate}
      />

      {/* AI Insights Box */}
      <InsightsBox />

      {/* Weekly View */}
      {timeRange === 'week' && weeklyData && (
        <>
          {/* Weekly Focus Graph */}
          <WeeklyFocusGraph data={weeklyData.dailyBreakdown} />

          {/* Focus by Time of Day */}
          <FocusByTimeOfDay data={weeklyData.focusByTimeOfDay} />

          {/* Distraction Heatmap */}
          <DistractionHeatmap data={weeklyData.distractionHeatmap} />
        </>
      )}

      {/* Monthly View */}
      {(timeRange === 'month' || timeRange === 'quarter' || timeRange === 'year') && monthlyData && (
        <>
          {/* Monthly Comparison Chart */}
          <MonthlyComparisonChart
            currentMonth={monthlyData.currentMonth}
            previousMonth={monthlyData.previousMonth}
            totalCurrent={monthlyData.totalCurrentMonth}
            totalPrevious={monthlyData.totalPreviousMonth}
          />
        </>
      )}

      {/* Custom Range View */}
      {timeRange === 'custom' && weeklyData && (
        <>
          <WeeklyFocusGraph data={weeklyData.dailyBreakdown} />
          <FocusByTimeOfDay data={weeklyData.focusByTimeOfDay} />
          <DistractionHeatmap data={weeklyData.distractionHeatmap} />
        </>
      )}
    </div>
  );
}
