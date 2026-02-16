'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Feature Tour Step Component
 * 
 * Third step of onboarding - provides a quick feature tour.
 * 
 * Requirements: 30
 */

interface TourStep {
  id: string;
  title: string;
  description: string;
  image?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'See your daily metrics, tasks, and quick actions at a glance.',
  },
  {
    id: 'tasks',
    title: 'Task Management',
    description: 'Drag and drop tasks between Backlog, In Progress, and Done.',
  },
  {
    id: 'focus',
    title: 'Focus Sessions',
    description: 'Start timed focus sessions with distraction tracking.',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track your productivity trends and insights over time.',
  },
  {
    id: 'team',
    title: 'Team Collaboration',
    description: 'Work together and see team member availability.',
  },
];

export function TourStep() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      setIsLoading(true);
      
      try {
        await fetch('/api/onboarding/complete', { method: 'POST' });
        router.push('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error skipping tour:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push('/onboarding/goals');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                index <= currentStep
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Tour content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 mb-4">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{step.title}</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {step.description}
          </p>
        </div>

        {/* Demo area placeholder */}
        <div className="bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 mb-8">
          <div className="aspect-video bg-background rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">
              {step.title} Preview
            </p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={isLoading}
            className="gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              'Loading...'
            ) : isLastStep ? (
              <>
                <Check className="w-4 h-4" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Skip button */}
        {!isLastStep && (
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}