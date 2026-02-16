import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pauseSession } from '@/lib/sessions';

/**
 * POST /api/sessions/[id]/pause
 * 
 * Pause an active focus session
 * 
 * Requirements: 3.3
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

    // Pause the session
    const pausedSession = await pauseSession(sessionId, session.user.id);

    if (!pausedSession) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found or already completed' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: pausedSession });
  } catch (error) {
    console.error('Error pausing session:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to pause session' } },
      { status: 500 }
    );
  }
}
