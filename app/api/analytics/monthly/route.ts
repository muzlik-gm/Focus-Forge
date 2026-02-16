import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateMonthlyAnalytics } from '@/lib/analytics';

/**
 * GET /api/analytics/monthly
 * 
 * Returns monthly analytics with comparison to previous month:
 * - Daily focus minutes for current month
 * - Daily focus minutes for previous month
 * - Total focus minutes for both months
 * 
 * Query parameters:
 * - month: Month in YYYY-MM format (required)
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

    // Get month from query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'month query parameter is required',
            details: { month: ['Must provide a month in YYYY-MM format'] }
          } 
        },
        { status: 400 }
      );
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid month format',
            details: { month: ['Must be in YYYY-MM format (e.g., 2024-01)'] }
          } 
        },
        { status: 400 }
      );
    }

    // Validate that the month is a valid date
    const [, monthNum] = month.split('-').map(Number);
    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid month value',
            details: { month: ['Month must be between 01 and 12'] }
          } 
        },
        { status: 400 }
      );
    }

    // Calculate monthly analytics
    const analytics = await calculateMonthlyAnalytics(session.user.id, month);

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('Error fetching monthly analytics:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to calculate monthly analytics' 
        } 
      },
      { status: 500 }
    );
  }
}
