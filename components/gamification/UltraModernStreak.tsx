'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Zap, Award } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface UltraModernStreakProps {
  currentStreak: number;
  className?: string;
}

/**
 * UltraModernStreak - Minimalist, premium streak display
 * 
 * Design Philosophy:
 * - Clean, minimal, no clutter
 * - Subtle animations only
 * - Premium feel
 * - Data-focused
 */
export function UltraModernStreak({ currentStreak, className = '' }: UltraModernStreakProps) {
  useEffect(() => {
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
      });
    }
  }, [currentStreak]);

  const getTierData = (streak: number) => {
    if (streak >= 100) return { color: '#fbbf24', label: 'LEGENDARY', progress: 100 };
    if (streak >= 50) return { color: '#a855f7', label: 'MASTER', progress: 80 };
    if (streak >= 30) return { color: '#3b82f6', label: 'EXPERT', progress: 60 };
    if (streak >= 14) return { color: '#10b981', label: 'COMMITTED', progress: 40 };
    if (streak >= 7) return { color: '#f59e0b', label: 'BUILDING', progress: 20 };
    if (streak >= 3) return { color: '#ef4444', label: 'STARTING', progress: 10 };
    return { color: '#6b7280', label: 'NEW', progress: 0 };
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 3) return 3;
    if (streak < 7) return 7;
    if (streak < 14) return 14;
    if (streak < 30) return 30;
    if (streak < 50) return 50;
    if (streak < 100) return 100;
    return streak + 50;
  };

  const tier = getTierData(currentStreak);
  const nextMilestone = getNextMilestone(currentStreak);
  const progress = currentStreak > 0 ? (currentStreak / nextMilestone) * 100 : 0;

  return (
    <div className={`relative ${className}`}>
      {/* Main Card */}
      <div 
        className="relative rounded-3xl p-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Subtle gradient overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(circle at top right, ${tier.color}, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tier.color, boxShadow: `0 0 10px ${tier.color}` }}
              />
              <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">
                {tier.label}
              </span>
            </div>
            {currentStreak >= 7 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs font-bold text-green-400">Active</span>
              </div>
            )}
          </div>

          {/* Streak Number - Clean, no animations */}
          <div className="mb-8">
            <div className="flex items-baseline gap-4 mb-2">
              <span 
                className="text-8xl font-black tracking-tighter"
                style={{ 
                  color: tier.color,
                  textShadow: `0 0 40px ${tier.color}40`,
                }}
              >
                {currentStreak}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">days</span>
                <span className="text-sm text-zinc-500">in a row</span>
              </div>
            </div>
          </div>

          {/* Progress Bar - Minimal */}
          {currentStreak > 0 && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Next milestone</span>
                <span className="font-bold text-white">{nextMilestone} days</span>
              </div>
              <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: tier.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
            <div>
              <div className="text-2xl font-bold text-white mb-1">{nextMilestone - currentStreak}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Days to go</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">{Math.round(progress)}%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {currentStreak >= 100 ? '∞' : Math.ceil(currentStreak / 7)}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Weeks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones - Minimal dots */}
      {currentStreak > 0 && (
        <div className="mt-6 flex items-center justify-between px-2">
          {[3, 7, 14, 30, 50, 100].map((milestone) => (
            <div key={milestone} className="flex flex-col items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentStreak >= milestone 
                    ? 'scale-100 opacity-100' 
                    : 'scale-75 opacity-30'
                }`}
                style={{ 
                  backgroundColor: currentStreak >= milestone ? tier.color : '#4b5563',
                  boxShadow: currentStreak >= milestone ? `0 0 8px ${tier.color}` : 'none',
                }}
              />
              <span className={`text-[10px] font-bold transition-colors ${
                currentStreak >= milestone ? 'text-white' : 'text-zinc-600'
              }`}>
                {milestone}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
