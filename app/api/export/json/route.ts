import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exportUserData } from '@/lib/export';

/**
 * Data Export JSON API endpoint
 * 
 * GET /api/export/json - Export all user data as JSON
 * 
 * Requirements: 34
 */

/**
 * GET /api/export/json
 * Export all user data as JSON
 * 
 * Returns user profile, tasks, focus sessions, and weekly reviews.
 * Excludes sensitive data like password hashes.
 * 
 * Requirements: 34
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
            message: 'You must be logged in to export data',
          },
        },
        { status: 401 }
      );
    }

    // Export user data
    const data = await exportUserData(session.user.id);

    if (!data) {
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

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="focusforge-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while exporting data',
        },
      },
      { status: 500 }
    );
  }
}