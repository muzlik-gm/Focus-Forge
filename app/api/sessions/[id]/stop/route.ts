import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stopSession } from '@/lib/sessions';
import { z } from 'zod';

/**
 * POST /api/sessions/[id]/stop
 * 
 * Stop and save a focus session
 * 
 * Requirements: 3.5
 */

const stopSessionSchema = z.object({
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const sessionId = params.id;

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validation = stopSessionSchema.safeParse(body);

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

    // Stop the session
    const stoppedSession = await stopSession(
      sessionId,
      session.user.id,
      validation.data
    );

    if (!stoppedSession) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found or already completed' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: stoppedSession });
  } catch (error) {
    console.error('Error stopping session:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to stop session' } },
      { status: 500 }
    );
  }
}
