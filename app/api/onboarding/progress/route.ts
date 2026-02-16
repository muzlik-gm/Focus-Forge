import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateOnboardingStep } from '@/lib/onboarding';
import { z } from 'zod';

/**
 * Onboarding Progress API endpoint
 * 
 * POST /api/onboarding/progress - Update onboarding progress
 * 
 * Requirements: 30
 */

// Validation schema for progress update
const progressSchema = z.object({
  step: z.string(),
});

/**
 * POST /api/onboarding/progress
 * Update the user's onboarding progress
 * 
 * Body parameters:
 * - step: The step that was completed
 * 
 * Requirements: 30
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update onboarding progress',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = progressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { step } = validationResult.data;

    // Determine step number from step name
    const stepMap: Record<string, number> = {
      welcome_complete: 2,
      goals_complete: 3,
      tour_complete: 4,
    };

    const stepNumber = stepMap[step] || 1;

    // Update onboarding step
    const state = await updateOnboardingStep(session.user.id, stepNumber);

    if (!state) {
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update onboarding progress',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error('Onboarding progress update error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating onboarding progress',
        },
      },
      { status: 500 }
    );
  }
}