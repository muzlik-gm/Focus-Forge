import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateWeeklyAnalytics } from '@/lib/analytics';

/**
 * Weekly Review Data Access Layer
 * 
 * Provides functions for weekly review management:
 * - createWeeklyReview: Create a new weekly review
 * - getWeeklyReview: Retrieve a review for a specific week
 * - updateWeeklyReview: Update review reflection and AI summary
 * - generateWeeklySummary: Generate AI summary based on weekly metrics
 * 
 * Requirements: 7.4, 7.5, 7.6
 */

export interface CreateWeeklyReviewInput {
  userId: string;
  weekStartDate: Date;
  reflection?: string;
}

export interface UpdateWeeklyReviewInput {
  reflection?: string;
  aiSummary?: string;
}

export interface WeeklyReviewWithMetrics {
  id: string;
  userId: string;
  weekStartDate: Date;
  totalFocusMinutes: number;
  tasksCompleted: number;
  averageDistractions: number;
  reflection: string | null;
  aiSummary: string | null;
  createdAt: Date;
}

/**
 * Create or get existing weekly review
 * 
 * Creates a new weekly review for the specified week, calculating
 * metrics from sessions and tasks. If a review already exists,
 * returns the existing one.
 * 
 * @param input - Review creation data
 * @returns The created or existing weekly review with metrics
 * 
 * Requirements: 7.6
 */
export async function createWeeklyReview(input: CreateWeeklyReviewInput): Promise<WeeklyReviewWithMetrics> {
  // Check if review already exists
  const existingReview = await prisma.weeklyReview.findUnique({
    where: {
      userId_weekStartDate: {
        userId: input.userId,
        weekStartDate: input.weekStartDate,
      },
    },
  });

  if (existingReview) {
    // Return existing review with calculated metrics
    const metrics = await calculateWeeklyAnalytics(input.userId, input.weekStartDate);
    
    return {
      id: existingReview.id,
      userId: existingReview.userId,
      weekStartDate: existingReview.weekStartDate,
      totalFocusMinutes: metrics.totalFocusMinutes,
      tasksCompleted: existingReview.tasksCompleted,
      averageDistractions: metrics.distractionHeatmap.reduce((sum, d) => sum + d.count, 0),
      reflection: existingReview.reflection,
      aiSummary: existingReview.aiSummary,
      createdAt: existingReview.createdAt,
    };
  }

  // Calculate metrics for the week
  const metrics = await calculateWeeklyAnalytics(input.userId, input.weekStartDate);

  // Calculate tasks completed during the week
  const weekEndDate = new Date(input.weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  const tasksCompleted = await prisma.task.count({
    where: {
      userId: input.userId,
      status: 'DONE',
      completedAt: {
        gte: input.weekStartDate,
        lte: weekEndDate,
      },
    },
  });

  // Create new review
  const review = await prisma.weeklyReview.create({
    data: {
      userId: input.userId,
      weekStartDate: input.weekStartDate,
      totalFocusMinutes: metrics.totalFocusMinutes,
      tasksCompleted,
      averageDistractions: metrics.distractionHeatmap.reduce((sum, d) => sum + d.count, 0) / 7,
      reflection: input.reflection,
    },
  });

  return {
    id: review.id,
    userId: review.userId,
    weekStartDate: review.weekStartDate,
    totalFocusMinutes: review.totalFocusMinutes,
    tasksCompleted: review.tasksCompleted,
    averageDistractions: review.averageDistractions,
    reflection: review.reflection,
    aiSummary: review.aiSummary,
    createdAt: review.createdAt,
  };
}

/**
 * Get weekly review for a specific week
 * 
 * Retrieves the weekly review for the specified week start date.
 * If no review exists, creates one with calculated metrics.
 * 
 * @param userId - ID of the user
 * @param weekStartDate - Start date of the week (Monday)
 * @returns The weekly review with metrics
 * 
 * Requirements: 7.4
 */
export async function getWeeklyReview(
  userId: string,
  weekStartDate: Date
): Promise<WeeklyReviewWithMetrics | null> {
  const review = await prisma.weeklyReview.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate,
      },
    },
  });

  if (!review) {
    return null;
  }

  // Calculate current metrics
  const metrics = await calculateWeeklyAnalytics(userId, weekStartDate);

  return {
    id: review.id,
    userId: review.userId,
    weekStartDate: review.weekStartDate,
    totalFocusMinutes: metrics.totalFocusMinutes,
    tasksCompleted: review.tasksCompleted,
    averageDistractions: review.averageDistractions,
    reflection: review.reflection,
    aiSummary: review.aiSummary,
    createdAt: review.createdAt,
  };
}

/**
 * Update weekly review
 * 
 * Updates the reflection and/or AI summary for a weekly review.
 * 
 * @param reviewId - ID of the review to update
 * @param userId - ID of the user (for authorization)
 * @param input - Fields to update
 * @returns The updated review, or null if not found or unauthorized
 * 
 * Requirements: 7.4
 */
