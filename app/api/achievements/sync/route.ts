import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ACHIEVEMENTS } from '@/lib/achievements';

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Fetch user stats to check against criteria
        const [tasksObj, sessionsObj, projectsObj, currentStreakObj] = await Promise.all([
            prisma.task.count({ where: { userId, completedAt: { not: null } } }),
            prisma.focusSession.aggregate({
                where: { userId },
                _count: { _all: true },
                _sum: { durationMinutes: true }
            }),
            prisma.project.count({ where: { userId } }),
            // For streak, we might not have a dedicated DB field yet, simulating for now
            // In a real scenario, streak tracking should rely on FocusSession grouped by day.
            Promise.resolve(0) // TODO: Implement robust streak counting
        ]);

        const stats = {
            tasks: tasksObj,
            sessions: sessionsObj._count._all,
            focusHours: (sessionsObj._sum.durationMinutes || 0) / 60,
            projects: projectsObj,
            streak: currentStreakObj // Placeholder
        };

        // Find unlocked achievements
        const existing = await prisma.userAchievement.findMany({
            where: { userId },
            select: { achievement: { select: { name: true } } }
        });

        const existingNames = new Set(existing.map(e => e.achievement.name));

        const newUnlocks = [];

        for (const ach of ACHIEVEMENTS) {
            if (!existingNames.has(ach.name)) {
                // Evaluate criteria
                let unlocked = false;
                if (ach.criteria.type === 'tasks' && stats.tasks >= ach.criteria.value) unlocked = true;
                if (ach.criteria.type === 'sessions' && stats.sessions >= ach.criteria.value) unlocked = true;
                if (ach.criteria.type === 'focusHours' && stats.focusHours >= ach.criteria.value) unlocked = true;
                if (ach.criteria.type === 'projects' && stats.projects >= ach.criteria.value) unlocked = true;

                if (unlocked) {
                    let dbAch = await prisma.achievement.findFirst({ where: { name: ach.name } });

                    if (!dbAch) {
                        dbAch = await prisma.achievement.create({
                            data: {
                                name: ach.name,
                                description: ach.description,
                                icon: ach.icon,
                                points: ach.points,
                                category: ach.category,
                                criteria: ach.criteria as any
                            }
                        });
                    }

                    await prisma.userAchievement.create({
                        data: {
                            userId,
                            achievementId: dbAch.id
                        }
                    });

                    newUnlocks.push(ach);
                }
            }
        }

        return NextResponse.json({ newUnlocks, stats });
    } catch (error) {
        console.error('[ACHIEVEMENTS_SYNC]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
