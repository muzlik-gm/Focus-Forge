import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { getTeamMembers } from '@/lib/workspaces';

/**
 * Team Members API endpoint
 * 
 * GET /api/team/members - List team members with status
 * 
 * Requirements: 6.1, 27
 */

/**
 * GET /api/team/members
 * List team members with their current status
 * 
 * Returns all members of the user's workspace with status indicators:
 * - IN_FOCUS: User has an active focus session
 * - AVAILABLE: User has no active session
 * - OFFLINE: User has no recent activity
 * 
 * Requirements: 6.1, 43
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view team members',
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
            message: 'You must belong to a workspace to view team members',
          },
        },
        { status: 400 }
      );
    }

    // Get team members with status
    const members = await getTeamMembers(session.user.workspaceId);

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Team members retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving team members',
        },
      },
      { status: 500 }
    );
  }
}
