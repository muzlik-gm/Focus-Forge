import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserSettings } from '@/lib/settings';

/**
 * Settings API endpoint
 * 
 * GET /api/settings - Get all user settings
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

/**
 * GET /api/settings
 * Get all user settings including profile, workspace, and API keys
 * 
 * Requirements: 8.1, 8.2, 8.3
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
            message: 'You must be logged in to view settings',
          },
        },
        { status: 401 }
      );
    }

    // Get user settings
    const settings = await getUserSettings(session.user.id);

    if (!settings) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving settings',
        },
      },
      { status: 500 }
    );
  }
}