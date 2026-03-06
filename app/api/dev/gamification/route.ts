import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { action, value } = await req.json();

        if (action === 'set_streak') {
            const targetStreak = parseInt(value, 10);
            if (isNaN(targetStreak)) return NextResponse.json({ error: 'Invalid value' }, { status: 400 });

            // To set the streak exactly, we ensure there is at least one session on each
            // of the last `targetStreak` days, and ZERO sessions on the day before that.

            const now = new Date();

            // Step 1: Ensure continuous sessions for the requested streak number
            for (let i = 0; i < targetStreak; i++) {
                const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 12, 0, 0); // Noon

                const dayStart = new Date(targetDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(targetDate);
                dayEnd.setHours(23, 59, 59, 999);

                // Check if session already exists for this day
                const exists = await prisma.focusSession.findFirst({
                    where: {
                        userId: session.user.id,
                        completed: true,
                        startTime: { gte: dayStart, lte: dayEnd }
                    }
                });

                if (!exists) {
                    await prisma.focusSession.create({
                        data: {
                            userId: session.user.id,
                            startTime: targetDate,
                            endTime: new Date(targetDate.getTime() + 25 * 60000), // 25 mins later
                            durationMinutes: 25,
                            completed: true,
                            distractionCount: 0
                        }
                    });
                }
            }

            // Step 2: Ensure the day before the streak broke has NO sessions to stop the streak counter
            const breakingDateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - targetStreak, 0, 0, 0, 0);
            const breakingDateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - targetStreak, 23, 59, 59, 999);

            await prisma.focusSession.deleteMany({
                where: {
                    userId: session.user.id,
                    startTime: { gte: breakingDateStart, lte: breakingDateEnd }
                }
            });

            return NextResponse.json({ success: true, message: `Streak enforced to ${targetStreak} days` });
        }

        if (action === 'clear_data') {
            await prisma.focusSession.deleteMany({ where: { userId: session.user.id } });
            await prisma.userAchievement.deleteMany({ where: { userId: session.user.id } });
            return NextResponse.json({ success: true, message: 'Wiped Focus & Gamification Data' });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (err: any) {
        console.error('[DEV_GAMIFICATION]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
