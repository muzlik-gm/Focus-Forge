import { prisma } from '@/lib/prisma';
import { FocusSession } from '@prisma/client';

/**
 * AI Insights Generation Service (Rule-Based for MVP)
 * 
 * Generates productivity insights based on patterns in focus session data.
 * For MVP, uses rule-based logic rather than actual AI/ML models.
 * 
 * Requirements: 5.5, 28
 */

export interface Insight {
  id: string;
  type: 'productivity' | 'distraction' | 'streak' | 'time-of-day';
  title: string;
  message: string;
  actionable: boolean;
}

/**
 * Generate insights based on user's productivity patterns
 * 
 * Analyzes focus session data to identify patterns and generate
 * actionable recommendations. Uses rule-based logic for MVP.
 * 
 * @param userId - ID of the user
 * @param dateRange - Number of days to analyze (default: 30)
 * @returns Array of insights
 * 
 * Requirements: 5.5, 28
 */
export async function generateInsights(
  userId: string,
  dateRange: number = 30
): Promise<Insight[]> {
  const insights: Insight[] = [];

  // Calculate date range
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - dateRange);
  startDate.setHours(0, 0, 0, 0);

  // Fetch sessions for analysis
  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      completed: true,
      startTime: {
        gte: startDate,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Insufficient data check
  if (sessions.length < 3) {
    insights.push({
      id: 'insufficient-data',
      type: 'productivity',
      title: 'Keep Building Your Data',
      message: 'Complete more focus sessions to unlock personalized insights about your productivity patterns.',
      actionable: false,
    });
    return insights;
  }

  // Analyze time of day patterns
  const timeOfDayInsight = analyzeTimeOfDay(sessions);
  if (timeOfDayInsight) {
    insights.push(timeOfDayInsight);
  }

  // Analyze distraction patterns
  const distractionInsight = analyzeDistractions(sessions);
  if (distractionInsight) {
    insights.push(distractionInsight);
  }

  // Analyze session length patterns
  const sessionLengthInsight = analyzeSessionLength(sessions);
  if (sessionLengthInsight) {
    insights.push(sessionLengthInsight);
  }

  // Analyze consistency patterns
  const consistencyInsight = analyzeConsistency(sessions, dateRange);
  if (consistencyInsight) {
    insights.push(consistencyInsight);
  }

  // Analyze weekly patterns
  const weeklyInsight = analyzeWeeklyPatterns(sessions);
  if (weeklyInsight) {
    insights.push(weeklyInsight);
  }

  return insights;
}

/**
 * Analyze time of day patterns to identify peak productivity hours
 */
function analyzeTimeOfDay(sessions: FocusSession[]): Insight | null {
  // Group sessions by hour
  const hourlyData: Record<number, { count: number; totalMinutes: number }> = {};

  sessions.forEach((session) => {
    const hour = session.startTime.getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { count: 0, totalMinutes: 0 };
    }
    hourlyData[hour].count++;
    hourlyData[hour].totalMinutes += session.durationMinutes;
  });

  // Find peak hour
  let peakHour = 0;
  let maxMinutes = 0;

  Object.entries(hourlyData).forEach(([hour, data]) => {
    if (data.totalMinutes > maxMinutes) {
      maxMinutes = data.totalMinutes;
      peakHour = parseInt(hour);
    }
  });

  if (maxMinutes === 0) return null;

  // Determine time of day label
  let timeLabel = '';
  if (peakHour >= 5 && peakHour < 12) {
    timeLabel = 'mornings';
  } else if (peakHour >= 12 && peakHour < 17) {
    timeLabel = 'afternoons';
  } else if (peakHour >= 17 && peakHour < 21) {
    timeLabel = 'evenings';
  } else {
    timeLabel = 'late nights';
  }

  return {
    id: 'time-of-day',
    type: 'time-of-day',
    title: 'Peak Productivity Time',
    message: `You're most productive in the ${timeLabel}. Schedule your most important work during this time for maximum focus.`,
    actionable: true,
  };
}

/**
 * Analyze distraction patterns to provide recommendations
 */
