import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateWeeklyAnalytics } from '@/lib/analytics';

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

    return NextResponse.json(analytics, { status: 200 });
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
