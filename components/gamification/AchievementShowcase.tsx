'use client';

import { Lock } from 'lucide-react';
import { Achievement } from '@/lib/gamification';

interface AchievementShowcaseProps {
  achievements: Achievement[];
  className?: string;
  limit?: number;
}

/**
 * AchievementShowcase Component
 * 
 * Displays user achievements with progress tracking and unlock states.
 * Implements variable rewards and progress tracking psychological principles.
 */
export function AchievementShowcase({ achievements, className = '', limit }: AchievementShowcaseProps) {
  const displayAchievements = limit ? achievements.slice(0, limit) : achievements;
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return {
          gradient: 'from-cyan-400 via-blue-500 to-purple-500',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
          border: 'border-cyan-400',
        };
      case 'platinum':
        return {
          gradient: 'from-gray-300 via-gray-400 to-gray-500',
          glow: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
          border: 'border-gray-400',
        };
      case 'gold':
        return {
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
          border: 'border-yellow-400',
        };
      case 'silver':
        return {
          gradient: 'from-gray-400 via-zinc-300 to-gray-400',
          glow: 'shadow-[0_0_12px_rgba(161,161,170,0.3)]',
          border: 'border-gray-300',
        };
      default: // bronze
        return {
          gradient: 'from-orange-600 via-amber-700 to-orange-600',
          glow: 'shadow-[0_0_10px_rgba(217,119,6,0.3)]',
          border: 'border-orange-600',
        };
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black embossed-text mb-1">Achievements</h3>
          <p className="text-sm text-zinc-400">
            {unlockedCount} of {totalCount} unlocked ({Math.round((unlockedCount / totalCount) * 100)}%)
          </p>
        </div>
        <div className="skeuo-badge bg-gradient-to-r from-purple-500 to-pink-500">
          <span className="text-sm font-bold">{unlockedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayAchievements.map((achievement) => {
          const config = getTierConfig(achievement.tier);
          const progressPercent = (achievement.progress / achievement.maxProgress) * 100;

          return (
            <div
              key={achievement.id}
              className={`skeuo-card p-4 relative overflow-hidden transition-all duration-300 ${
                achievement.unlocked
                  ? `${config.glow} hover:scale-105 cursor-pointer`
                  : 'opacity-60 hover:opacity-80'
              }`}
            >
              {/* Locked Overlay */}
              {!achievement.unlocked && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-zinc-500" />
                </div>
              )}

              {/* Achievement Icon */}
              <div
                className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${config.gradient} ${config.glow}`
                    : 'bg-zinc-800'
                }`}
              >
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>

              {/* Achievement Info */}
              <div className="text-center">
                <div className={`text-sm font-bold mb-1 ${
                  achievement.unlocked ? 'text-white' : 'text-zinc-500'
                }`}>
                  {achievement.name}
                </div>
                <div className="text-xs text-zinc-400 mb-3 line-clamp-2">
                  {achievement.description}
                </div>

                {/* Progress Bar */}
                {!achievement.unlocked && achievement.progress > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-zinc-500 font-bold">
                      {achievement.progress}/{achievement.maxProgress}
                    </div>
                    <div className="skeuo-progress h-1.5">
                      <div
                        className={`skeuo-progress-bar h-1.5 bg-gradient-to-r ${config.gradient}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Unlocked Badge */}
                {achievement.unlocked && (
                  <div className={`inline-block px-2 py-0.5 rounded-full border ${config.border} bg-black/50`}>
                    <span className="text-[10px] font-bold text-white uppercase">
                      {achievement.tier}
                    </span>
                  </div>
                )}
              </div>

              {/* Shine effect for unlocked */}
              {achievement.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-6 border-t border-zinc-800/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400 font-medium">Overall Progress</span>
          <span className="text-sm text-zinc-300 font-bold">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
        <div className="skeuo-progress h-3">
          <div
            className="skeuo-progress-bar h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transition-all duration-1000"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
