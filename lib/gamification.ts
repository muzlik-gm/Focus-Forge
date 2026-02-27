/**
 * Gamification System
 * 
 * Implements psychological principles and game mechanics to boost user engagement
 * and productivity through rewards, achievements, and progress tracking.
 * 
 * Psychological Principles Applied:
 * 1. Variable Rewards (Dopamine triggers)
 * 2. Loss Aversion (Fear of losing progress)
 * 3. Social Proof (Comparison to others)
 * 4. Progress Tracking (Visual feedback)
 * 5. Goal Gradient Effect (Closer = more motivated)
 * 6. Endowed Progress Effect (Head start feeling)
 * 7. Commitment & Consistency (Public pledges)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: number;
  category: 'streak' | 'focus' | 'tasks' | 'productivity' | 'special';
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface UserLevel {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  tier: 'novice' | 'apprentice' | 'expert' | 'master' | 'grandmaster' | 'legend';
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  target: number;
}

// XP System - Earn experience points for actions
export const XP_REWARDS = {
  SESSION_COMPLETE: 50,
  SESSION_PERFECT: 100, // 0 distractions
  SESSION_LONG: 25, // 60+ minutes
  TASK_COMPLETE: 20,
  TASK_COMPLETE_EARLY: 30,
  STREAK_MAINTAIN: 10,
  STREAK_MILESTONE: 50,
  DISTRACTION_FREE_DAY: 75,
  PRODUCTIVITY_HIGH: 40, // 90%+ productivity
  FIRST_SESSION_OF_DAY: 15,
  EARLY_BIRD: 25, // Session before 9 AM
  NIGHT_OWL: 25, // Session after 9 PM
  WEEKEND_WARRIOR: 35, // Session on weekend
  CHALLENGE_COMPLETE: 100,
};

// Level thresholds and titles
export const LEVEL_SYSTEM = [
  { level: 1, xpRequired: 0, title: 'Beginner', tier: 'novice' },
  { level: 2, xpRequired: 100, title: 'Focused Learner', tier: 'novice' },
  { level: 3, xpRequired: 250, title: 'Dedicated Worker', tier: 'novice' },
  { level: 4, xpRequired: 500, title: 'Productivity Seeker', tier: 'apprentice' },
  { level: 5, xpRequired: 850, title: 'Focus Apprentice', tier: 'apprentice' },
  { level: 6, xpRequired: 1300, title: 'Distraction Fighter', tier: 'apprentice' },
  { level: 7, xpRequired: 1900, title: 'Deep Work Practitioner', tier: 'expert' },
  { level: 8, xpRequired: 2600, title: 'Flow State Achiever', tier: 'expert' },
  { level: 9, xpRequired: 3500, title: 'Productivity Expert', tier: 'expert' },
  { level: 10, xpRequired: 4600, title: 'Focus Master', tier: 'master' },
  { level: 11, xpRequired: 6000, title: 'Deep Work Master', tier: 'master' },
  { level: 12, xpRequired: 7700, title: 'Productivity Guru', tier: 'master' },
  { level: 13, xpRequired: 9700, title: 'Flow State Master', tier: 'grandmaster' },
  { level: 14, xpRequired: 12000, title: 'Grandmaster of Focus', tier: 'grandmaster' },
  { level: 15, xpRequired: 15000, title: 'Productivity Legend', tier: 'legend' },
  { level: 16, xpRequired: 18500, title: 'Deep Work Legend', tier: 'legend' },
  { level: 17, xpRequired: 22500, title: 'Focus Immortal', tier: 'legend' },
  { level: 18, xpRequired: 27000, title: 'Productivity Titan', tier: 'legend' },
  { level: 19, xpRequired: 32000, title: 'Flow State God', tier: 'legend' },
  { level: 20, xpRequired: 40000, title: 'Transcendent Master', tier: 'legend' },
] as const;

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Streak Achievements
  {
    id: 'streak_3',
    name: 'First Steps',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    tier: 'bronze',
    requirement: 3,
    category: 'streak',
    maxProgress: 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    tier: 'silver',
    requirement: 7,
    category: 'streak',
    maxProgress: 7,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    tier: 'gold',
    requirement: 30,
    category: 'streak',
    maxProgress: 30,
  },
  {
    id: 'streak_100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    icon: '👑',
    tier: 'platinum',
    requirement: 100,
    category: 'streak',
    maxProgress: 100,
  },
  {
    id: 'streak_365',
    name: 'Year of Focus',
    description: 'Maintain a 365-day streak',
    icon: '🏆',
    tier: 'diamond',
    requirement: 365,
    category: 'streak',
    maxProgress: 365,
  },

  // Focus Time Achievements
  {
    id: 'focus_10h',
    name: 'Getting Started',
    description: 'Complete 10 hours of focus time',
    icon: '⏰',
    tier: 'bronze',
    requirement: 10,
    category: 'focus',
    maxProgress: 10,
  },
  {
    id: 'focus_50h',
    name: 'Dedicated Worker',
    description: 'Complete 50 hours of focus time',
    icon: '📚',
    tier: 'silver',
    requirement: 50,
    category: 'focus',
    maxProgress: 50,
  },
  {
    id: 'focus_100h',
    name: 'Century of Focus',
    description: 'Complete 100 hours of focus time',
    icon: '🎯',
    tier: 'gold',
    requirement: 100,
    category: 'focus',
    maxProgress: 100,
  },
  {
    id: 'focus_500h',
    name: 'Deep Work Master',
    description: 'Complete 500 hours of focus time',
    icon: '🌟',
    tier: 'platinum',
    requirement: 500,
    category: 'focus',
    maxProgress: 500,
  },
  {
    id: 'focus_1000h',
    name: 'Thousand Hour Club',
    description: 'Complete 1000 hours of focus time',
    icon: '💫',
    tier: 'diamond',
    requirement: 1000,
    category: 'focus',
    maxProgress: 1000,
  },

  // Task Achievements
  {
    id: 'tasks_10',
    name: 'Task Starter',
    description: 'Complete 10 tasks',
    icon: '✅',
    tier: 'bronze',
    requirement: 10,
    category: 'tasks',
    maxProgress: 10,
  },
  {
    id: 'tasks_50',
    name: 'Task Crusher',
    description: 'Complete 50 tasks',
    icon: '💪',
    tier: 'silver',
    requirement: 50,
    category: 'tasks',
    maxProgress: 50,
  },
  {
    id: 'tasks_100',
    name: 'Centurion',
    description: 'Complete 100 tasks',
    icon: '🎖️',
    tier: 'gold',
    requirement: 100,
    category: 'tasks',
    maxProgress: 100,
  },
  {
    id: 'tasks_500',
    name: 'Task Master',
    description: 'Complete 500 tasks',
    icon: '🏅',
    tier: 'platinum',
    requirement: 500,
    category: 'tasks',
    maxProgress: 500,
  },
  {
    id: 'tasks_1000',
    name: 'Task Legend',
    description: 'Complete 1000 tasks',
    icon: '🎖️',
    tier: 'diamond',
    requirement: 1000,
    category: 'tasks',
    maxProgress: 1000,
  },

  // Productivity Achievements
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete a day with 0 distractions',
    icon: '✨',
    tier: 'silver',
    requirement: 1,
    category: 'productivity',
    maxProgress: 1,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete 7 days with 0 distractions each',
    icon: '🌟',
    tier: 'gold',
    requirement: 7,
    category: 'productivity',
    maxProgress: 7,
  },
  {
    id: 'productivity_90',
    name: 'Peak Performer',
    description: 'Achieve 90%+ productivity in 10 sessions',
    icon: '🚀',
    tier: 'gold',
    requirement: 10,
    category: 'productivity',
    maxProgress: 10,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 sessions before 9 AM',
    icon: '🌅',
    tier: 'silver',
    requirement: 10,
    category: 'productivity',
    maxProgress: 10,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 10 sessions after 9 PM',
    icon: '🌙',
    tier: 'silver',
    requirement: 10,
    category: 'productivity',
    maxProgress: 10,
  },

  // Special Achievements
  {
    id: 'first_session',
    name: 'First Focus',
    description: 'Complete your first focus session',
    icon: '🎉',
    tier: 'bronze',
    requirement: 1,
    category: 'special',
    maxProgress: 1,
  },
  {
    id: 'marathon',
    name: 'Marathon Runner',
    description: 'Complete a 2+ hour session',
    icon: '🏃',
    tier: 'gold',
    requirement: 1,
    category: 'special',
    maxProgress: 1,
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 weekend sessions',
    icon: '⚔️',
    tier: 'silver',
    requirement: 10,
    category: 'special',
    maxProgress: 10,
  },
  {
    id: 'comeback',
    name: 'Comeback Kid',
    description: 'Restart after breaking a 7+ day streak',
    icon: '💪',
    tier: 'silver',
    requirement: 1,
    category: 'special',
    maxProgress: 1,
  },
];

/**
 * Calculate user level from total XP
 */
