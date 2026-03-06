import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        const focusSessionId = params.id;

        // Verify ownership
        const focusSession = await prisma.focusSession.findUnique({
            where: { id: focusSessionId },
        });

        if (!focusSession) {
            return NextResponse.json(
                { error: { code: 'NOT_FOUND', message: 'Session not found' } },
                { status: 404 }
            );
        }

        if (focusSession.userId !== session.user.id) {
            return NextResponse.json(
                { error: { code: 'FORBIDDEN', message: 'Access denied' } },
                { status: 403 }
            );
        }

        await prisma.focusSession.delete({
            where: { id: focusSessionId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting session:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete session' } },
            { status: 500 }
        );
    }
}
