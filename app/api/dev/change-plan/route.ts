import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DEV ONLY: Change User Subscription Plan
 * 
 * This endpoint is only available in development mode.
 * It allows changing the subscription tier for testing purposes.
 * 
 * POST /api/dev/change-plan
 * Body: { tier: 'FREE' | 'PRO' | 'TEAM' }
 */
export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Not found' } },
      { status: 404 }
    );
  }

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier } = body;

    // Validate tier
    const validTiers = ['FREE', 'PRO', 'TEAM'];
    if (!tier || !validTiers.includes(tier)) {
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_TIER', 
            message: `Invalid tier. Must be one of: ${validTiers.join(', ')}` 
          } 
        },
        { status: 400 }
      );
    }

    // Update user subscription tier
    const updateData: any = { 
      subscriptionTier: tier,
    };
    
    // Only set nextBillingDate if the field exists in the schema
    if (tier !== 'FREE') {
      updateData.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    } else {
      updateData.nextBillingDate = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        nextBillingDate: true,
      }
    }).catch((error) => {
      // If nextBillingDate field doesn't exist, try without it
      if (error.code === 'P2009' || error.message.includes('nextBillingDate')) {
        return prisma.user.update({
          where: { id: session.user.id },
          data: { subscriptionTier: tier },
          select: {
            id: true,
            email: true,
            name: true,
            subscriptionTier: true,
          }
        });
      }
      throw error;
    });

    return NextResponse.json({
      success: true,
      message: `Subscription tier changed to ${tier}`,
      user: updatedUser,
      // Signal that session should be refreshed
      sessionUpdate: {
        subscriptionTier: tier,
      }
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to change plan' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dev/change-plan
 * Returns current user info and available tiers
 */
export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Not found' } },
      { status: 404 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
      }
    });

    // Try to get nextBillingDate if it exists
    let nextBillingDate = null;
    try {
      const userWithBilling = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { nextBillingDate: true }
      });
      nextBillingDate = userWithBilling?.nextBillingDate;
    } catch (error) {
      // Field doesn't exist, ignore
    }

    return NextResponse.json({
      user: {
        ...user,
        nextBillingDate,
      },
      availableTiers: ['FREE', 'PRO', 'TEAM'],
      note: 'This endpoint is only available in development mode'
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user' } },
      { status: 500 }
    );
  }
}
