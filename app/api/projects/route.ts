import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanFeatures } from '@/lib/subscription';
import { SubscriptionTier } from '@prisma/client';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const projects = await prisma.project.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('[PROJECTS_GET]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, description, type, apps, color } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check plan limits
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { subscriptionTier: true }
        });

        const tier = user?.subscriptionTier || SubscriptionTier.FREE;
        const features = getPlanFeatures(tier);

        const projectCount = await prisma.project.count({
            where: { userId: session.user.id }
        });

        if (projectCount >= features.projectsLimit) {
            return NextResponse.json({
                error: `Project limit reached for ${tier} plan. Please upgrade to create more projects.`
            }, { status: 403 });
        }

        // Enforce app limit per project
        const sanitizedApps = apps?.slice(0, features.appsPerProjectLimit) || [];

        const project = await prisma.project.create({
            data: {
                name,
                description,
                type,
                apps: sanitizedApps,
                color: color || '#3b82f6',
                userId: session.user.id,
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('[PROJECTS_POST]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
