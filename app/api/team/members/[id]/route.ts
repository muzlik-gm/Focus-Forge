import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { removeMember } from '@/lib/workspaces';
import { prisma } from '@/lib/prisma';

/**
 * Team Member Management API endpoint
 * 
 * DELETE /api/team/members/[id] - Remove member
 * 
 * Requirements: 27.4
 */

/**
 * DELETE /api/team/members/[id]
 * Remove a member from the workspace
 * 
 * Only workspace owners can remove members.
 * Members cannot remove themselves (they should leave instead).
 * 
 * Requirements: 27.4
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to remove members',
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
            message: 'You must belong to a workspace to remove members',
          },
        },
        { status: 400 }
      );
    }

    // Verify user is the workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: session.user.workspaceId,
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

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Only workspace owners can remove members',
          },
        },
        { status: 403 }
      );
    }

    const memberIdToRemove = params.id;

    // Prevent owner from removing themselves
    if (memberIdToRemove === session.user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'CANNOT_REMOVE_SELF',
            message: 'Workspace owners cannot remove themselves',
          },
        },
        { status: 400 }
      );
    }

    // Remove the member
    const success = await removeMember(session.user.workspaceId, memberIdToRemove);

    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Member not found in this workspace',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Member removed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Member removal error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while removing the member',
        },
      },
      { status: 500 }
    );
  }
}
