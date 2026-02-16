import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/billing';

/**
 * Billing Webhook API endpoint
 * 
 * POST /api/billing/webhook - Handle Stripe webhook events
 * 
 * Requirements: 9.7, 32
 */

/**
 * POST /api/billing/webhook
 * Handle Stripe webhook events
 * 
 * Stripe sends webhook events for:
 * - checkout.session.completed: Subscription created
 * - customer.subscription.updated: Subscription updated
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_failed: Payment failed
 * 
 * Requirements: 9.7
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_SIGNATURE',
            message: 'Missing Stripe signature',
          },
        },
        { status: 400 }
      );
    }

    // Handle the webhook
    const success = await handleWebhook(body, signature);

    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: 'WEBHOOK_FAILED',
            message: 'Failed to process webhook',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while processing webhook',
        },
      },
      { status: 500 }
    );
  }
}