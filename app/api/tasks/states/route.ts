import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const statesSchema = z.object({
    states: z.array(z.string().min(1, 'State cannot be empty').max(30, 'State is too long')).min(1, 'Must have at least one state'),
});

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: userId } = session.user;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { taskStates: true } as any,
        });

        return NextResponse.json({ states: (user as any)?.taskStates || ['BACKLOG', 'IN_PROGRESS', 'DONE'] });
    } catch (error) {
        console.error('Error fetching task states:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = statesSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid states data', details: validationResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { states } = validationResult.data;
        const { id: userId } = session.user;

        // Wait for prisma compilation:
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { taskStates: states } as any,
        });

        return NextResponse.json({ states: (updatedUser as any).taskStates });
    } catch (error) {
        console.error('Error updating task states:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
