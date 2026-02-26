import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startSession } from '@/lib/sessions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/sessions/start
 * 
 * Start a new focus session
 * 
 * Requirements: 3.1
 */

const startSessionSchema = z.object({
  durationMinutes: z.number().int().min(1).max(480), // Max 8 hours
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = startSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Enforce duration limits based on subscription tier
    const maxDurationMinutes = user.subscriptionTier === 'FREE' ? 180 : 480; // 3 hours for free, 8 hours for paid
    
    if (validation.data.durationMinutes > maxDurationMinutes) {
      return NextResponse.json(
        {
          error: {
            code: 'DURATION_LIMIT_EXCEEDED',
            message: user.subscriptionTier === 'FREE' 
              ? 'Free plan is limited to 3-hour sessions. Upgrade to Pro for unlimited session durations.'
              : 'Maximum session duration is 8 hours',
            maxDurationMinutes,
          },
        },
        { status: 403 }
      );
    }

    // Create the session
    const focusSession = await startSession({
      userId: session.user.id,
      durationMinutes: validation.data.durationMinutes,
    });

    return NextResponse.json({ session: focusSession }, { status: 201 });
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to start session' } },
      { status: 500 }
    );
  }
}
