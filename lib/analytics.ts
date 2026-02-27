import { prisma } from '@/lib/prisma';
import { FocusSession } from '@prisma/client';

/**
 * Analytics Calculation Service
 * 
 * Provides functions for calculating productivity metrics:
 * - calculateDashboardMetrics: Calculate today's metrics for the dashboard
 * - calculateWeeklyAnalytics: Calculate weekly breakdown and patterns
 * - calculateMonthlyAnalytics: Calculate monthly comparison data
 * - calculateStreak: Calculate active streak in days
 * 
 * Requirements: 2.7, 5.6, 7.6, 40
 */

export interface DashboardMetrics {
  todayFocusMinutes: number;
  todayTasksCompleted: number;
  activeStreakDays: number;
  todayDistractions: number;
  weeklyFocusData: { date: string; minutes: number }[];
}

export interface WeeklyAnalytics {
  totalFocusMinutes: number;
  dailyBreakdown: { date: string; minutes: number }[];
  distractionHeatmap: { day: string; hour: number; count: number }[];
  focusByTimeOfDay: { hour: number; minutes: number }[];
}

export interface MonthlyAnalytics {
  currentMonth: { date: string; minutes: number }[];
  previousMonth: { date: string; minutes: number }[];
  totalCurrentMonth: number;
  totalPreviousMonth: number;
}

/**
 * Calculate dashboard metrics for today
 * 
 * Calculates:
 * - Total focus minutes completed today
 * - Number of tasks completed today
 * - Current active streak in days
 * - Total distractions logged today
 * - Weekly focus data for the last 7 days
 * 
 * @param userId - ID of the user
 * @returns Dashboard metrics object
 * 
 * Requirements: 2.7
 */
