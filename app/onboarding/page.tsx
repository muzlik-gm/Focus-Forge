import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { shouldShowOnboarding } from '@/lib/onboarding';
// import { WelcomeStep } from './welcome/WelcomeStep';

/**
 * Onboarding Page
 * 
 * Main onboarding page that redirects to the appropriate step
 * based on the user's onboarding progress.
 * 
 * Requirements: 30
 */

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const showOnboarding = await shouldShowOnboarding(session.user.id);
  
  if (!showOnboarding) {
    redirect('/dashboard');
  }

  // Start with welcome step
  redirect('/onboarding/welcome');
}