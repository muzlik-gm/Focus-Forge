import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveOnboardingGoals } from '@/lib/onboarding';
import { z } from 'zod';

/**
 * Onboarding Goals API endpoint
 * 
 * POST /api/onboarding/goals - Save user's onboarding goals
 * 
 * Requirements: 30
 */

// Validation schema for goals
const goalsSchema = z.object({
  goals: z.array(
    z.enum([
      'productivity',
      'focus',
      'task_management',
      'team_collaboration',
      'work_life_balance',
      'goal_tracking',
    ])
  ),
});

/**
 * POST /api/onboarding/goals
 * Save the user's selected onboarding goals
 * 
 * Body parameters:
 * - goals: Array of selected goal IDs
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
            message: 'You must be logged in to save goals',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = goalsSchema.safeParse(body);

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

    const { goals } = validationResult.data;

    // Save goals
    const success = await saveOnboardingGoals(session.user.id, goals);

    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: 'SAVE_FAILED',
            message: 'Failed to save goals',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error('Onboarding goals save error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while saving goals',
        },
      },
      { status: 500 }
    );
  }
}