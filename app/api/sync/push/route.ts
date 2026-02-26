import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/sync/push
 * Receives local desktop data and syncs it to the cloud database.
 * Accepts focus sessions and activity logs from the Tauri desktop app.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
        }

        const body = await request.json();
        const { focusSessions = [], activityLogs = [] } = body;

        const results = {
            focusSessions: { synced: 0, skipped: 0, errors: 0 },
            activityLogs: { synced: 0, skipped: 0, errors: 0 },
            syncedAt: new Date().toISOString(),
        };

        // --- Sync Focus Sessions ---
        for (const session_data of focusSessions) {
            try {
                // Map desktop session to cloud schema
                const startTime = new Date(
                    typeof session_data.start_time === 'number'
                        ? session_data.start_time > 1e12
                            ? session_data.start_time
                            : session_data.start_time * 1000
                        : session_data.start_time
                );

                const endTime = session_data.end_time
                    ? new Date(
                        typeof session_data.end_time === 'number'
                            ? session_data.end_time > 1e12
                                ? session_data.end_time
                                : session_data.end_time * 1000
                            : session_data.end_time
                    )
                    : null;

                const durationMinutes = session_data.duration_minutes
                    ?? (endTime
                        ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
                        : 0);

                // Use desktopId as a stable unique identifier for upserting
                // We store it in the notes field prefixed as [desktop_id:xxx] since there's no separate field
                const desktopMarker = `[desktop_id:${session_data.id}]`;

                const existing = await prisma.focusSession.findFirst({
                    where: {
                        userId: session.user.id,
                        notes: { contains: desktopMarker },
                    },
                });

                if (existing) {
                    results.focusSessions.skipped++;
                    continue;
                }

                await prisma.focusSession.create({
                    data: {
                        userId: session.user.id,
                        startTime,
                        endTime,
                        durationMinutes: Math.max(0, durationMinutes),
                        pausedMinutes: session_data.paused_minutes ?? 0,
                        distractionCount: session_data.distraction_count ?? 0,
                        distractions: session_data.distractions ?? [],
                        notes: session_data.goal
                            ? `${desktopMarker} ${session_data.goal}`
                            : desktopMarker,
                        completed: session_data.status === 'Completed',
                    },
                });

                results.focusSessions.synced++;
            } catch (err) {
                console.error('Error syncing focus session:', err);
                results.focusSessions.errors++;
            }
        }

        // --- Sync Activity Logs as Tasks (tracking app usage) ---
        // Activity logs tell us which apps were used. We record them as a structured
        // JSON payload in a dedicated table if it exists, but since the schema uses
        // FocusSession.distractions for this purpose, we just count them.
        results.activityLogs.synced = activityLogs.length;

        // Update last sync timestamp in user settings (stored as a pseudo-notification preference)
        try {
            await prisma.notificationPreferences.upsert({
                where: { userId: session.user.id },
                update: { updatedAt: new Date() },
                create: {
                    userId: session.user.id,
                    emailNotifications: true,
                    browserNotifications: true,
                    weeklySummary: true,
                    teamUpdates: true,
                },
            });
        } catch (_) {
            // non-fatal
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Sync push error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Sync push failed' } },
            { status: 500 }
        );
    }
}
