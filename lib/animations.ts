import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Animation Utilities
 * 
 * Provides CSS classes and utilities for micro-interactions:
 * - Button hover/focus animations
 * - Card lift effects
 * - Page transitions
 * - Loading states
 * - Animated counters
 * - Streak celebrations
 * 
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.7
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Button animation classes
 * 
 * Requirements: 21.1
 */
export const buttonAnimations = {
  // Hover glow effect
  hoverGlow: 'transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
  
  // Active state inset shadow
  activeInset: 'active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-0.5',
  
  // Focus ring animation
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background transition-all duration-200',
  
  // Scale on hover
  scale: 'transition-transform duration-200 hover:scale-105 active:scale-95',
  
  // All button animations combined
  all: 'transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
};

/**
 * Card animation classes
 * 
 * Requirements: 21.2
 */
export const cardAnimations = {
  // Hover lift effect
  hoverLift: 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
  
  // Smooth transitions
  transition: 'transition-all duration-200',
  
  // Glassmorphism with hover
  glassHover: 'transition-all duration-300 hover:bg-white/10',
  
  // Border glow on hover
  borderGlow: 'transition-all duration-300 hover:border-primary/50',
};

/**
 * Page transition classes
 * 
 * Requirements: 21.3
 */
export const pageTransitions = {
  // Fade in
  fadeIn: 'animate-in fade-in duration-300',
  
  // Fade in with slide
  fadeInSlide: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
  
  // Fade out
  fadeOut: 'animate-out fade-out duration-200',
  
  // Scale fade
  scaleFade: 'animate-in fade-in zoom-in-95 duration-300',
  
  // Slide from right
  slideInRight: 'animate-in slide-in-from-right duration-300',
  
  // Slide from left
  slideInLeft: 'animate-in slide-in-from-left duration-300',
  
  // Page load animation
  pageLoad: 'animate-in fade-in duration-500',
};

/**
 * Loading state classes
 * 
 * Requirements: 21.4
 */
export const loadingStates = {
  // Skeleton pulse
  skeleton: 'animate-pulse bg-muted rounded',
  
  // Skeleton shimmer
  shimmer: 'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
  
  // Spinner
  spinner: 'animate-spin rounded-full border-2 border-primary/30 border-t-primary',
  
  // Loading pulse
  pulse: 'animate-pulse',
  
  // Skeleton for text
  skeletonText: 'h-4 w-full skeleton',
  
  // Skeleton for circular elements
  skeletonCircle: 'rounded-full skeleton',
  
  // Skeleton for cards
  skeletonCard: 'rounded-xl skeleton p-4',
};

/**
 * Animated counter configuration
 * 
 * Requirements: 21.5
 */
export const counterConfig = {
  // Spring animation config
  spring: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 1,
  },
  
  // Duration-based animation config
  duration: {
    duration: 0.5,
    ease: 'easeOut',
  },
};

/**
 * Streak celebration config
 * 
 * Requirements: 21.7, 40
 */
export const streakMilestones = {
  milestones: [
    { days: 3, label: 'Getting Started', icon: 'Sparkles' },
    { days: 7, label: 'Week Warrior', icon: 'Flame' },
    { days: 14, label: 'Two Week Wonder', icon: 'Zap' },
    { days: 30, label: 'Monthly Master', icon: 'Trophy' },
    { days: 50, label: 'Half Century', icon: 'Gem' },
    { days: 100, label: 'Century Club', icon: 'Crown' },
  ],
  
  // Celebration animation config
  celebration: {
    duration: 3000,
    particleCount: 50,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
  },
};

/**
 * Get the next milestone for a streak
 */
export function getNextMilestone(currentStreak: number) {
  return streakMilestones.milestones.find(m => m.days > currentStreak);
}

/**
 * Get the current milestone for a streak
 */
export function getCurrentMilestone(currentStreak: number) {
  return [...streakMilestones.milestones]
    .reverse()
    .find(m => m.days <= currentStreak);
}

/**
 * Check if streak qualifies for celebration
 */
export function shouldCelebrate(currentStreak: number): boolean {
  return streakMilestones.milestones.some(m => m.days === currentStreak);
}

/**
 * Get celebration config for a milestone
 */
export function getCelebrationConfig(days: number) {
  const milestone = streakMilestones.milestones.find(m => m.days === days);
  if (!milestone) return null;
  
  return {
    ...streakMilestones.celebration,
    title: `${milestone.label}!`,
    message: `You've maintained a ${days}-day focus streak!`,
  };
}