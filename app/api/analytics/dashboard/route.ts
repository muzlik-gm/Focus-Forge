import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateDashboardMetrics } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/analytics/dashboard
 * 
 * Returns dashboard metrics for the authenticated user:
 * - Today's focus hours
 * - Today's tasks completed
 * - Active streak in days
 * - Today's distractions
 * - Weekly focus data (last 7 days)
 * - Today's tasks
 * 
 * Requirements: 5.6, 5.7
 */
export async function GET() {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Calculate dashboard metrics
    const metrics = await calculateDashboardMetrics(session.user.id);

    // Get today's tasks
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          lte: todayEnd,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    // Transform data to match frontend expectations
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyFocus = metrics.weeklyFocusData.map(item => {
      const date = new Date(item.date);
      return {
        day: dayNames[date.getDay()],
        hours: Math.round((item.minutes / 60) * 10) / 10, // Convert to hours with 1 decimal
      };
    });

    return NextResponse.json({
      todayFocusHours: Math.round((metrics.todayFocusMinutes / 60) * 10) / 10,
      todayTasksCompleted: metrics.todayTasksCompleted,
      currentStreak: metrics.activeStreakDays,
      todayDistractions: metrics.todayDistractions,
      weeklyFocus,
      todayTasks: todayTasks.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.status === 'DONE',
      })),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to calculate dashboard metrics' 
        } 
      },
      { status: 500 }
    );
  }
}
