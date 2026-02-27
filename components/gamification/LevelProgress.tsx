'use client';

import { Trophy, Zap, Star, Crown } from 'lucide-react';
import { UserLevel } from '@/lib/gamification';

interface LevelProgressProps {
  userLevel: UserLevel;
  className?: string;
  showDetails?: boolean;
}

/**
 * LevelProgress Component
 * 
 * Displays user's current level, XP progress, and title with engaging visuals.
 * Implements progress tracking and goal gradient effect psychological principles.
 */
export function LevelProgress({ userLevel, className = '', showDetails = true }: LevelProgressProps) {
  const progressPercent = userLevel.xpToNextLevel > 0
    ? ((userLevel.xp - (userLevel.xp - userLevel.xpToNextLevel)) / userLevel.xpToNextLevel) * 100
    : 100;

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'legend':
        return {
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          icon: Crown,
          glow: 'shadow-[0_0_30px_rgba(251,191,36,0.4)]',
          badge: 'LEGEND',
        };
      case 'grandmaster':
        return {
          gradient: 'from-purple-400 via-pink-500 to-red-500',
          icon: Trophy,
          glow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
          badge: 'GRANDMASTER',
        };
      case 'master':
        return {
          gradient: 'from-blue-400 via-cyan-500 to-teal-500',
          icon: Star,
          glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
          badge: 'MASTER',
        };
      case 'expert':
        return {
          gradient: 'from-green-400 via-emerald-500 to-teal-500',
          icon: Zap,
          glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          badge: 'EXPERT',
        };
      case 'apprentice':
        return {
          gradient: 'from-orange-400 via-amber-500 to-yellow-500',
          icon: Star,
          glow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
          badge: 'APPRENTICE',
        };
      default:
        return {
          gradient: 'from-gray-400 via-gray-500 to-gray-600',
          icon: Zap,
          glow: '',
          badge: 'NOVICE',
        };
    }
  };

  const config = getTierConfig(userLevel.tier);
  const Icon = config.icon;

  return (
    <div className={`skeuo-card p-5 ${config.glow} ${className}`}>
      <div className="flex items-center gap-4">
        {/* Level Icon */}
        <div className={`skeuo-avatar w-16 h-16 bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 ${config.glow}`}>
          <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        {/* Level Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl font-black embossed-text">
              <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                Lv {userLevel.level}
              </span>
            </div>
            <div className={`skeuo-badge bg-gradient-to-r ${config.gradient} px-2 py-0.5`}>
              <span className="text-[10px] font-bold text-white">{config.badge}</span>
            </div>
          </div>
          
          <div className="text-sm font-bold text-white mb-3 truncate">
            {userLevel.title}
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">
                {userLevel.xp.toLocaleString()} XP
              </span>
              {userLevel.xpToNextLevel > 0 && (
                <span className="text-zinc-500 font-bold">
                  {userLevel.xpToNextLevel.toLocaleString()} to next
                </span>
              )}
            </div>
            <div className="skeuo-progress h-2 relative overflow-hidden">
              <div 
                className={`skeuo-progress-bar h-2 bg-gradient-to-r ${config.gradient} transition-all duration-1000 ease-out relative`}
                style={{ width: `${progressPercent}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      {showDetails && userLevel.xpToNextLevel > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-800/50">
          <div className="text-xs text-zinc-400 leading-relaxed">
            <span className="font-bold text-zinc-300">{Math.round(progressPercent)}%</span> to Level {userLevel.level + 1}
            {progressPercent >= 75 && (
              <span className="ml-2 text-green-400">• Almost there! 🎯</span>
            )}
            {progressPercent >= 50 && progressPercent < 75 && (
              <span className="ml-2 text-blue-400">• Halfway there! 💪</span>
            )}
            {progressPercent < 50 && progressPercent >= 25 && (
              <span className="ml-2 text-orange-400">• Keep going! 🔥</span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
