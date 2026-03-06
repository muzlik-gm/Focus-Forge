import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ACHIEVEMENTS } from '@/lib/achievements';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId: session.user.id },
            include: { achievement: true },
            orderBy: { unlockedAt: 'desc' },
        });

        return NextResponse.json(userAchievements);
    } catch (error) {
        console.error('[ACHIEVEMENTS_GET]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
