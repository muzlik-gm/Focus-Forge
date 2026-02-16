import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Settings API Key Delete API endpoint
 * 
 * DELETE /api/settings/api-keys/[id] - Revoke an API key
 * 
 * Requirements: 8.5, 31
 */

/**
 * DELETE /api/settings/api-keys/[id]
 * Revoke/delete an API key
 * 
 * Requirements: 8.5
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
            message: 'You must be logged in to revoke API keys',
          },
        },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if API key exists and belongs to user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        },
        { status: 404 }
      );
    }

    // Delete the API key
    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('API key revocation error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while revoking API key',
        },
      },
      { status: 500 }
    );
  }
}