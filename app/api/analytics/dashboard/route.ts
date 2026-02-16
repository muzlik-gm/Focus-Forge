import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateDashboardMetrics } from '@/lib/analytics';

/**
 * GET /api/analytics/dashboard
 * 
 * Returns dashboard metrics for the authenticated user:
 * - Today's focus minutes
 * - Today's tasks completed
 * - Active streak in days
 * - Today's distractions
 * - Weekly focus data (last 7 days)
 * 
 * Requirements: 5.6, 5.7
 */
export async function GET() {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Calculate dashboard metrics
    const metrics = await calculateDashboardMetrics(session.user.id);

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to calculate dashboard metrics' 
        } 
      },
      { status: 500 }
    );
  }
}