export async function calculateDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Calculate today's focus minutes
  const todaySessions = await prisma.focusSession.findMany({
    where: {
      userId,
      completed: true,
      startTime: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  console.log('[Analytics] Found today sessions:', todaySessions.length);
  todaySessions.forEach(s => {
    console.log('[Analytics]   Session:', {
      id: s.id,
      startTime: s.startTime.toISOString(),
      durationMinutes: s.durationMinutes,
      distractionCount: s.distractionCount,
      completed: s.completed,
    });
  });

  const todayFocusMinutes = todaySessions.reduce((total, session) => {
    return total + session.durationMinutes;
  }, 0);

  console.log('[Analytics] Total focus minutes:', todayFocusMinutes);

  // Calculate today's tasks completed
  const todayTasksCompleted = await prisma.task.count({
    where: {
      userId,
      status: 'DONE',
      completedAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Calculate today's distractions
  const todayDistractions = todaySessions.reduce((total, session) => {
    return total + session.distractionCount;
  }, 0);

  // Calculate active streak
  const activeStreakDays = await calculateStreak(userId);

  // Calculate weekly focus data (last 7 days)
  const weeklyFocusData = await calculateLast7DaysFocus(userId);

  return {
    todayFocusMinutes,
    todayTasksCompleted,
    activeStreakDays,
    todayDistractions,
    weeklyFocusData,
  };
}

/**
 * Calculate weekly analytics
 * 
 * Calculates:
 * - Total focus minutes for the week
 * - Daily breakdown of focus minutes
 * - Distraction heatmap by day and hour
 * - Focus distribution by time of day
 * 
 * @param userId - ID of the user
 * @param weekStartDate - Start date of the week (Monday)
 * @returns Weekly analytics object
 * 
 * Requirements: 5.6, 7.6
 */
export async function calculateWeeklyAnalytics(
  userId: string,
  weekStartDate: Date
): Promise<WeeklyAnalytics> {
  // Calculate week end date (Sunday 23:59:59)
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  // Fetch all sessions for the week
  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      completed: true,
      startTime: {
        gte: weekStartDate,
        lte: weekEndDate,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Calculate total focus minutes
  const totalFocusMinutes = sessions.reduce((total, session) => {
    return total + session.durationMinutes;
  }, 0);

  // Calculate daily breakdown
  const dailyBreakdown = calculateDailyBreakdown(sessions, weekStartDate);

  // Calculate distraction heatmap
  const distractionHeatmap = calculateDistractionHeatmap(sessions);

  // Calculate focus by time of day
  const focusByTimeOfDay = calculateFocusByTimeOfDay(sessions);

  return {
    totalFocusMinutes,
    dailyBreakdown,
    distractionHeatmap,
    focusByTimeOfDay,
  };
}

/**
 * Calculate monthly analytics with comparison to previous month
 * 
 * Calculates:
 * - Daily focus minutes for current month
 * - Daily focus minutes for previous month
 * - Total focus minutes for both months
 * 
 * @param userId - ID of the user
 * @param month - Month in YYYY-MM format
 * @returns Monthly analytics object
 * 
 * Requirements: 5.6
 */
export async function calculateMonthlyAnalytics(
  userId: string,
  month: string
): Promise<MonthlyAnalytics> {
  // Parse month string (YYYY-MM)
  const [year, monthNum] = month.split('-').map(Number);

  // Calculate current month date range
  const currentMonthStart = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
  const currentMonthEnd = new Date(year, monthNum, 0, 23, 59, 59, 999);

  // Calculate previous month date range
  const previousMonthStart = new Date(year, monthNum - 2, 1, 0, 0, 0, 0);
  const previousMonthEnd = new Date(year, monthNum - 1, 0, 23, 59, 59, 999);

  // Fetch current month sessions
  const currentMonthSessions = await prisma.focusSession.findMany({
    where: {
      userId,
      completed: true,
      startTime: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Fetch previous month sessions
  const previousMonthSessions = await prisma.focusSession.findMany({
    where: {
      userId,
      completed: true,
      startTime: {
        gte: previousMonthStart,
        lte: previousMonthEnd,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Calculate daily breakdown for current month
  const currentMonth = calculateMonthlyBreakdown(currentMonthSessions, currentMonthStart);

  // Calculate daily breakdown for previous month
  const previousMonth = calculateMonthlyBreakdown(previousMonthSessions, previousMonthStart);

  // Calculate totals
  const totalCurrentMonth = currentMonthSessions.reduce((total, session) => {
    return total + session.durationMinutes;
  }, 0);

  const totalPreviousMonth = previousMonthSessions.reduce((total, session) => {
    return total + session.durationMinutes;
  }, 0);

  return {
    currentMonth,
    previousMonth,
    totalCurrentMonth,
    totalPreviousMonth,
  };
}

/**
 * Calculate active streak in days
 * 
 * Calculates the number of consecutive days (ending with today) where
 * at least one focus session was completed. Resets to 0 if any day is missed.
 * 
 * @param userId - ID of the user
 * @returns Number of consecutive days with at least one completed session
 * 
 * Requirements: 40
 */
export async function calculateStreak(userId: string): Promise<number> {
  const now = new Date();
  let streak = 0;
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Check each day going backwards from today
  while (true) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if there's at least one completed session on this day
    const sessionCount = await prisma.focusSession.count({
      where: {
        userId,
        completed: true,
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (sessionCount > 0) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
  }

  return streak;
}

/**
 * Helper: Calculate focus minutes for the last 7 days
 */
async function calculateLast7DaysFocus(
  userId: string
): Promise<{ date: string; minutes: number }[]> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      completed: true,
      startTime: {
        gte: sevenDaysAgo,
      },
    },
  });

  // Group by date
  const dailyMinutes: Record<string, number> = {};

  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMinutes[dateStr] = 0;
  }

  sessions.forEach((session) => {
    const dateStr = session.startTime.toISOString().split('T')[0];
    if (dailyMinutes[dateStr] !== undefined) {
      dailyMinutes[dateStr] += session.durationMinutes;
    }
  });

  return Object.entries(dailyMinutes).map(([date, minutes]) => ({
    date,
    minutes,
  }));
}

/**
 * Helper: Calculate daily breakdown for a week
 */
function calculateDailyBreakdown(
  sessions: FocusSession[],
  weekStartDate: Date
): { date: string; minutes: number }[] {
  const dailyMinutes: Record<string, number> = {};

  // Initialize all 7 days with 0 minutes
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMinutes[dateStr] = 0;
  }

  // Aggregate session minutes by date
  sessions.forEach((session) => {
    const dateStr = session.startTime.toISOString().split('T')[0];
    if (dailyMinutes[dateStr] !== undefined) {
      dailyMinutes[dateStr] += session.durationMinutes;
    }
  });

  return Object.entries(dailyMinutes).map(([date, minutes]) => ({
    date,
    minutes,
  }));
}

/**
 * Helper: Calculate distraction heatmap by day and hour
 */
function calculateDistractionHeatmap(
  sessions: FocusSession[]
): { day: string; hour: number; count: number }[] {
  const heatmap: { day: string; hour: number; count: number }[] = [];

  // Initialize heatmap for all days and hours
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmap.push({
        day: dayNames[dayIndex],
        hour,
        count: 0,
      });
    }
  }

  // Count distractions by day and hour
  sessions.forEach((session) => {
    const sessionDate = new Date(session.startTime);
    const dayIndex = (sessionDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const hour = sessionDate.getHours();

    const heatmapEntry = heatmap.find(
      (entry) => entry.day === dayNames[dayIndex] && entry.hour === hour
    );

    if (heatmapEntry) {
      heatmapEntry.count += session.distractionCount;
    }
  });

  return heatmap;
}

/**
 * Helper: Calculate focus distribution by time of day
 */
function calculateFocusByTimeOfDay(
  sessions: FocusSession[]
): { hour: number; minutes: number }[] {
  const hourlyMinutes: Record<number, number> = {};

  // Initialize all 24 hours with 0 minutes
  for (let hour = 0; hour < 24; hour++) {
    hourlyMinutes[hour] = 0;
  }

  // Aggregate session minutes by hour
  sessions.forEach((session) => {
    const hour = session.startTime.getHours();
    hourlyMinutes[hour] += session.durationMinutes;
  });

  return Object.entries(hourlyMinutes).map(([hour, minutes]) => ({
    hour: parseInt(hour),
    minutes,
  }));
}

/**
 * Helper: Calculate daily breakdown for a month
 */
function calculateMonthlyBreakdown(
  sessions: FocusSession[],
  monthStart: Date
): { date: string; minutes: number }[] {
  const dailyMinutes: Record<string, number> = {};

  // Initialize all days in the month with 0 minutes
  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  ).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    dailyMinutes[dateStr] = 0;
  }

  // Aggregate session minutes by date
  sessions.forEach((session) => {
    const dateStr = session.startTime.toISOString().split('T')[0];
    if (dailyMinutes[dateStr] !== undefined) {
      dailyMinutes[dateStr] += session.durationMinutes;
    }
  });

  return Object.entries(dailyMinutes).map(([date, minutes]) => ({
    date,
    minutes,
  }));
}
