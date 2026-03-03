import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exportSessionsAsCSV, exportTasksAsCSV } from '@/lib/export';
import { z } from 'zod';

/**
 * Data Export CSV API endpoint
 * 
 * GET /api/export/csv - Export sessions and tasks as CSV
 * 
 * Requirements: 34
 */

// Validation schema for CSV export
const exportSchema = z.object({
  type: z.enum(['sessions', 'tasks']),
});

/**
 * GET /api/export/csv
 * Export sessions or tasks as CSV
 * 
 * Query parameters:
 * - type: Type of data to export (sessions or tasks)
 * 
 * Requirements: 34
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
            message: 'You must be logged in to export data',
          },
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['sessions', 'tasks'].includes(type)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid export type. Must be "sessions" or "tasks"',
          },
        },
        { status: 400 }
      );
    }

    let csv: string;
    let filename: string;

    if (type === 'sessions') {
      csv = await exportSessionsAsCSV(session.user.id);
      filename = `forgrin-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      csv = await exportTasksAsCSV(session.user.id);
      filename = `forgrin-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Return as downloadable CSV
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);

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