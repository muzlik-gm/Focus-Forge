import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DEBUG ENDPOINT - Get all sessions for current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get ALL sessions for this user
    const allSessions = await prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 10,
    });

    console.log('[Debug] Found sessions:', allSessions.length);
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    console.log('[Debug] Today range:', {
      start: todayStart.toISOString(),
      end: todayEnd.toISOString(),
      now: now.toISOString(),
    });

    const todaySessions = allSessions.filter(s => {
      const inRange = s.startTime >= todayStart && s.startTime <= todayEnd;
      console.log('[Debug] Session:', {
        id: s.id,
        startTime: s.startTime.toISOString(),
        durationMinutes: s.durationMinutes,
        completed: s.completed,
        inRange,
      });
      return inRange;
    });

    return NextResponse.json({
      totalSessions: allSessions.length,
      todaySessions: todaySessions.length,
      todayRange: {
        start: todayStart.toISOString(),
        end: todayEnd.toISOString(),
        now: now.toISOString(),
      },
      sessions: allSessions.map(s => ({
        id: s.id,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime?.toISOString(),
        durationMinutes: s.durationMinutes,
        distractionCount: s.distractionCount,
        completed: s.completed,
        notes: s.notes,
      })),
    });
  } catch (error) {
    console.error('[Debug] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
