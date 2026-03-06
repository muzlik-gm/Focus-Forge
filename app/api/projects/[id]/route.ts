import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const project = await prisma.project.findFirst({
            where: { id: params.id, userId: session.user.id },
        });
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(project);
    } catch (error) {
        console.error('[PROJECT_GET]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/projects/[id] — update name, description, type, apps
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Verify ownership
        const existing = await prisma.project.findFirst({
            where: { id: params.id, userId: session.user.id },
        });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const body = await req.json();
        const { name, description, type, apps, color } = body;

        const updated = await prisma.project.update({
            where: { id: params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(type !== undefined && { type }),
                ...(apps !== undefined && { apps }),
                ...(color !== undefined && { color }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('[PROJECT_PATCH]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/projects/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const existing = await prisma.project.findFirst({
            where: { id: params.id, userId: session.user.id },
        });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await prisma.project.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[PROJECT_DELETE]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
