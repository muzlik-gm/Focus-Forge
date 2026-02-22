import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const releases = await prisma.pressRelease.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ releases });
  } catch (error) {
    console.error('Press releases retrieval error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch press releases' } },
      { status: 500 }
    );
  }
}
