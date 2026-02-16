import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateSessionNotes } from '@/lib/sessions';
import { z } from 'zod';

/**
 * POST /api/sessions/[id]/notes
 * 
 * Update session notes (auto-save endpoint)
 * 
 * Requirements: 3.8, 23
 */

const updateNotesSchema = z.object({
  notes: z.string(),
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
    const body = await request.json();
    const validation = updateNotesSchema.safeParse(body);

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

    // Update the session notes
    const updatedSession = await updateSessionNotes(
      sessionId,
      session.user.id,
      validation.data.notes
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found or already completed' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error updating session notes:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update session notes' } },
      { status: 500 }
    );
  }
}
