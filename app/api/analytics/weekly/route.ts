import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateWeeklyAnalytics, calculateStreak } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/analytics/weekly
 * 
 * Returns weekly analytics for the authenticated user:
 * - Total focus minutes for the week
 * - Daily breakdown of focus minutes
 * - Distraction heatmap by day and hour
 * - Focus distribution by time of day
 * 
 * Query parameters:
 * - weekStartDate: ISO date string for the Monday of the week (required)
 * 
 * Requirements: 5.6, 5.7
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get weekStartDate from query parameters
    const { searchParams } = new URL(request.url);
    const weekStartDateParam = searchParams.get('weekStartDate');

    if (!weekStartDateParam) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'weekStartDate query parameter is required',
            details: { weekStartDate: ['Must provide a valid ISO date string'] }
          } 
        },
        { status: 400 }
      );
    }

    // Parse and validate date
    const weekStartDate = new Date(weekStartDateParam);
    
    if (isNaN(weekStartDate.getTime())) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid date format',
            details: { weekStartDate: ['Must be a valid ISO date string'] }
          } 
        },
        { status: 400 }
      );
    }

    // Set time to start of day (Monday 00:00:00)
    weekStartDate.setHours(0, 0, 0, 0);

    // Calculate weekly analytics
    const analytics = await calculateWeeklyAnalytics(session.user.id, weekStartDate);

    // Calculate additional metrics
    const sessions = await prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
        completed: true,
        startTime: {
          gte: weekStartDate,
          lte: new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalSessions = sessions.length;
    const avgSessionMinutes = totalSessions > 0 
      ? Math.round(analytics.totalFocusMinutes / totalSessions) 
      : 0;

    // Calculate streak
    const streak = await calculateStreak(session.user.id);

    // Transform focusByTimeOfDay to include percentage
    const maxMinutes = Math.max(...analytics.focusByTimeOfDay.map(h => h.minutes), 1);
    const focusByTimeOfDay = analytics.focusByTimeOfDay.map(h => ({
      hour: h.hour,
      percentage: Math.round((h.minutes / maxMinutes) * 100),
    }));

    return NextResponse.json({
      totalFocusMinutes: analytics.totalFocusMinutes,
      avgSessionMinutes,
      totalSessions,
      dailyBreakdown: analytics.dailyBreakdown,
      focusByTimeOfDay,
      streak,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching weekly analytics:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to calculate weekly analytics' 
        } 
      },
      { status: 500 }
    );
  }
}
