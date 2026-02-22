import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { createInvitation, getInvitationLink } from '@/lib/invitations';
import { prisma } from '@/lib/prisma';

/**
 * Team Invitation API endpoint
 * 
 * POST /api/team/invite - Send invitation
 * 
 * Requirements: 6.3, 27
 */

// Validation schema for invitation
const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/team/invite
 * Send a workspace invitation
 * 
 * Creates a secure invitation link and returns it.
 * Only workspace owners can send invitations.
 * 
 * Requirements: 6.3, 27.2
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to send invitations',
          },
        },
        { status: 401 }
      );
    }

    // Check if user belongs to a workspace
    let workspaceId = session.user.workspaceId;
    
    // If user has TEAM plan but no workspace, create one automatically
    if (!workspaceId && session.user.subscriptionTier === 'TEAM') {
      const workspace = await prisma.workspace.create({
        data: {
          name: `${session.user.name}'s Workspace`,
          ownerId: session.user.id,
        },
      });
      
      // Update user with workspace
      await prisma.user.update({
        where: { id: session.user.id },
        data: { workspaceId: workspace.id },
      });
      
      workspaceId = workspace.id;
    }
    
    if (!workspaceId) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_WORKSPACE',
            message: 'You must belong to a workspace to send invitations',
          },
        },
        { status: 400 }
      );
    }

    // Verify user is the workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
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
            message: 'Only workspace owners can send invitations',
          },
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = inviteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Check if user with this email already exists in the workspace
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        workspaceId: workspaceId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_MEMBER',
            message: 'User is already a member of this workspace',
          },
        },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = await createInvitation(workspaceId, email);
    const invitationLink = getInvitationLink(invitation.token);

    // In a production app, you would send an email here
    // For now, we just return the invitation link
    
    return NextResponse.json(
      {
        invitationId: invitation.id,
        invitationLink,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Invitation creation error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating the invitation',
        },
      },
      { status: 500 }
    );
  }
}
