import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createWorkspace } from '@/lib/workspaces';

/**
 * API Route: Create New Workspace
 * 
 * POST /api/workspaces
 * BODY: { name: string }
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: { message: 'Unauthorized' } },
                { status: 401 }
            );
        }

        // Verify user has permission (TEAM plan or trial)
        if (session.user.subscriptionTier === 'FREE') {
            return NextResponse.json(
                { error: { message: 'Upgrade to Team plan to create workspaces' } },
                { status: 403 }
            );
        }

        const { name } = await req.json();

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: { message: 'Workspace name must be at least 2 characters' } },
                { status: 400 }
            );
        }

        const workspace = await createWorkspace({
            name: name.trim(),
            ownerId: session.user.id,
        });

        return NextResponse.json({ workspace });
    } catch (error: any) {
        console.error('Error creating workspace:', error);
        return NextResponse.json(
            { error: { message: 'Failed to create workspace' } },
            { status: 500 }
        );
    }
}