export async function updateWeeklyReview(
  reviewId: string,
  userId: string,
  input: UpdateWeeklyReviewInput
): Promise<WeeklyReviewWithMetrics | null> {
  try {
    // Verify the review exists and belongs to the user
    const existingReview = await prisma.weeklyReview.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!existingReview) {
      return null;
    }

    // Build update data
    const updateData: Prisma.WeeklyReviewUpdateInput = {};
    
    if (input.reflection !== undefined) {
      updateData.reflection = input.reflection;
    }
    
    if (input.aiSummary !== undefined) {
      updateData.aiSummary = input.aiSummary;
    }

    const review = await prisma.weeklyReview.update({
      where: {
        id: reviewId,
      },
      data: updateData,
    });

    // Get current metrics
    const metrics = await calculateWeeklyAnalytics(userId, review.weekStartDate);

    return {
      id: review.id,
      userId: review.userId,
      weekStartDate: review.weekStartDate,
      totalFocusMinutes: metrics.totalFocusMinutes,
      tasksCompleted: review.tasksCompleted,
      averageDistractions: review.averageDistractions,
      reflection: review.reflection,
      aiSummary: review.aiSummary,
      createdAt: review.createdAt,
    };
  } catch (error) {
    console.error('Error updating weekly review:', error);
    return null;
  }
}

/**
 * Generate AI summary for weekly review
 * 
 * Generates a summary based on the week's focus sessions and tasks.
 * For MVP, uses rule-based insights instead of actual AI.
 * 
 * @param userId - ID of the user
 * @param weekStartDate - Start date of the week
 * @returns Generated AI summary
 * 
 * Requirements: 7.5
 */
export async function generateWeeklySummary(
  userId: string,
  weekStartDate: Date
): Promise<string> {
  const metrics = await calculateWeeklyAnalytics(userId, weekStartDate);
  
  const focusHours = Math.round(metrics.totalFocusMinutes / 60 * 10) / 10;
  const topDay = metrics.dailyBreakdown.reduce((max, day) => 
    day.minutes > max.minutes ? day : max, metrics.dailyBreakdown[0]);
  const topDayName = new Date(topDay.date).toLocaleDateString('en-US', { weekday: 'long' });
  
  // Calculate peak focus hours
  const peakHours = metrics.focusByTimeOfDay
    .filter(h => h.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3)
    .map(h => {
      const hour = h.hour;
      if (hour < 12) return `${hour === 0 ? 12 : hour} AM`;
      if (hour === 12) return '12 PM';
      return `${hour - 12} PM`;
    });

  // Generate rule-based summary
  let summary = `This week you logged **${focusHours} hours** of focused work across ${metrics.dailyBreakdown.filter(d => d.minutes > 0).length} days. `;
  
  if (focusHours >= 20) {
    summary += `Outstanding productivity! You're on track for significant progress. `;
  } else if (focusHours >= 10) {
    summary += `Solid effort! Keep building on this momentum. `;
  } else {
    summary += `There's room to increase your focus time next week. `;
  }

  summary += `\n\nYour most productive day was **${topDayName}** with ${Math.round(topDay.minutes / 60 * 10) / 10} hours. `;

  if (peakHours.length > 0) {
    summary += `Your peak focus hours were around **${peakHours.join(', ')}**.`;
  }

  const totalDistractions = metrics.distractionHeatmap.reduce((sum, d) => sum + d.count, 0);
  if (totalDistractions > 0) {
    summary += `\n\nYou logged ${totalDistractions} distraction${totalDistractions > 1 ? 's' : ''} this week.`;
  }

  return summary;
}

/**
 * Get all weekly reviews for a user
 * 
 * Retrieves all weekly reviews for a user, ordered by week start date descending.
 * 
 * @param userId - ID of the user
 * @returns Array of weekly reviews
 * 
 * Requirements: 7.4
 */
export async function getAllWeeklyReviews(userId: string): Promise<WeeklyReviewWithMetrics[]> {
  const reviews = await prisma.weeklyReview.findMany({
    where: {
      userId,
    },
    orderBy: {
      weekStartDate: 'desc',
    },
  });

  // Get metrics for each review
  const reviewsWithMetrics = await Promise.all(
    reviews.map(async (review) => {
      const metrics = await calculateWeeklyAnalytics(userId, review.weekStartDate);
      
      return {
        id: review.id,
        userId: review.userId,
        weekStartDate: review.weekStartDate,
        totalFocusMinutes: metrics.totalFocusMinutes,
        tasksCompleted: review.tasksCompleted,
        averageDistractions: review.averageDistractions,
        reflection: review.reflection,
        aiSummary: review.aiSummary,
        createdAt: review.createdAt,
      };
    })
  );

  return reviewsWithMetrics;
}