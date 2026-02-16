import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { acceptInvitation, getInvitation } from '@/lib/invitations';

/**
 * Team Invitation Accept API endpoint
 * 
 * POST /api/team/accept - Accept invitation
 * 
 * Requirements: 6.4, 27
 */

// Validation schema for accepting invitation
const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * POST /api/team/accept
 * Accept a workspace invitation
 * 
 * Validates the invitation token and adds the user to the workspace.
 * The user must be authenticated and their email must match the invitation.
 * 
 * Requirements: 6.4, 27.3
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
            message: 'You must be logged in to accept invitations',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = acceptInviteSchema.safeParse(body);

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

    const { token } = validationResult.data;

    // Verify invitation exists and is valid
    const invitation = await getInvitation(token);

    if (!invitation) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INVITATION',
            message: 'Invitation is invalid, expired, or already accepted',
          },
        },
        { status: 400 }
      );
    }

    // Accept the invitation
    const success = await acceptInvitation(token, session.user.id);

    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVITATION_FAILED',
            message: 'Failed to accept invitation. Your email may not match the invitation.',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        workspaceId: invitation.workspaceId,
        message: 'Successfully joined the workspace',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Invitation acceptance error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while accepting the invitation',
        },
      },
      { status: 500 }
    );
  }
}
