'use client';

import { DashboardMetrics } from '@/lib/analytics';
import { MetricsCard } from './MetricsCard';

interface MetricsGridProps {
  analytics: DashboardMetrics;
}

/**
 * MetricsGrid Component
 * 
 * Displays a grid of metric cards showing today's productivity stats
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function MetricsGrid({ analytics }: MetricsGridProps) {
  const focusHours = (analytics.todayFocusMinutes / 60).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricsCard
        label="Focus Hours Today"
        value={focusHours}
        unit="hrs"
        gradient="from-blue-600 to-blue-400"
      />
      
      <MetricsCard
        label="Tasks Completed"
        value={analytics.todayTasksCompleted.toString()}
        unit="tasks"
        gradient="from-cyan-600 to-cyan-400"
      />
      
      <MetricsCard
        label="Active Streak"
        value={analytics.activeStreakDays.toString()}
        unit="days"
        gradient="from-purple-600 to-purple-400"
      />
      
      <MetricsCard
        label="Distractions"
        value={analytics.todayDistractions.toString()}
        unit="logged"
        gradient="from-indigo-600 to-indigo-400"
      />
    </div>
  );
}
