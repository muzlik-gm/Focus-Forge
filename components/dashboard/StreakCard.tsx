'use client';

import { Flame, Trophy, Zap, Star, Crown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StreakCardProps {
  currentStreak: number;
  className?: string;
}

/**
 * StreakCard Component
 * 
 * Displays the user's current focus streak with engaging visuals and milestones.
 * Features dynamic styling based on streak length to encourage consistency.
 */
export function StreakCard({ currentStreak, className = '' }: StreakCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentStreak > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  // Determine streak tier and styling
  const getStreakTier = (streak: number) => {
    if (streak >= 100) return {
      name: 'Legendary',
      icon: Crown,
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      bgGradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-400',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]',
      particles: '✨🔥⭐',
      message: 'LEGENDARY STATUS!',
      emoji: '👑',
    };
    if (streak >= 50) return {
      name: 'Master',
      icon: Trophy,
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      bgGradient: 'from-purple-500/20 via-pink-500/20 to-red-500/20',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-400',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]',
      particles: '🏆💜⚡',
      message: 'Master Level!',
      emoji: '🏆',
    };
    if (streak >= 30) return {
      name: 'Expert',
      icon: Sparkles,
      gradient: 'from-blue-400 via-cyan-500 to-teal-500',
      bgGradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
      borderColor: 'border-cyan-500',
      textColor: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
      particles: '✨💎🌟',
      message: 'Expert Status!',
      emoji: '💎',
    };
    if (streak >= 14) return {
      name: 'Committed',
      icon: Zap,
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20',
      borderColor: 'border-green-500',
      textColor: 'text-green-400',
      glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
      particles: '⚡💚🌱',
      message: '2 Weeks Strong!',
      emoji: '⚡',
    };
    if (streak >= 7) return {
      name: 'Building',
      icon: Star,
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      bgGradient: 'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-400',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
      particles: '🌟🔥💫',
      message: '1 Week Streak!',
      emoji: '🌟',
    };
    if (streak >= 3) return {
      name: 'Starting',
      icon: Flame,
      gradient: 'from-red-400 via-orange-500 to-amber-500',
      bgGradient: 'from-red-500/20 via-orange-500/20 to-amber-500/20',
      borderColor: 'border-red-500',
      textColor: 'text-red-400',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
      particles: '🔥🔥🔥',
      message: 'Getting Started!',
      emoji: '🔥',
    };
    return {
      name: 'New',
      icon: Flame,
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      bgGradient: 'from-gray-500/20 via-gray-600/20 to-gray-700/20',
      borderColor: 'border-gray-500',
      textColor: 'text-gray-400',
      glow: '',
      particles: '🔥',
      message: 'Start Your Streak!',
      emoji: '🔥',
    };
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 3) return { target: 3, name: 'First Milestone' };
    if (streak < 7) return { target: 7, name: 'One Week' };
    if (streak < 14) return { target: 14, name: 'Two Weeks' };
    if (streak < 30) return { target: 30, name: 'One Month' };
    if (streak < 50) return { target: 50, name: 'Master' };
    if (streak < 100) return { target: 100, name: 'Legendary' };
    return { target: streak + 50, name: 'Keep Going!' };
  };

  const tier = getStreakTier(currentStreak);
  const nextMilestone = getNextMilestone(currentStreak);
  const progressToNext = currentStreak > 0 
    ? Math.min(100, (currentStreak / nextMilestone.target) * 100)
    : 0;
  const daysUntilNext = Math.max(0, nextMilestone.target - currentStreak);

  const Icon = tier.icon;

  return (
    <div className={`skeuo-panel p-6 relative overflow-hidden ${tier.glow} ${className}`}>
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tier.bgGradient} opacity-50`} />
      
      {/* Animated Particles */}
      {currentStreak >= 3 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`absolute text-2xl ${isAnimating ? 'animate-float' : ''}`}
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.3,
              }}
            >
              {tier.particles[i] || '✨'}
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`skeuo-avatar w-14 h-14 bg-gradient-to-br ${tier.gradient} flex items-center justify-center ${tier.glow}`}>
            <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div className={`skeuo-badge bg-gradient-to-r ${tier.gradient}`}>
            <span className="text-xs font-bold text-white">{tier.name.toUpperCase()}</span>
          </div>
        </div>

        {/* Streak Number */}
        <div className="mb-3">
          <div className={`text-5xl font-black mb-1 embossed-text ${isAnimating ? 'animate-bounce' : ''}`}>
            <span className={tier.textColor}>{currentStreak}</span>
            <span className="text-2xl ml-2">{tier.emoji}</span>
          </div>
          <div className="text-zinc-400 text-sm font-medium">
            {currentStreak === 0 ? 'No streak yet' :
             currentStreak === 1 ? 'Day streak - keep going!' :
             `Day streak - ${tier.message}`}
          </div>
        </div>

        {/* Progress to Next Milestone */}
        {currentStreak > 0 && daysUntilNext > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400 font-medium">
                Next: {nextMilestone.name}
              </span>
              <span className="text-xs text-zinc-500 font-bold">
                {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'} to go
              </span>
            </div>
            <div className="skeuo-progress h-3 relative overflow-hidden">
              <div 
                className={`skeuo-progress-bar h-3 bg-gradient-to-r ${tier.gradient} transition-all duration-1000 ease-out relative`}
                style={{ width: `${progressToNext}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className={`mt-4 p-3 rounded-lg border-l-4 ${tier.borderColor} bg-black/30`}>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {currentStreak === 0 && "Complete a focus session today to start your streak! 🚀"}
            {currentStreak === 1 && "Great start! Come back tomorrow to keep it alive. 💪"}
            {currentStreak === 2 && "Two days! One more to hit your first milestone. 🎯"}
            {currentStreak >= 3 && currentStreak < 7 && "You're building momentum! Don't break the chain. 🔗"}
            {currentStreak >= 7 && currentStreak < 14 && "One week strong! You're forming a habit. 🌱"}
            {currentStreak >= 14 && currentStreak < 30 && "Two weeks! This is becoming part of who you are. ⚡"}
            {currentStreak >= 30 && currentStreak < 50 && "30 days! You've mastered consistency. 💎"}
            {currentStreak >= 50 && currentStreak < 100 && "50+ days! You're in the top 1% of users. 🏆"}
            {currentStreak >= 100 && "100+ days! You're a productivity legend! 👑"}
          </p>
        </div>

        {/* Streak Milestones */}
        {currentStreak > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <div className="text-xs text-zinc-500 font-bold mb-2 uppercase tracking-wider">Milestones</div>
            <div className="flex gap-2">
              {[3, 7, 14, 30, 50, 100].map((milestone) => (
                <div
                  key={milestone}
                  className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                    currentStreak >= milestone
                      ? `bg-gradient-to-r ${tier.gradient}`
                      : 'bg-zinc-800'
                  }`}
                  title={`${milestone} days`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-zinc-600">3</span>
              <span className="text-[10px] text-zinc-600">7</span>
              <span className="text-[10px] text-zinc-600">14</span>
              <span className="text-[10px] text-zinc-600">30</span>
              <span className="text-[10px] text-zinc-600">50</span>
              <span className="text-[10px] text-zinc-600">100</span>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
