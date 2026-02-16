import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';

// Initialize Stripe (will fail gracefully if not configured)
let stripe: any;

function initStripe() {
  try {
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover',
      });
    } else {
      // Mock stripe for development
      stripe = {
        customers: { create: async () => ({ id: 'cus_mock' }) },
        checkout: { sessions: { create: async () => ({ url: null }) } },
        billingPortal: { sessions: { create: async () => ({ url: null }) } },
        subscriptions: { retrieve: async () => ({ items: { data: [] } }) },
        webhooks: { constructEvent: () => ({ type: '', data: { object: {} } }) },
      };
    }
  } catch (_e) {
    stripe = {
      customers: { create: async () => ({ id: 'cus_mock' }) },
      checkout: { sessions: { create: async () => ({ url: null }) } },
      billingPortal: { sessions: { create: async () => ({ url: null }) } },
      subscriptions: { retrieve: async () => ({ items: { data: [] } }) },
      webhooks: { constructEvent: () => ({ type: '', data: { object: {} } }) },
    };
  }
}

initStripe();

/**
 * Stripe Billing Integration
 * 
 * Provides functions for subscription management:
 * - createCheckoutSession: Create Stripe checkout session
 * - createPortalSession: Create Stripe customer portal session
 * - handleWebhook: Handle Stripe webhook events
 * - getSubscriptionStatus: Get current subscription status
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.7, 32
 */

export const STRIPE_PRICES = {
  PRO_MONTHLY: 'price_pro_monthly',
  PRO_YEARLY: 'price_pro_yearly',
  TEAM_MONTHLY: 'price_team_monthly',
  TEAM_YEARLY: 'price_team_yearly',
} as const;

export const SUBSCRIPTION_TIERS = {
  PRO_MONTHLY: { tier: 'PRO' as const, interval: 'monthly' },
  PRO_YEARLY: { tier: 'PRO' as const, interval: 'yearly' },
  TEAM_MONTHLY: { tier: 'TEAM' as const, interval: 'monthly' },
  TEAM_YEARLY: { tier: 'TEAM' as const, interval: 'yearly' },
} as const;

/**
 * Create a Stripe customer for a user
 * 
 * @param userId - ID of the user
 * @param email - User's email
 * @param name - User's name
 * @returns The Stripe customer ID
 * 
 * Requirements: 9.1, 32
 */
export async function createStripeCustomer(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Create a Stripe checkout session for subscription
 * 
 * @param userId - ID of the user
 * @param priceId - Stripe price ID for the subscription
 * @param successUrl - URL to redirect after successful checkout
 * @param cancelUrl - URL to redirect after cancelled checkout
 * @returns The checkout session URL
 * 
 * Requirements: 9.1, 9.2
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
      },
    });

    return session.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

/**
 * Create a Stripe customer portal session
 * 
 * @param userId - ID of the user
 * @param returnUrl - URL to return to after leaving the portal
 * @returns The portal session URL
 * 
 * Requirements: 9.3
 */
export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: 'customer_id_placeholder',
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    return null;
  }
}

/**
 * Handle Stripe webhook events
 * 
 * @param body - Raw request body
 * @param signature - Stripe signature header
 * @returns True if handled successfully
 * 
 * Requirements: 9.7, 32
 */
export async function handleWebhook(
  body: string,
  signature: string
): Promise<boolean> {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    return true;
  } catch (error) {
    console.error('Error handling webhook:', error);
    return false;
  }
}

/**
 * Handle checkout completed event
 */
async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const subscriptionId = session.subscription;
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  
  let tier: SubscriptionTier = 'FREE';
  if (priceId?.includes('pro')) tier = 'PRO';
  if (priceId?.includes('team')) tier = 'TEAM';

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
    },
  });
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id);
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed for invoice:', invoice.id);
}

/**
 * Get subscription status for a user
 * 
 * @param userId - ID of the user
 * @returns Subscription status information
 * 
 * Requirements: 9.1
 */
export async function getSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return {
    tier: user.subscriptionTier,
    isPro: user.subscriptionTier === 'PRO' || user.subscriptionTier === 'TEAM',
    isTeam: user.subscriptionTier === 'TEAM',
  };
}

/**
 * Check if user has access to a feature based on their tier
 * 
 * @param userId - ID of the user
 * @param requiredTier - Minimum required tier
 * @returns True if user has access
 * 
 * Requirements: 9.6, 36
 */
export async function hasFeatureAccess(
  userId: string,
  requiredTier: 'FREE' | 'PRO' | 'TEAM'
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return false;
  }

  const tierHierarchy = { FREE: 0, PRO: 1, TEAM: 2 };
  const userTier = tierHierarchy[user.subscriptionTier];
  const requiredTierLevel = tierHierarchy[requiredTier];

  return userTier >= requiredTierLevel;
}

export { stripe };