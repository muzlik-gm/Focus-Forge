import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createWeeklyReview, getAllWeeklyReviews } from '@/lib/reviews';
import { z } from 'zod';

/**
 * Weekly Review API endpoints
 * 
 * GET /api/reviews - List all weekly reviews for the user
 * POST /api/reviews - Create a new weekly review
 * 
 * Requirements: 7.4, 7.5, 7.6
 */

// Validation schema for creating a review
const createReviewSchema = z.object({
  weekStartDate: z.string().datetime('Invalid date format'),
  reflection: z.string().max(5000, 'Reflection is too long').optional(),
});

/**
 * GET /api/reviews
 * List all weekly reviews for the authenticated user
 * 
 * Requirements: 7.4
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view reviews',
          },
        },
        { status: 401 }
      );
    }

    // Get all reviews for the user
    const reviews = await getAllWeeklyReviews(session.user.id);

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Weekly reviews retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving weekly reviews',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Create a new weekly review
 * 
 * Body parameters:
 * - weekStartDate: Start date of the week (ISO 8601 format)
 * - reflection: Optional reflection text
 * 
 * Requirements: 7.4, 7.6
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
            message: 'You must be logged in to create reviews',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createReviewSchema.safeParse(body);

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

    const { weekStartDate, reflection } = validationResult.data;

    // Create the weekly review
    const review = await createWeeklyReview({
      userId: session.user.id,
      weekStartDate: new Date(weekStartDate),
      reflection,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Weekly review creation error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating the weekly review',
        },
      },
      { status: 500 }
    );
  }
}