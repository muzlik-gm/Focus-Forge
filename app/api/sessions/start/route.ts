import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startSession } from '@/lib/sessions';
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
