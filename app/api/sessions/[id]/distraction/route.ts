import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logDistraction } from '@/lib/sessions';
import { z } from 'zod';

/**
 * POST /api/sessions/[id]/distraction
 * 
 * Log a distraction during an active focus session
 * 
 * Requirements: 3.7
 */

const logDistractionSchema = z.object({
  note: z.string().optional(),
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
    const validation = logDistractionSchema.safeParse(body);

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

    // Log the distraction
    const updatedSession = await logDistraction(
      sessionId,
      session.user.id,
      validation.data
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found or already completed' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error logging distraction:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to log distraction' } },
      { status: 500 }
    );
  }
}
