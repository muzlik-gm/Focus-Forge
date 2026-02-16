import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInsights } from '@/lib/insights';

/**
 * GET /api/analytics/insights
 * 
 * Returns AI-generated insights based on productivity patterns.
 * For MVP, uses rule-based logic rather than actual AI/ML.
 * 
 * Query Parameters:
 * - dateRange: Number of days to analyze (default: 30)
 * 
 * Requirements: 5.5, 28
 */
export async function GET(request: Request) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const dateRange = parseInt(searchParams.get('dateRange') || '30', 10);

    // Validate date range
    if (dateRange < 1 || dateRange > 365) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Date range must be between 1 and 365 days' 
          } 
        },
        { status: 400 }
      );
    }

    // Generate insights
    const insights = await generateInsights(session.user.id, dateRange);

    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to generate insights' 
        } 
      },
      { status: 500 }
    );
  }
}