export function calculateLevel(totalXP: number): UserLevel {
  let currentLevel = LEVEL_SYSTEM[0];
  
  for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_SYSTEM[i].xpRequired) {
      currentLevel = LEVEL_SYSTEM[i];
      break;
    }
  }

  const nextLevel = LEVEL_SYSTEM[currentLevel.level] || LEVEL_SYSTEM[LEVEL_SYSTEM.length - 1];
  const xpToNextLevel = nextLevel.xpRequired - totalXP;

  return {
    level: currentLevel.level,
    xp: totalXP,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    title: currentLevel.title,
    tier: currentLevel.tier as any,
  };
}

/**
 * Calculate XP earned from a session
 */
export function calculateSessionXP(session: {
  durationMinutes: number;
  distractionCount: number;
  productivityScore: number;
  completed: boolean;
  startTime: Date;
}): { xp: number; bonuses: { reason: string; xp: number }[] } {
  if (!session.completed) {
    return { xp: 0, bonuses: [] };
  }

  let totalXP = XP_REWARDS.SESSION_COMPLETE;
  const bonuses: { reason: string; xp: number }[] = [
    { reason: 'Session completed', xp: XP_REWARDS.SESSION_COMPLETE },
  ];

  // Perfect session (0 distractions)
  if (session.distractionCount === 0) {
    bonuses.push({ reason: 'Perfect focus!', xp: XP_REWARDS.SESSION_PERFECT });
    totalXP += XP_REWARDS.SESSION_PERFECT;
  }

  // Long session (60+ minutes)
  if (session.durationMinutes >= 60) {
    bonuses.push({ reason: 'Long session', xp: XP_REWARDS.SESSION_LONG });
    totalXP += XP_REWARDS.SESSION_LONG;
  }

  // High productivity (90%+)
  if (session.productivityScore >= 90) {
    bonuses.push({ reason: 'High productivity', xp: XP_REWARDS.PRODUCTIVITY_HIGH });
    totalXP += XP_REWARDS.PRODUCTIVITY_HIGH;
  }

  // Time-based bonuses
  const hour = session.startTime.getHours();
  const day = session.startTime.getDay();

  if (hour < 9) {
    bonuses.push({ reason: 'Early bird', xp: XP_REWARDS.EARLY_BIRD });
    totalXP += XP_REWARDS.EARLY_BIRD;
  } else if (hour >= 21) {
    bonuses.push({ reason: 'Night owl', xp: XP_REWARDS.NIGHT_OWL });
    totalXP += XP_REWARDS.NIGHT_OWL;
  }

  if (day === 0 || day === 6) {
    bonuses.push({ reason: 'Weekend warrior', xp: XP_REWARDS.WEEKEND_WARRIOR });
    totalXP += XP_REWARDS.WEEKEND_WARRIOR;
  }

  return { xp: totalXP, bonuses };
}

