import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWeeklyReview, updateWeeklyReview, generateWeeklySummary } from '@/lib/reviews';
import { z } from 'zod';

/**
 * Weekly Review API endpoint for specific week
 * 
 * GET /api/reviews/[weekStartDate] - Get review for specific week
 * PATCH /api/reviews/[weekStartDate] - Update review
 * POST /api/reviews/[weekStartDate]/generate-summary - Generate AI summary
 * 
 * Requirements: 7.4, 7.5
 */

// Validation schema for updating a review
const updateReviewSchema = z.object({
  reflection: z.string().max(5000, 'Reflection is too long').optional(),
});

/**
 * GET /api/reviews/[weekStartDate]
 * Get the weekly review for a specific week
 * 
 * Requirements: 7.4
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weekStartDate: string }> }
) {
  try {
    const { weekStartDate } = await params;

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

    // Parse and validate date
    const date = new Date(weekStartDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid date format',
          },
        },
        { status: 400 }
      );
    }

    // Get the review
    const review = await getWeeklyReview(session.user.id, date);

    if (!review) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'No review found for this week',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Weekly review retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving the weekly review',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reviews/[weekStartDate]
 * Update a weekly review (reflection)
 * 
 * Body parameters:
 * - reflection: Updated reflection text
 * 
 * Requirements: 7.4
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ weekStartDate: string }> }
) {
  try {
    const { weekStartDate } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update reviews',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateReviewSchema.safeParse(body);

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

    // Parse and validate date
    const date = new Date(weekStartDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid date format',
          },
        },
        { status: 400 }
      );
    }

    // Get the existing review first
    const existingReview = await getWeeklyReview(session.user.id, date);

    if (!existingReview) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'No review found for this week',
          },
        },
        { status: 404 }
      );
    }

    // Update the review
    const { reflection } = validationResult.data;
    const review = await updateWeeklyReview(existingReview.id, session.user.id, {
      reflection,
    });

    if (!review) {
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update the review',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Weekly review update error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating the weekly review',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews/[weekStartDate]/generate-summary
 * Generate AI summary for a weekly review
 * 
 * Requirements: 7.5
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ weekStartDate: string }> }
) {
  try {
    const { weekStartDate } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to generate summaries',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate date
    const date = new Date(weekStartDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid date format',
          },
        },
        { status: 400 }
      );
    }

    // Get the existing review first
    const existingReview = await getWeeklyReview(session.user.id, date);

    if (!existingReview) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'No review found for this week',
          },
        },
        { status: 404 }
      );
    }

    // Generate AI summary
    const aiSummary = await generateWeeklySummary(session.user.id, date);

    // Update the review with the generated summary
    const review = await updateWeeklyReview(existingReview.id, session.user.id, {
      aiSummary,
    });

    if (!review) {
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update the review with AI summary',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ review, summary: aiSummary });
  } catch (error) {
    console.error('AI summary generation error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while generating the AI summary',
        },
      },
      { status: 500 }
    );
  }
}