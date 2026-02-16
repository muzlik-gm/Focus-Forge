import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession, STRIPE_PRICES } from '@/lib/billing';
import { z } from 'zod';

/**
 * Billing Checkout API endpoint
 * 
 * POST /api/billing/checkout - Create Stripe checkout session
 * 
 * Requirements: 9.1, 9.2
 */

// Validation schema for checkout
const checkoutSchema = z.object({
  priceId: z.enum([
    STRIPE_PRICES.PRO_MONTHLY,
    STRIPE_PRICES.PRO_YEARLY,
    STRIPE_PRICES.TEAM_MONTHLY,
    STRIPE_PRICES.TEAM_YEARLY,
  ]),
});

/**
 * POST /api/billing/checkout
 * Create a Stripe checkout session for subscription
 * 
 * Body parameters:
 * - priceId: Stripe price ID for the subscription
 * 
 * Requirements: 9.2
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
            message: 'You must be logged in to subscribe',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { priceId } = validationResult.data;

    // Get base URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/settings?success=true`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      session.user.id,
      priceId,
      successUrl,
      cancelUrl
    );

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          error: {
            code: 'CHECKOUT_FAILED',
            message: 'Failed to create checkout session',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout session error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating checkout session',
        },
      },
      { status: 500 }
    );
  }
}