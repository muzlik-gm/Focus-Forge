import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasFeatureAccess } from '@/lib/billing';

/**
 * Feature Access Middleware
 * 
 * Provides middleware to check subscription tier and block access
 * to Pro/Team features for Free users.
 * 
 * Requirements: 9.6, 36
 */

export type FeatureTier = 'FREE' | 'PRO' | 'TEAM';

export interface FeatureConfig {
  requiredTier: FeatureTier;
  featureName: string;
  upgradeMessage?: string;
}

/**
 * Check if user has access to a feature
 * 
 * @param userId - ID of the user
 * @param requiredTier - Minimum required tier
 * @returns Object with access status and reason
 */
export async function checkFeatureAccess(
  userId: string,
  requiredTier: FeatureTier
): Promise<{ hasAccess: boolean; reason?: string }> {
  const hasAccess = await hasFeatureAccess(userId, requiredTier);

  if (!hasAccess) {
    return {
      hasAccess: false,
      reason: `This feature requires a ${requiredTier} subscription. Please upgrade to access.`,
    };
  }

  return { hasAccess: true };
}

/**
 * Create a Next.js middleware function for feature access
 * 
 * @param featureConfig - Feature configuration
 * @returns Middleware function
 * 
 * Requirements: 9.6, 36
 */
export function createFeatureMiddleware(featureConfig: FeatureConfig) {
  return async function featureAccessMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check feature access
    const { hasAccess, reason } = await checkFeatureAccess(
      session.user.id,
      featureConfig.requiredTier
    );

    if (!hasAccess) {
      // Redirect to upgrade page with message
      const url = new URL('/pricing', request.url);
      url.searchParams.set('upgrade', 'true');
      url.searchParams.set('reason', encodeURIComponent(reason || ''));
      return NextResponse.redirect(url);
    }

    return null;
  };
}

/**
 * Feature access check for API routes
 * 
 * @param request - Next.js request
 * @param requiredTier - Minimum required tier
 * @returns Response if access denied, null if access granted
 */
export async function verifyFeatureAccess(
  request: NextRequest,
  requiredTier: FeatureTier
): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access this feature',
        },
      },
      { status: 401 }
    );
  }

  const { hasAccess, reason } = await checkFeatureAccess(
    session.user.id,
    requiredTier
  );

  if (!hasAccess) {
    return NextResponse.json(
      {
        error: {
          code: 'FEATURE_ACCESS_DENIED',
          message: reason,
          requiredTier,
        },
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Feature definitions for common features
 * 
 * Requirements: 9.6, 36
 */
export const FEATURES = {
  API_KEYS: {
    requiredTier: 'PRO' as FeatureTier,
    featureName: 'API Keys',
    upgradeMessage: 'Generate API keys to integrate Forgrin with your tools.',
  },
  AI_INSIGHTS: {
    requiredTier: 'PRO' as FeatureTier,
    featureName: 'AI Insights',
    upgradeMessage: 'Get AI-powered productivity insights and recommendations.',
  },
  ADVANCED_ANALYTICS: {
    requiredTier: 'PRO' as FeatureTier,
    featureName: 'Advanced Analytics',
    upgradeMessage: 'Access detailed analytics and custom reports.',
  },
  TEAM_FEATURES: {
    requiredTier: 'TEAM' as FeatureTier,
    featureName: 'Team Collaboration',
    upgradeMessage: 'Collaborate with your team and track team progress.',
  },
  SSO: {
    requiredTier: 'TEAM' as FeatureTier,
    featureName: 'Single Sign-On',
    upgradeMessage: 'Enterprise SSO for secure team access.',
  },
  UNLIMITED_WORKSPACES: {
    requiredTier: 'PRO' as FeatureTier,
    featureName: 'Unlimited Workspaces',
    upgradeMessage: 'Create and manage multiple workspaces.',
  },
  DATA_EXPORT: {
    requiredTier: 'PRO' as FeatureTier,
    featureName: 'Data Export',
    upgradeMessage: 'Export your data in various formats.',
  },
} as const;

/**
 * Check if a feature is accessible for a user
 * 
 * @param userId - User ID
 * @param featureName - Name of the feature
 * @returns Access status
 */
export async function isFeatureAccessible(
  userId: string,
  featureName: keyof typeof FEATURES
): Promise<boolean> {
  const feature = FEATURES[featureName];
  if (!feature) return false;

  const { hasAccess } = await checkFeatureAccess(userId, feature.requiredTier);
  return hasAccess;
}