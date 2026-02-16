import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'orange' | 'rose' | 'blue';
  trend?: {
    value: string;
    positive: boolean;
  };
}

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    icon: 'text-indigo-400',
    gradient: 'from-indigo-500/5',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    gradient: 'from-emerald-500/5',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    icon: 'text-orange-400',
    gradient: 'from-orange-500/5',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    icon: 'text-rose-400',
    gradient: 'from-rose-500/5',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    gradient: 'from-blue-500/5',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }: StatCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div className={`group relative bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:${colors.border} rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          {trend && (
            <span className={`text-xs font-semibold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <div className="text-4xl font-bold mb-1">{value}</div>
        <div className="text-sm text-[var(--text-secondary)]">{title}</div>
        {subtitle && (
          <div className="text-xs text-[var(--text-tertiary)] mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
