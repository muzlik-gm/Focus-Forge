import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sync/pull
 * Returns cloud data for the desktop to pull and use locally:
 * - Tasks (for display in the desktop timer/task picker)
 * - User settings / profile
 * - Notification preferences
 * - Recent completed focus sessions (for analytics)
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
        }

        // Fetch tasks from cloud
        const tasks = await prisma.task.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 100,
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                estimatedMinutes: true,
                tags: true,
                createdAt: true,
                completedAt: true,
            },
        });

        // Fetch user profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                subscriptionTier: true,
                workspace: { select: { id: true, name: true } },
            },
        });

        // Fetch notification preferences
        const notifPrefs = await prisma.notificationPreferences.findUnique({
            where: { userId: session.user.id },
        });

        // Fetch recent cloud focus sessions (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const cloudSessions = await prisma.focusSession.findMany({
            where: {
                userId: session.user.id,
                startTime: { gte: thirtyDaysAgo },
            },
            orderBy: { startTime: 'desc' },
            take: 50,
            select: {
                id: true,
                startTime: true,
                endTime: true,
                durationMinutes: true,
                completed: true,
                notes: true,
                distractionCount: true,
            },
        });

        return NextResponse.json({
            success: true,
            pulledAt: new Date().toISOString(),
            data: {
                tasks,
                user,
                notificationPreferences: notifPrefs
                    ? {
                        emailNotifications: notifPrefs.emailNotifications,
                        browserNotifications: notifPrefs.browserNotifications,
                        weeklySummary: notifPrefs.weeklySummary,
                        teamUpdates: notifPrefs.teamUpdates,
                    }
                    : null,
                recentFocusSessions: cloudSessions,
            },
        });
    } catch (error) {
        console.error('Sync pull error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Sync pull failed' } },
            { status: 500 }
        );
    }
}
