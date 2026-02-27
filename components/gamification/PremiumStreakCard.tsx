'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy, Crown, Star, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface PremiumStreakCardProps {
  currentStreak: number;
  className?: string;
}

/**
 * PremiumStreakCard - Apple-inspired, ultra-premium design
 * 
 * Design: Clean, minimal, data-focused, premium feel
 * NO bouncing, NO scaling, NO cringe animations
 */
export function PremiumStreakCard({ currentStreak, className = '' }: PremiumStreakCardProps) {
  useEffect(() => {
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#8b5cf6'],
        ticks: 100,
      });
    }
  }, [currentStreak]);

  const getTier = (streak: number) => {
    if (streak >= 100) return {
      name: 'Legendary',
      icon: Crown,
      color: '#fbbf24',
      gradient: 'from-yellow-400 to-orange-500',
      bg: 'rgba(251, 191, 36, 0.05)',
    };
    if (streak >= 50) return {
      name: 'Master',
      icon: Trophy,
      color: '#a855f7',
      gradient: 'from-purple-500 to-pink-500',
      bg: 'rgba(168, 85, 247, 0.05)',
    };
    if (streak >= 30) return {
      name: 'Expert',
      icon: Sparkles,
      color: '#3b82f6',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'rgba(59, 130, 246, 0.05)',
    };
    if (streak >= 14) return {
      name: 'Committed',
      icon: Zap,
      color: '#10b981',
      gradient: 'from-green-500 to-emerald-500',
      bg: 'rgba(16, 185, 129, 0.05)',
    };
    if (streak >= 7) return {
      name: 'Building',
      icon: Star,
      color: '#f59e0b',
      gradient: 'from-orange-500 to-amber-500',
      bg: 'rgba(245, 158, 11, 0.05)',
    };
    if (streak >= 3) return {
      name: 'Starting',
      icon: Flame,
      color: '#ef4444',
      gradient: 'from-red-500 to-orange-500',
      bg: 'rgba(239, 68, 68, 0.05)',
    };
    return {
      name: 'New',
      icon: Flame,
      color: '#6b7280',
      gradient: 'from-gray-500 to-gray-600',
      bg: 'rgba(107, 114, 128, 0.05)',
    };
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

  const tier = getTier(currentStreak);
  const Icon = tier.icon;
  const nextMilestone = getNextMilestone(currentStreak);
  const progress = currentStreak > 0 ? (currentStreak / nextMilestone) * 100 : 0;
  const daysLeft = nextMilestone - currentStreak;

  return (
    <div className={className}>
      {/* Main Container */}
      <div 
        className="relative rounded-[32px] p-10 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.02) inset,
            0 20px 60px -10px rgba(0, 0, 0, 0.4),
            0 0 80px -20px ${tier.color}20
          `,
        }}
      >
        {/* Subtle gradient background */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${tier.color}, transparent 60%)`,
          }}
        />

        <div className="relative z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-10">
            {/* Icon */}
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: tier.bg,
                border: `1px solid ${tier.color}20`,
              }}
            >
              <Icon className="w-7 h-7" style={{ color: tier.color }} strokeWidth={2} />
            </div>

            {/* Badge */}
            <div 
              className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wider"
              style={{
                background: tier.bg,
                color: tier.color,
                border: `1px solid ${tier.color}20`,
              }}
            >
              {tier.name.toUpperCase()}
            </div>
          </div>

          {/* Streak Number - CLEAN, NO ANIMATIONS */}
          <div className="mb-10">
            <div className="flex items-baseline gap-3 mb-3">
              <span 
                className="text-[120px] font-black leading-none tracking-tighter"
                style={{ 
                  color: tier.color,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {currentStreak}
              </span>
            </div>
            <div className="text-zinc-400 text-lg font-medium">
              {currentStreak === 0 && 'Start your streak today'}
              {currentStreak === 1 && 'One day down, keep going'}
              {currentStreak > 1 && `${currentStreak} days in a row`}
            </div>
          </div>

          {/* Progress Section */}
          {currentStreak > 0 && daysLeft > 0 && (
            <div className="space-y-4 mb-8">
              {/* Progress Bar */}
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${tier.gradient.replace('from-', '').replace('to-', ', ')})`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>

              {/* Progress Info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 font-medium">
                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'} to {nextMilestone}
                </span>
                <span className="font-bold text-white">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          )}

          {/* Milestones */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between">
              {[3, 7, 14, 30, 50, 100].map((milestone, i) => (
                <div key={milestone} className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500`}
                    style={{
                      backgroundColor: currentStreak >= milestone ? tier.color : 'rgba(255,255,255,0.1)',
                      boxShadow: currentStreak >= milestone ? `0 0 12px ${tier.color}` : 'none',
                      opacity: currentStreak >= milestone ? 1 : 0.3,
                    }}
                  />
                  <span 
                    className={`text-[11px] font-bold transition-colors duration-300 ${
                      currentStreak >= milestone ? 'text-white' : 'text-zinc-600'
                    }`}
                  >
                    {milestone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
