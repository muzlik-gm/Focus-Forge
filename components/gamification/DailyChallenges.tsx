'use client';

import { CheckCircle2, Clock, Zap } from 'lucide-react';
import { DailyChallenge } from '@/lib/gamification';

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  className?: string;
}

/**
 * DailyChallenges Component
 * 
 * Displays daily challenges with progress tracking and XP rewards.
 * Implements commitment & consistency and variable rewards principles.
 */
export function DailyChallenges({ challenges, className = '' }: DailyChallengesProps) {
  const completedCount = challenges.filter(c => c.completed).length;
  const totalXP = challenges.reduce((sum, c) => sum + (c.completed ? c.xpReward : 0), 0);
  const potentialXP = challenges.reduce((sum, c) => sum + c.xpReward, 0);

  return (
    <div className={`skeuo-panel p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black embossed-text mb-1 flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            Daily Challenges
          </h3>
          <p className="text-sm text-zinc-400">
            Complete challenges to earn bonus XP
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400 embossed-text">
            {totalXP} XP
          </div>
          <div className="text-xs text-zinc-500">
            of {potentialXP} possible
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {challenges.map((challenge, index) => {
          const progressPercent = (challenge.progress / challenge.target) * 100;
          const isComplete = challenge.completed;

          return (
            <div
              key={challenge.id}
              className={`skeuo-card p-5 transition-all duration-300 ${
                isComplete
                  ? 'bg-green-900/10 border-l-4 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                  : 'hover:bg-white/5'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Challenge Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                    isComplete
                      ? 'bg-gradient-to-br from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'bg-zinc-800'
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="w-6 h-6 text-white" /> : challenge.icon}
                </div>

                {/* Challenge Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className={`text-base font-bold mb-1 ${
                        isComplete ? 'text-green-400' : 'text-white'
                      }`}>
                        {challenge.title}
                      </h4>
                      <p className="text-sm text-zinc-400">
                        {challenge.description}
                      </p>
                    </div>
                    <div className={`skeuo-badge flex-shrink-0 ${
                      isComplete
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-400'
                    }`}>
                      <span className="text-xs font-bold">+{challenge.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Progress */}
                  {!isComplete && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">
                          Progress: {challenge.progress}/{challenge.target}
                        </span>
                        <span className="text-zinc-500 font-bold">
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <div className="skeuo-progress h-2">
                        <div
                          className="skeuo-progress-bar h-2 bg-gradient-to-r from-yellow-500 to-orange-400 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Completed Message */}
                  {isComplete && (
                    <div className="flex items-center gap-2 text-sm text-green-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Challenge completed! 🎉
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-zinc-400">
              {completedCount} of {challenges.length} completed
            </span>
          </div>
          {completedCount === challenges.length ? (
            <div className="flex items-center gap-2 text-sm font-bold text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              All challenges complete! 🏆
            </div>
          ) : (
            <div className="text-sm text-zinc-500">
              {challenges.length - completedCount} remaining
            </div>
          )}
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-3">
          <div className="skeuo-progress h-2">
            <div
              className="skeuo-progress-bar h-2 bg-gradient-to-r from-yellow-500 via-orange-400 to-red-400 transition-all duration-1000"
              style={{ width: `${(completedCount / challenges.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
