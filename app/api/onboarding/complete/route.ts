import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { completeOnboarding } from '@/lib/onboarding';

/**
 * Onboarding Complete API endpoint
 * 
 * POST /api/onboarding/complete - Mark onboarding as complete
 * 
 * Requirements: 30
 */

/**
 * POST /api/onboarding/complete
 * Mark the onboarding process as complete for the user
 * 
 * Requirements: 30
 */
export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to complete onboarding',
          },
        },
        { status: 401 }
      );
    }

    // Complete onboarding
    const success = await completeOnboarding(session.user.id);

    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: 'COMPLETION_FAILED',
            message: 'Failed to complete onboarding',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding completion error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while completing onboarding',
        },
      },
      { status: 500 }
    );
  }
}