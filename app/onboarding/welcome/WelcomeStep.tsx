'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Welcome Step Component
 * 
 * First step of onboarding - welcomes the user and sets expectations.
 * 
 * Requirements: 30
 */

export function WelcomeStep() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    
    try {
      // Save onboarding progress and move to next step
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'welcome_complete' }),
      });
      
      router.push('/onboarding/goals');
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
      router.push('/onboarding/goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Welcome to FocusForge
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your journey to deep work starts here
            </p>
          </div>

          {/* Features cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={cn(
              'p-6 rounded-xl border bg-card text-card-foreground',
              'hover:shadow-lg transition-shadow'
            )}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">Task Management</h3>
              <p className="text-sm text-muted-foreground">
                Organize tasks with drag-and-drop Kanban boards
              </p>
            </div>
            
            <div className={cn(
              'p-6 rounded-xl border bg-card text-card-foreground',
              'hover:shadow-lg transition-shadow'
            )}>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold mb-1">Focus Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Timer-based sessions with distraction tracking
              </p>
            </div>
            
            <div className={cn(
              'p-6 rounded-xl border bg-card text-card-foreground',
              'hover:shadow-lg transition-shadow'
            )}>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-1">Smart Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Insights to optimize your productivity
              </p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>Loading...</>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for Now
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-3 h-3 rounded-full bg-muted" />
            <div className="w-3 h-3 rounded-full bg-muted" />
            <div className="w-3 h-3 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}