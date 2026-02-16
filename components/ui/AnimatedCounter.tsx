'use client';

import { useEffect, useRef, useState } from 'react';
// import { counterConfig } from '@/lib/animations';

/**
 * Animated Counter Component
 * 
 * Animates number changes with spring physics for a natural feel.
 * 
 * Requirements: 21.5
 */

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 0.5,
  format = (v) => v.toString(),
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (value === previousValue.current) return;

    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function (ease out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {format(displayValue)}
    </span>
  );
}

/**
 * Animated Duration Counter
 * 
 * Formats and animates duration values (e.g., "1h 23m").
 * 
 * Requirements: 21.5
 */

interface AnimatedDurationProps {
  minutes: number;
  className?: string;
}

export function AnimatedDuration({ minutes, className }: AnimatedDurationProps) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const formatDuration = (h: number, m: number) => {
    if (h > 0 && m > 0) {
      return `${h}h ${m}m`;
    } else if (h > 0) {
      return `${h}h`;
    } else {
      return `${m}m`;
    }
  };

  return (
    <AnimatedCounter
      value={minutes}
      format={() => formatDuration(hours, mins)}
      className={className}
    />
  );
}

/**
 * Animated Percentage Counter
 * 
 * Animates percentage values with proper formatting.
 * 
 * Requirements: 21.5
 */

interface AnimatedPercentageProps {
  value: number;
  decimals?: number;
  className?: string;
}

export function AnimatedPercentage({
  value,
  decimals = 0,
  className,
}: AnimatedPercentageProps) {
  const formatPercentage = (v: number) => {
    return `${v.toFixed(decimals)}%`;
  };

  return (
    <AnimatedCounter
      value={value}
      format={formatPercentage}
      className={className}
    />
  );
}