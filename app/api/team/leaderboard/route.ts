import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Team Leaderboard API endpoint
 * 
 * GET /api/team/leaderboard - Weekly leaderboard
 * 
 * Requirements: 6.2, 26
 */

interface LeaderboardEntry {
  userId: string;
  name: string;
  focusMinutes: number;
  rank: number;
  trend: 'UP' | 'DOWN' | 'SAME';
}

/**
 * Calculate the start of the current week (Monday at 00:00:00)
 */
function getWeekStartDate(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  
  return monday;
}

/**
 * Calculate the start of the previous week
 */
function getPreviousWeekStartDate(): Date {
  const currentWeekStart = getWeekStartDate();
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);
  
  return previousWeekStart;
}

/**
 * GET /api/team/leaderboard
 * Get weekly leaderboard ranked by focus hours
 * 
 * Query parameters:
 * - weekStartDate: Optional ISO date string for the week start (defaults to current week)
 * 
 * Returns leaderboard entries with rank, name, focus minutes, and trend indicator.
 * 
 * Requirements: 6.2, 26
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view the leaderboard',
          },
        },
        { status: 401 }
      );
    }

    // Check if user belongs to a workspace
    if (!session.user.workspaceId) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_WORKSPACE',
            message: 'You must belong to a workspace to view the leaderboard',
          },
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const weekStartParam = searchParams.get('weekStartDate');
    
    // Determine week start date
    const weekStartDate = weekStartParam ? new Date(weekStartParam) : getWeekStartDate();
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 7);

    // Get workspace members
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: session.user.workspaceId,
      },
      include: {
        members: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        {
          error: {
            code: 'WORKSPACE_NOT_FOUND',
            message: 'Workspace not found',
          },
        },
        { status: 404 }
      );
    }

    // Hide leaderboard if workspace has fewer than 2 members (Requirement 26.6)
    if (workspace.members.length < 2) {
      return NextResponse.json({ 
        leaderboard: [],
        message: 'Leaderboard requires at least 2 team members',
      });
    }

    // Calculate focus minutes for each member for the current week
    const currentWeekStats = await Promise.all(
      workspace.members.map(async (member) => {
        const sessions = await prisma.focusSession.findMany({
          where: {
            userId: member.id,
            completed: true,
            startTime: {
              gte: weekStartDate,
              lt: weekEndDate,
            },
          },
        });

        const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);

        return {
          userId: member.id,
          name: member.name,
          focusMinutes: totalMinutes,
        };
      })
    );

    // Calculate focus minutes for the previous week to determine trend
    const previousWeekStart = getPreviousWeekStartDate();
    const previousWeekEnd = new Date(previousWeekStart);
    previousWeekEnd.setDate(previousWeekStart.getDate() + 7);

    const previousWeekStats = await Promise.all(
      workspace.members.map(async (member) => {
        const sessions = await prisma.focusSession.findMany({
          where: {
            userId: member.id,
            completed: true,
            startTime: {
              gte: previousWeekStart,
              lt: previousWeekEnd,
            },
          },
        });

        const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);

        return {
          userId: member.id,
          focusMinutes: totalMinutes,
        };
      })
    );

    // Create a map of previous week stats for easy lookup
    const previousWeekMap = new Map(
      previousWeekStats.map((stat) => [stat.userId, stat.focusMinutes])
    );

    // Sort by focus minutes (descending) and assign ranks
    const sortedStats = currentWeekStats.sort((a, b) => b.focusMinutes - a.focusMinutes);

    const leaderboard: LeaderboardEntry[] = sortedStats.map((stat, index) => {
      const previousMinutes = previousWeekMap.get(stat.userId) || 0;
      
      let trend: 'UP' | 'DOWN' | 'SAME' = 'SAME';
      if (stat.focusMinutes > previousMinutes) {
        trend = 'UP';
      } else if (stat.focusMinutes < previousMinutes) {
        trend = 'DOWN';
      }

      return {
        userId: stat.userId,
        name: stat.name,
        focusMinutes: stat.focusMinutes,
        rank: index + 1,
        trend,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving the leaderboard',
        },
      },
      { status: 500 }
    );
  }
}
