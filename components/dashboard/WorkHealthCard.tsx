'use client';

import { AlertTriangle, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { WorkHealthMetrics, getHealthStatusIcon } from '@/lib/work-health';

interface WorkHealthCardProps {
  health: WorkHealthMetrics;
}

export function WorkHealthCard({ health }: WorkHealthCardProps) {
  const getStatusIcon = () => {
    switch (health.status) {
      case 'excellent':
        return <Sparkles className="w-5 h-5 text-blue-400" />;
      case 'healthy':
        return <Heart className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <TrendingUp className="w-5 h-5 text-orange-400" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusBgColor = () => {
    switch (health.status) {
      case 'excellent':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'healthy':
        return 'bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'danger':
        return 'bg-red-500/10 border-red-500/20';
    }
  };

  const getProgressBarColor = () => {
    switch (health.status) {
      case 'excellent':
        return 'bg-blue-500';
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      case 'danger':
        return 'bg-red-500';
    }
  };

  // Calculate progress percentage (max 12 hours for display)
  const todayProgress = Math.min((health.todayHours / 12) * 100, 100);
  const weekProgress = Math.min((health.weekHours / 60) * 100, 100);

  return (
    <div className={`skeuo-panel p-5 border-2 ${getStatusBgColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="skeuo-avatar w-9 h-9 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-base font-bold embossed-text">Work Health</h3>
            <p className="text-xs text-zinc-400">Based on research data</p>
          </div>
        </div>
        <span className="text-2xl">{getHealthStatusIcon(health.status)}</span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-white mb-2">{health.message}</p>
      </div>

      {/* Today's Hours */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">Today</span>
          <span className="text-xs font-bold text-white">{health.todayHours.toFixed(1)}h</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-500`}
            style={{ width: `${todayProgress}%` }}
          />
        </div>
      </div>

      {/* This Week */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">This Week</span>
          <span className="text-xs font-bold text-white">{health.weekHours.toFixed(1)}h</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-500`}
            style={{ width: `${weekProgress}%` }}
          />
        </div>
      </div>

      {/* Deep Focus Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="skeuo-card p-2">
          <div className="text-xs text-zinc-400 mb-0.5">Deep Focus Today</div>
          <div className="text-base font-bold embossed-text">{health.deepFocusToday.toFixed(1)}h</div>
        </div>
        <div className="skeuo-card p-2">
          <div className="text-xs text-zinc-400 mb-0.5">Focus This Week</div>
          <div className="text-base font-bold embossed-text">{health.deepFocusWeek.toFixed(1)}h</div>
        </div>
      </div>

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <div className="space-y-1.5">
          {health.recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 bg-black/20 p-2 rounded-lg">
              <span className="text-zinc-500 mt-0.5">•</span>
              <span className="flex-1">{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
