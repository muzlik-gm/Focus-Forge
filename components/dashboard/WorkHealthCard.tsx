'use client';

import { AlertTriangle, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { WorkHealthMetrics } from '@/lib/work-health';

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
    <div className="skeuo-panel p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="skeuo-icon-container w-10 h-10">
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-0.5">Work Health</h3>
            <p className="text-xs text-zinc-500 font-medium">Based on research data</p>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          {health.message}
        </p>
      </div>

      {/* Today's Hours */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-400">Today</span>
          <span className="text-sm font-bold text-white">{health.todayHours.toFixed(1)}h</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-500`}
            style={{ width: `${todayProgress}%` }}
          />
        </div>
      </div>

      {/* This Week */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-400">This Week</span>
          <span className="text-sm font-black text-white">{health.weekHours.toFixed(1)}h</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-500`}
            style={{ width: `${weekProgress}%` }}
          />
        </div>
      </div>

      {/* Deep Focus Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="skeuo-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 mb-1">Deep Focus Today</div>
          <div className="text-xl font-bold text-white tracking-tight">{(health.deepFocusToday || 0).toFixed(1)}h</div>
        </div>
        <div className="skeuo-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 mb-1">Focus This Week</div>
          <div className="text-xl font-bold text-white tracking-tight">{(health.deepFocusWeek || 0).toFixed(1)}h</div>
        </div>
      </div>

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <div className="space-y-2">
          {health.recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-medium text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
              <span className="flex-1">{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