/**
 * Generate daily challenges
 */
export function generateDailyChallenges(date: Date): DailyChallenge[] {
  const dayOfWeek = date.getDay();
  const challenges: DailyChallenge[] = [];

  // Challenge 1: Complete sessions
  challenges.push({
    id: 'daily_sessions',
    title: 'Focus Marathon',
    description: 'Complete 3 focus sessions today',
    icon: '🎯',
    xpReward: 100,
    completed: false,
    progress: 0,
    target: 3,
  });

  // Challenge 2: Productivity target
  challenges.push({
    id: 'daily_productivity',
    title: 'Peak Performance',
    description: 'Achieve 85%+ productivity in a session',
    icon: '🚀',
    xpReward: 75,
    completed: false,
    progress: 0,
    target: 1,
  });

  // Challenge 3: Task completion
  challenges.push({
    id: 'daily_tasks',
    title: 'Task Master',
    description: 'Complete 5 tasks today',
    icon: '✅',
    xpReward: 80,
    completed: false,
    progress: 0,
    target: 5,
  });

  // Weekend challenge
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    challenges.push({
      id: 'weekend_focus',
      title: 'Weekend Dedication',
      description: 'Complete 2 hours of focus time',
      icon: '⚔️',
      xpReward: 150,
      completed: false,
      progress: 0,
      target: 120, // minutes
    });
  }

  return challenges;
}

