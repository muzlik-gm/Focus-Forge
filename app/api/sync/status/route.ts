import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sync/status
 * Returns the cloud sync status for the current user:
 * - Total sessions synced to cloud
 * - Last sync timestamp (derived from most recent cloud session)
 * - Whether cloud sync is available (user is authenticated)
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({
                authenticated: false,
                syncAvailable: false,
                message: 'Sign in to enable cloud sync',
            });
        }

        const [sessionCount, latestSession, taskCount] = await Promise.all([
            prisma.focusSession.count({ where: { userId: session.user.id } }),
            prisma.focusSession.findFirst({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true, startTime: true },
            }),
            prisma.task.count({ where: { userId: session.user.id } }),
        ]);

        return NextResponse.json({
            authenticated: true,
            syncAvailable: true,
            userId: session.user.id,
            email: session.user.email,
            stats: {
                cloudSessions: sessionCount,
                cloudTasks: taskCount,
            },
            lastSyncAt: latestSession?.createdAt?.toISOString() ?? null,
            message: 'Cloud sync active',
        });
    } catch (error) {
        console.error('Sync status error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to get sync status' } },
            { status: 500 }
        );
    }
}