function analyzeDistractions(sessions: FocusSession[]): Insight | null {
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distractionCount, 0);
  const avgDistractions = totalDistractions / sessions.length;

  if (avgDistractions < 1) {
    return {
      id: 'low-distractions',
      type: 'distraction',
      title: 'Excellent Focus',
      message: `You're maintaining great focus with an average of ${avgDistractions.toFixed(1)} distractions per session. Keep up the good work!`,
      actionable: false,
    };
  } else if (avgDistractions >= 3) {
    return {
      id: 'high-distractions',
      type: 'distraction',
      title: 'Reduce Distractions',
      message: `You're averaging ${avgDistractions.toFixed(1)} distractions per session. Try silencing notifications and creating a dedicated workspace to improve focus.`,
      actionable: true,
    };
  } else {
    return {
      id: 'moderate-distractions',
      type: 'distraction',
      title: 'Good Focus Control',
      message: `You're managing distractions well with ${avgDistractions.toFixed(1)} per session. Consider implementing a distraction log to identify patterns.`,
      actionable: true,
    };
  }
}

/**
 * Analyze session length patterns
 */
function analyzeSessionLength(sessions: FocusSession[]): Insight | null {
  const avgDuration = sessions.reduce((sum, s) => sum + s.durationMinutes, 0) / sessions.length;

  if (avgDuration < 25) {
    return {
      id: 'short-sessions',
      type: 'productivity',
      title: 'Extend Your Sessions',
      message: `Your average session is ${Math.round(avgDuration)} minutes. Try gradually increasing to 25-50 minutes for deeper focus and better results.`,
      actionable: true,
    };
  } else if (avgDuration > 90) {
    return {
      id: 'long-sessions',
      type: 'productivity',
      title: 'Consider Shorter Sessions',
      message: `Your sessions average ${Math.round(avgDuration)} minutes. Breaking work into 50-90 minute blocks with breaks can improve sustained focus.`,
      actionable: true,
    };
  } else {
    return {
      id: 'optimal-sessions',
      type: 'productivity',
      title: 'Optimal Session Length',
      message: `Your ${Math.round(avgDuration)}-minute sessions are in the sweet spot for deep work. This duration maximizes focus without burnout.`,
      actionable: false,
    };
  }
}

/**
 * Analyze consistency patterns
 */
function analyzeConsistency(sessions: FocusSession[], dateRange: number): Insight | null {
  // Count unique days with sessions
  const uniqueDays = new Set(
    sessions.map((s) => s.startTime.toISOString().split('T')[0])
  ).size;

  const consistencyRate = uniqueDays / dateRange;

  if (consistencyRate >= 0.7) {
    return {
      id: 'high-consistency',
      type: 'streak',
      title: 'Impressive Consistency',
      message: `You've worked ${uniqueDays} out of the last ${dateRange} days. Your consistency is building strong productivity habits!`,
      actionable: false,
    };
  } else if (consistencyRate >= 0.4) {
    return {
      id: 'moderate-consistency',
      type: 'streak',
      title: 'Build Your Streak',
      message: `You've worked ${uniqueDays} days in the last ${dateRange}. Try setting a daily goal to increase consistency and build momentum.`,
      actionable: true,
    };
  } else {
    return {
      id: 'low-consistency',
      type: 'streak',
      title: 'Start Small',
      message: `Focus on completing just one session per day. Small, consistent efforts compound into significant results over time.`,
      actionable: true,
    };
  }
}

/**
 * Analyze weekly patterns (weekday vs weekend)
 */
function analyzeWeeklyPatterns(sessions: FocusSession[]): Insight | null {
  let weekdayMinutes = 0;
  let weekendMinutes = 0;
  let weekdayCount = 0;
  let weekendCount = 0;

  sessions.forEach((session) => {
    const dayOfWeek = session.startTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      weekendMinutes += session.durationMinutes;
      weekendCount++;
    } else {
      weekdayMinutes += session.durationMinutes;
      weekdayCount++;
    }
  });

  if (weekdayCount === 0 && weekendCount === 0) return null;

  const weekdayAvg = weekdayCount > 0 ? weekdayMinutes / weekdayCount : 0;
  const weekendAvg = weekendCount > 0 ? weekendMinutes / weekendCount : 0;

  if (weekendAvg > weekdayAvg * 1.5 && weekendCount >= 3) {
    return {
      id: 'weekend-warrior',
      type: 'productivity',
      title: 'Weekend Warrior',
      message: 'You focus more on weekends. Consider blocking time during weekdays to balance your productivity throughout the week.',
      actionable: true,
    };
  } else if (weekdayAvg > weekendAvg * 2 && weekdayCount >= 5) {
    return {
      id: 'weekday-focused',
      type: 'productivity',
      title: 'Weekday Focus',
      message: 'You maintain strong weekday focus. Remember to rest on weekends to prevent burnout and maintain long-term productivity.',
      actionable: true,
    };
  }

  return null;
}