/**
 * Get motivational message based on performance
 */
export function getMotivationalMessage(context: {
  streak: number;
  level: number;
  todayProductivity: number;
  recentTrend: 'up' | 'down' | 'stable';
}): string {
  const messages = {
    highStreak: [
      `${context.streak} days! You're unstoppable! 🔥`,
      `${context.streak}-day streak! Keep the momentum going! 💪`,
      `Incredible ${context.streak}-day streak! You're building something special. ✨`,
    ],
    lowStreak: [
      "Every master was once a beginner. Start your streak today! 🌱",
      "Today is day one. Or is it one day? You decide. 🎯",
      "The best time to start was yesterday. The second best time is now. 🚀",
    ],
    highProductivity: [
      "You're in the zone! This is peak performance. 🎯",
      "Crushing it! Your focus is razor-sharp today. ⚡",
      "This is what mastery looks like. Keep going! 🌟",
    ],
    lowProductivity: [
      "Every champion has off days. Tomorrow is a new opportunity. 💪",
      "Progress isn't linear. You're still moving forward. 🌱",
      "Small steps today, giant leaps tomorrow. Keep showing up. 🚀",
    ],
    trendUp: [
      "You're on fire! Your productivity is trending up! 📈",
      "Momentum is building! You're getting better every day. 🚀",
      "This upward trend is no accident. You're doing the work! 💪",
    ],
    trendDown: [
      "Rough patch? Champions adjust and come back stronger. 💪",
      "Dips are temporary. Your comeback will be legendary. 🔥",
      "This is just data. Use it to fuel your next breakthrough. 📊",
    ],
  };

  // Priority: Streak > Trend > Productivity
  if (context.streak >= 7) {
    return messages.highStreak[Math.floor(Math.random() * messages.highStreak.length)];
  }
  
  if (context.streak === 0) {
    return messages.lowStreak[Math.floor(Math.random() * messages.lowStreak.length)];
  }

  if (context.recentTrend === 'up') {
    return messages.trendUp[Math.floor(Math.random() * messages.trendUp.length)];
  }

  if (context.recentTrend === 'down') {
    return messages.trendDown[Math.floor(Math.random() * messages.trendDown.length)];
  }

  if (context.todayProductivity >= 85) {
    return messages.highProductivity[Math.floor(Math.random() * messages.highProductivity.length)];
  }

  if (context.todayProductivity < 50 && context.todayProductivity > 0) {
    return messages.lowProductivity[Math.floor(Math.random() * messages.lowProductivity.length)];
  }

  return "Focus on progress, not perfection. You've got this! 💪";
}

/**
 * Calculate productivity trend
 */
export function calculateTrend(recentScores: number[]): 'up' | 'down' | 'stable' {
  if (recentScores.length < 2) return 'stable';

  const recent = recentScores.slice(-3);
  const older = recentScores.slice(-6, -3);

  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}
