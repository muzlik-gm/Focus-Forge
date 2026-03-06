import { SubscriptionTier } from '@prisma/client';

export interface PlanFeatures {
    projectsLimit: number;
    appsPerProjectLimit: number;
    advancedAnalytics: boolean;
    teamFeatures: boolean;
    unlimitedFocus: boolean;
}

export const PLAN_FEATURES: Record<SubscriptionTier, PlanFeatures> = {
    FREE: {
        projectsLimit: 2,
        appsPerProjectLimit: 3,
        advancedAnalytics: false,
        teamFeatures: false,
        unlimitedFocus: false,
    },
    PRO: {
        projectsLimit: 10,
        appsPerProjectLimit: 10,
        advancedAnalytics: true,
        teamFeatures: false,
        unlimitedFocus: true,
    },
    TEAM: {
        projectsLimit: 999,
        appsPerProjectLimit: 999,
        advancedAnalytics: true,
        teamFeatures: true,
        unlimitedFocus: true,
    },
};

export function getPlanFeatures(tier: SubscriptionTier): PlanFeatures {
    return PLAN_FEATURES[tier] || PLAN_FEATURES.FREE;
}
