'use client';

import { motion, useAnimation } from 'framer-motion';
import { Flame, Trophy, Zap, Star, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface ModernStreakCardProps {
  currentStreak: number;
  className?: string;
}

/**
 * ModernStreakCard - Stunning glassmorphism streak display
 * 
 * Features:
 * - Glassmorphism design
 * - Particle effects
 * - Smooth animations
 * - Dynamic gradients
 * - Confetti celebrations
 */
export function ModernStreakCard({ currentStreak, className = '' }: ModernStreakCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      triggerCelebration();
    }
  }, [currentStreak]);

  const triggerCelebration = () => {
    setShowCelebration(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB'],
    });
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const getStreakTier = (streak: number) => {
    if (streak >= 100) return {
      name: 'Legendary',
      icon: Crown,
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      particles: ['✨', '🔥', '⭐', '💫', '👑'],
      message: 'LEGENDARY STATUS!',
      emoji: '👑',
      glowColor: 'rgba(251, 191, 36, 0.4)',
    };
    if (streak >= 50) return {
      name: 'Master',
      icon: Trophy,
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      particles: ['🏆', '💜', '⚡', '✨', '🌟'],
      message: 'Master Level!',
      emoji: '🏆',
      glowColor: 'rgba(168, 85, 247, 0.3)',
    };
    if (streak >= 30) return {
      name: 'Expert',
      icon: Sparkles,
      gradient: 'from-blue-400 via-cyan-500 to-teal-500',
      particles: ['✨', '💎', '🌟', '⭐', '🔷'],
      message: 'Expert Status!',
      emoji: '💎',
      glowColor: 'rgba(34, 211, 238, 0.3)',
    };
    if (streak >= 14) return {
      name: 'Committed',
      icon: Zap,
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      particles: ['⚡', '💚', '🌱', '✅', '🎯'],
      message: '2 Weeks Strong!',
      emoji: '⚡',
      glowColor: 'rgba(34, 197, 94, 0.3)',
    };
    if (streak >= 7) return {
      name: 'Building',
      icon: Star,
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      particles: ['🌟', '🔥', '💫', '⭐', '🎨'],
      message: '1 Week Streak!',
      emoji: '🌟',
      glowColor: 'rgba(249, 115, 22, 0.3)',
    };
    if (streak >= 3) return {
      name: 'Starting',
      icon: Flame,
      gradient: 'from-red-400 via-orange-500 to-amber-500',
      particles: ['🔥', '🔥', '🔥', '💪', '🚀'],
      message: 'Getting Started!',
      emoji: '🔥',
      glowColor: 'rgba(239, 68, 68, 0.3)',
    };
    return {
      name: 'New',
      icon: Flame,
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      particles: ['🔥', '💪', '🎯', '✨', '🚀'],
      message: 'Start Your Streak!',
      emoji: '🔥',
      glowColor: 'rgba(107, 114, 128, 0.2)',
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
    <GlassCard
      variant="premium"
      blur="xl"
      glow
      hover={false}
      className={cn('relative overflow-hidden', className)}
      style={{
        boxShadow: `0 8px 32px 0 ${tier.glowColor}, 0 0 60px 0 ${tier.glowColor}`,
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-10`}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles */}
      {currentStreak >= 3 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {tier.particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              initial={{
                x: `${20 + i * 20}%`,
                y: '100%',
                opacity: 0,
              }}
              animate={{
                y: ['-20%', '-100%'],
                x: [`${20 + i * 20}%`, `${25 + i * 20}%`],
                opacity: [0, 0.6, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 1.5,
              }}
            >
              {particle}
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}
            style={{
              boxShadow: `0 0 40px ${tier.glowColor}`,
            }}
            animate={{
              boxShadow: [
                `0 0 40px ${tier.glowColor}`,
                `0 0 60px ${tier.glowColor}`,
                `0 0 40px ${tier.glowColor}`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
            
            {/* Rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-white/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          <div className="flex flex-col items-end gap-2">
            <motion.div
              className={`px-4 py-2 rounded-full bg-gradient-to-r ${tier.gradient} backdrop-blur-sm`}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm font-black text-white tracking-wider">
                {tier.name.toUpperCase()}
              </span>
            </motion.div>
            {currentStreak >= 7 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-xs text-green-400 font-bold"
              >
                <TrendingUp className="w-3 h-3" />
                On Fire!
              </motion.div>
            )}
          </div>
        </div>

        {/* Streak Number - NO ANIMATIONS */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <div
              className="text-7xl font-black"
              style={{
                background: `linear-gradient(135deg, ${tier.gradient.replace('from-', '').replace('via-', ', ').replace('to-', ', ')})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {currentStreak}
            </div>
            <span className="text-4xl">
              {tier.emoji}
            </span>
          </div>
          <div className="text-zinc-300 text-lg font-bold mt-2">
            {currentStreak === 0 ? 'No streak yet' :
             currentStreak === 1 ? 'Day streak - keep going!' :
             `Day streak - ${tier.message}`}
          </div>
        </div>

        {/* Progress to Next Milestone */}
        {currentStreak > 0 && daysUntilNext > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-300 font-bold">
                Next: {nextMilestone.name}
              </span>
              <span className="text-sm text-zinc-400 font-black">
                {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'} to go
              </span>
            </div>
            <div className="relative h-4 rounded-full bg-black/30 backdrop-blur-sm overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tier.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-white drop-shadow-lg">
                  {Math.round(progressToNext)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Motivational Message */}
        <motion.div
          className={`p-4 rounded-xl border-l-4 bg-black/20 backdrop-blur-sm`}
          style={{
            borderColor: tier.gradient.split(' ')[0].replace('from-', ''),
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-zinc-200 leading-relaxed font-medium">
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
        </motion.div>

        {/* Milestone Visualization */}
        {currentStreak > 0 && (
          <motion.div
            className="mt-6 pt-6 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-xs text-zinc-400 font-bold mb-3 uppercase tracking-wider">
              Milestones
            </div>
            <div className="flex gap-2">
              {[3, 7, 14, 30, 50, 100].map((milestone) => (
                <motion.div
                  key={milestone}
                  className="flex-1 h-3 rounded-full relative overflow-hidden"
                  style={{
                    background: currentStreak >= milestone
                      ? `linear-gradient(90deg, ${tier.gradient.replace('from-', '').replace('via-', ', ').replace('to-', ', ')})`
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                  whileHover={{ scale: 1.1 }}
                  title={`${milestone} days`}
                >
                  {currentStreak >= milestone && (
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {[3, 7, 14, 30, 50, 100].map((milestone) => (
                <span
                  key={milestone}
                  className={cn(
                    'text-[10px] font-bold',
                    currentStreak >= milestone ? 'text-white' : 'text-zinc-600'
                  )}
                >
                  {milestone}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
