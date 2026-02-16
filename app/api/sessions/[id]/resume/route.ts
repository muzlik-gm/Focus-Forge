import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resumeSession } from '@/lib/sessions';

/**
 * POST /api/sessions/[id]/resume
 * 
 * Resume a paused focus session
 * 
 * Requirements: 3.4
 */

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

    // Resume the session
    const resumedSession = await resumeSession(sessionId, session.user.id);

    if (!resumedSession) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found, not paused, or already completed' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: resumedSession });
  } catch (error) {
    console.error('Error resuming session:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to resume session' } },
      { status: 500 }
    );
  }
}
