import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPortalSession } from '@/lib/billing';

/**
 * Billing Portal API endpoint
 * 
 * POST /api/billing/portal - Create Stripe customer portal session
 * 
 * Requirements: 9.3
 */

/**
 * POST /api/billing/portal
 * Create a Stripe customer portal session for subscription management
 * 
 * Requirements: 9.3
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access billing portal',
          },
        },
        { status: 401 }
      );
    }

    // Get return URL from request body
    const body = await request.json();
    const returnUrl = body.returnUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings`;

    // Create portal session
    const portalUrl = await createPortalSession(session.user.id, returnUrl);

    if (!portalUrl) {
      return NextResponse.json(
        {
          error: {
            code: 'PORTAL_FAILED',
            message: 'Failed to create billing portal session',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Billing portal error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating billing portal session',
        },
      },
      { status: 500 }
    );
  }
}