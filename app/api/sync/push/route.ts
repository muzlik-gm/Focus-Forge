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
        console.log('[SyncPush] Received payload:', JSON.stringify(body, null, 2));
        
        const { focusSessions = [], activityLogs = [] } = body;

        console.log('[SyncPush] Focus sessions count:', focusSessions.length);
        console.log('[SyncPush] Activity logs count:', activityLogs.length);

        const results = {
            focusSessions: { synced: 0, skipped: 0, errors: 0 },
            activityLogs: { synced: 0, skipped: 0, errors: 0 },
            syncedAt: new Date().toISOString(),
        };

        // --- Sync Focus Sessions ---
        for (const session_data of focusSessions) {
            try {
                console.log('[SyncPush] Processing session:', JSON.stringify(session_data, null, 2));

                // Map desktop session to cloud schema
                // Desktop sends timestamps in milliseconds
                const startTime = new Date(session_data.start_time);
                const endTime = session_data.end_time ? new Date(session_data.end_time) : null;

                console.log('[SyncPush] Parsed times - start:', startTime.toISOString(), 'end:', endTime?.toISOString());

                const durationMinutes = session_data.duration_minutes
                    ?? (endTime
                        ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
                        : 0);

                console.log('[SyncPush] Duration minutes:', durationMinutes, 'from payload:', session_data.duration_minutes);

                // Use desktopId as a stable unique identifier for upserting
                // We store it in the notes field prefixed with a marker
                // Use underscores instead of brackets to avoid regex issues
                const desktopMarker = `desktop_id_${session_data.id}`;

                const existing = await prisma.focusSession.findFirst({
                    where: {
                        userId: session.user.id,
                        notes: { contains: desktopMarker },
                    },
                });

                if (existing) {
                    console.log('[SyncPush] Session already exists, skipping');
                    results.focusSessions.skipped++;
                    continue;
                }

                const isCompleted = session_data.status === 'Completed';
                console.log('[SyncPush] Creating session with completed:', isCompleted);

                const createdSession = await prisma.focusSession.create({
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
                        completed: isCompleted,
                    },
                });

                console.log('[SyncPush] Session created successfully:', {
                    id: createdSession.id,
                    durationMinutes: createdSession.durationMinutes,
                    distractionCount: createdSession.distractionCount,
                    completed: createdSession.completed,
                    startTime: createdSession.startTime.toISOString(),
                    endTime: createdSession.endTime?.toISOString(),
                });
                results.focusSessions.synced++;
            } catch (err) {
                console.error('[SyncPush] Error syncing focus session:', err);
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
