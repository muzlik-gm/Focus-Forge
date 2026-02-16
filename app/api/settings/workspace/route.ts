import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Settings Workspace API endpoint
 * 
 * PATCH /api/settings/workspace - Update workspace settings
 * 
 * Requirements: 8.2
 */

// Validation schema for workspace update
const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100).optional(),
  defaultFocusDuration: z.number().min(5).max(120).optional(),
});

/**
 * PATCH /api/settings/workspace
 * Update workspace settings
 * 
 * Body parameters:
 * - name: Workspace name
 * - defaultFocusDuration: Default focus session duration in minutes
 * 
 * Requirements: 8.2
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update workspace settings',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = workspaceSchema.safeParse(body);

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

    const { name, defaultFocusDuration } = validationResult.data;

    // Check if user belongs to a workspace
    if (!session.user.workspaceId) {
      // Create a new workspace for the user
      const workspace = await prisma.workspace.create({
        data: {
          name: name || `${session.user.name}'s Workspace`,
          ownerId: session.user.id,
          members: {
            connect: { id: session.user.id },
          },
        },
      });

      // Update user with workspace
      await prisma.user.update({
        where: { id: session.user.id },
        data: { workspaceId: workspace.id },
      });

      return NextResponse.json({
        workspace,
        message: 'Workspace created successfully',
      });
    }

    // Update workspace
    const workspace = await prisma.workspace.update({
      where: { id: session.user.workspaceId },
      data: {
        name,
      },
    });

    return NextResponse.json({
      workspace,
      message: 'Workspace updated successfully',
    });
  } catch (error) {
    console.error('Workspace update error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating workspace',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/settings/workspace
 * Get current workspace settings
 * 
 * Requirements: 8.2
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
            message: 'You must be logged in to view workspace settings',
          },
        },
        { status: 401 }
      );
    }

    // Get workspace
    if (!session.user.workspaceId) {
      return NextResponse.json({
        workspace: null,
        message: 'No workspace found',
      });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: session.user.workspaceId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Workspace retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving workspace',
        },
      },
      { status: 500 }
    );
  }
}