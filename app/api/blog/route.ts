import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Blog posts retrieval error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch blog posts' } },
      { status: 500 }
    );
  }
}
