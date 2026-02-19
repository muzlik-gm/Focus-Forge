'use client';

import { useEffect, useState } from 'react';
import { Confetti } from '@/components/ui/Confetti';
import { Button } from '@/components/ui/Button';
import { Trophy, X, Sparkles } from 'lucide-react';
import { streakMilestones, getCelebrationConfig, shouldCelebrate } from '@/lib/animations';

/**
 * Streak Celebration Component
 * 
 * Displays a celebration modal when the user reaches a streak milestone.
 * Triggers confetti animation and shows achievement details.
 * 
 * Requirements: 21.7, 40
 */

interface StreakCelebrationProps {
  streak: number;
  onClose?: () => void;
}

export function StreakCelebration({ streak, onClose }: StreakCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (shouldCelebrate(streak)) {
      setIsVisible(true);
      setShowConfetti(true);
    }
  }, [streak]);

  const handleClose = () => {
    setIsVisible(false);
    setShowConfetti(false);
    onClose?.();
  };

  if (!isVisible || !shouldCelebrate(streak)) {
    return null;
  }

  const config = getCelebrationConfig(streak);
  if (!config) return null;

  return (
    <>
      {/* Confetti animation */}
      {showConfetti && (
        <Confetti
          particleCount={config.particleCount}
          spread={config.spread}
          origin={config.origin}
          onComplete={() => setShowConfetti(false)}
        />
      )}

      {/* Celebration modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebration content */}
          <div className="text-center">
            {/* Trophy icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-2">
              {config.title}
            </h2>

            {/* Message */}
            <p className="text-muted-foreground mb-6">
              {config.message}
            </p>

            {/* Streak stats */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold">
                <Sparkles className="w-6 h-6 text-primary" />
                <span>{streak}</span>
                <span className="text-lg text-muted-foreground font-normal">
                  days
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Current streak
              </p>
            </div>

            {/* Next milestone */}
            {streak < 100 && (
              <div className="text-sm text-muted-foreground">
                <p>
                  Next milestone:{' '}
                  <span className="font-medium text-foreground">
                    {streakMilestones.milestones.find(m => m.days > streak)?.days} days
                  </span>
                </p>
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
                    style={{
                      width: `${(streak / 100) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* CTA button */}
            <Button onClick={handleClose} className="mt-6 w-full" size="lg">
              Awesome!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Streak Badge Component
 * 
 * Displays a small badge showing the current streak with milestone indicator.
 * 
 * Requirements: 40
 */

interface StreakBadgeProps {
  streak: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, showLabel = true, size = 'md' }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isMilestone = shouldCelebrate(streak);

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        ${isMilestone ? 'text-orange-500' : 'text-muted-foreground'}
        ${sizeClasses[size]}
      `}
    >
      <Sparkles className={iconSizes[size]} />
      <span className="font-semibold">{streak}</span>
      {showLabel && (
        <span className="text-xs opacity-70">days</span>
      )}
    </div>
  );
}