'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Zap, Target, ListTodo, Users, Scale, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Goals Selection Step Component
 * 
 * Second step of onboarding - lets users select their goals.
 * 
 * Requirements: 30
 */

type OnboardingGoal = 
  | 'productivity'
  | 'focus'
  | 'task_management'
  | 'team_collaboration'
  | 'work_life_balance'
  | 'goal_tracking';

interface GoalOption {
  id: OnboardingGoal;
  title: string;
  description: string;
  icon: typeof Zap;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'productivity',
    title: 'Boost Productivity',
    description: 'Get more done in less time',
    icon: Zap,
  },
  {
    id: 'focus',
    title: 'Improve Focus',
    description: 'Reduce distractions and stay on task',
    icon: Target,
  },
  {
    id: 'task_management',
    title: 'Better Task Management',
    description: 'Organize and prioritize effectively',
    icon: ListTodo,
  },
  {
    id: 'team_collaboration',
    title: 'Team Collaboration',
    description: 'Work better with your team',
    icon: Users,
  },
  {
    id: 'work_life_balance',
    title: 'Work-Life Balance',
    description: 'Maintain healthy boundaries',
    icon: Scale,
  },
  {
    id: 'goal_tracking',
    title: 'Track Goals',
    description: 'Monitor progress on objectives',
    icon: TrendingUp,
  },
];

export function GoalsStep() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<OnboardingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleGoal = (goalId: OnboardingGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      await fetch('/api/onboarding/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: selectedGoals }),
      });
      
      router.push('/onboarding/tour');
    } catch (error) {
      console.error('Error saving goals:', error);
      router.push('/onboarding/tour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    router.push('/onboarding/welcome');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            What brings you to FocusForge?
          </h1>
          <p className="text-muted-foreground">
            Select your goals so we can personalize your experience
          </p>
        </div>

        {/* Goals grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const Icon = goal.icon;
            
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  'hover:shadow-md',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'bg-card hover:border-primary/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        'font-semibold',
                        isSelected && 'text-primary'
                      )}>
                        {goal.title}
                      </h3>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {goal.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
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
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={isLoading || selectedGoals.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <div className="w-3 h-3 rounded-full bg-primary" />
          <div className="w-3 h-3 rounded-full bg-muted" />
          <div className="w-3 h-3 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}