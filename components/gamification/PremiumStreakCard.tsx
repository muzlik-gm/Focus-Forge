'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface PremiumStreakCardProps {
  currentStreak: number;
  className?: string;
}

// === Burning Flame — CSS keyframe animation, single icon, always visible ===
// The flame has 4 separate "tongues" each on different timing offsets,
// creating a realistic fire animation that looks like a GIF.
function AnimatedFlame({ size = 80 }: { size?: number }) {
  return (
    <>
      <style>{`
        @keyframes flicker-a {
          0%   { d: path("M22 44 C18 36 14 28 18 18 C20 14 23 10 22 6 C26 10 28 16 27 22 C30 18 31 13 30 8 C35 14 36 22 34 28 C37 24 38 20 37 15 C42 22 43 32 40 38 C38 42 34 45 30 46 C26 47 23 46 22 44Z"); opacity: 1; }
          25%  { d: path("M23 44 C19 35 13 27 17 16 C19 12 24 9 23 5 C27 9 29 15 28 22 C31 17 32 12 31 7 C36 13 37 22 35 29 C38 25 39 21 38 15 C43 22 44 33 41 39 C39 43 35 46 31 47 C27 48 24 47 23 44Z"); opacity: 0.95; }
          50%  { d: path("M21 43 C17 34 12 26 16 15 C18 11 22 8 21 4 C25 8 27 14 26 20 C29 16 30 11 29 6 C34 12 35 21 33 28 C36 23 37 19 36 14 C41 21 42 31 39 37 C37 41 33 44 29 45 C25 46 22 45 21 43Z"); opacity: 1; }
          75%  { d: path("M22 44 C18 36 15 27 19 17 C21 13 24 11 23 7 C27 11 29 17 28 23 C31 19 32 14 31 9 C36 15 37 23 35 30 C38 26 39 22 38 17 C43 24 44 34 41 40 C39 44 35 47 31 48 C27 49 23 48 22 44Z"); opacity: 0.92; }
          100% { d: path("M22 44 C18 36 14 28 18 18 C20 14 23 10 22 6 C26 10 28 16 27 22 C30 18 31 13 30 8 C35 14 36 22 34 28 C37 24 38 20 37 15 C42 22 43 32 40 38 C38 42 34 45 30 46 C26 47 23 46 22 44Z"); opacity: 1; }
        }
        @keyframes flicker-b {
          0%   { d: path("M26 42 C23 35 21 27 24 20 C26 15 29 12 28 8 C31 12 32 18 31 24 C33 19 34 15 33 10 C37 16 37 24 35 30 C33 38 30 43 26 42Z"); opacity: 0.85; }
          33%  { d: path("M27 41 C24 33 22 25 25 18 C27 13 31 10 30 6 C33 10 34 16 33 22 C35 17 36 13 35 8 C39 14 39 22 37 28 C35 36 32 42 27 41Z"); opacity: 0.9; }
          66%  { d: path("M25 43 C22 35 20 26 23 19 C25 14 28 11 27 7 C30 11 31 17 30 23 C32 18 33 14 32 9 C36 15 36 23 34 29 C32 37 29 44 25 43Z"); opacity: 0.8; }
          100% { d: path("M26 42 C23 35 21 27 24 20 C26 15 29 12 28 8 C31 12 32 18 31 24 C33 19 34 15 33 10 C37 16 37 24 35 30 C33 38 30 43 26 42Z"); opacity: 0.85; }
        }
        @keyframes flicker-c {
          0%   { d: path("M28 38 C26 32 25 25 27 19 C29 14 31 11 30 7 C33 11 33 17 32 22 C34 17 35 13 34 9 C37 14 37 21 35 27 C33 34 30 39 28 38Z"); opacity: 0.7; }
          50%  { d: path("M29 37 C27 30 26 23 28 16 C30 11 33 8 32 4 C35 8 35 14 34 19 C36 14 37 10 36 6 C39 11 39 18 37 24 C35 31 32 38 29 37Z"); opacity: 0.75; }
          100% { d: path("M28 38 C26 32 25 25 27 19 C29 14 31 11 30 7 C33 11 33 17 32 22 C34 17 35 13 34 9 C37 14 37 21 35 27 C33 34 30 39 28 38Z"); opacity: 0.7; }
        }
        @keyframes flicker-core {
          0%   { opacity: 0.9; transform: scaleY(1); }
          25%  { opacity: 1; transform: scaleY(1.05); }
          50%  { opacity: 0.85; transform: scaleY(0.95); }
          75%  { opacity: 0.95; transform: scaleY(1.02); }
          100% { opacity: 0.9; transform: scaleY(1); }
        }
        @keyframes ember-float {
          0%   { transform: translate(0px, 0px) scale(1); opacity: 0.9; }
          50%  { transform: translate(-2px, -8px) scale(0.7); opacity: 0.6; }
          100% { transform: translate(1px, -16px) scale(0.3); opacity: 0; }
        }
        .flame-layer-a {
          animation: flicker-a 1.4s ease-in-out infinite;
        }
        .flame-layer-b {
          animation: flicker-b 1.1s ease-in-out infinite 0.2s;
        }
        .flame-layer-c {
          animation: flicker-c 0.9s ease-in-out infinite 0.4s;
        }
        .flame-core {
          animation: flicker-core 0.7s ease-in-out infinite 0.1s;
          transform-origin: bottom center;
        }
        .ember-1 { animation: ember-float 1.8s ease-out infinite 0.0s; }
        .ember-2 { animation: ember-float 2.1s ease-out infinite 0.5s; }
        .ember-3 { animation: ember-float 1.5s ease-out infinite 1.0s; }
        .ember-4 { animation: ember-float 2.4s ease-out infinite 0.3s; }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Glow under flame */}
        <ellipse cx="30" cy="52" rx="14" ry="4" fill="#f97316" opacity="0.3" />

        {/* Outer flame — deepest orange */}
        <path
          className="flame-layer-a"
          d="M22 44 C18 36 14 28 18 18 C20 14 23 10 22 6 C26 10 28 16 27 22 C30 18 31 13 30 8 C35 14 36 22 34 28 C37 24 38 20 37 15 C42 22 43 32 40 38 C38 42 34 45 30 46 C26 47 23 46 22 44Z"
          fill="#ea580c"
        />

        {/* Mid flame — bright orange */}
        <path
          className="flame-layer-b"
          d="M26 42 C23 35 21 27 24 20 C26 15 29 12 28 8 C31 12 32 18 31 24 C33 19 34 15 33 10 C37 16 37 24 35 30 C33 38 30 43 26 42Z"
          fill="#f97316"
        />

        {/* Inner flame — amber */}
        <path
          className="flame-layer-c"
          d="M28 38 C26 32 25 25 27 19 C29 14 31 11 30 7 C33 11 33 17 32 22 C34 17 35 13 34 9 C37 14 37 21 35 27 C33 34 30 39 28 38Z"
          fill="#fbbf24"
        />

        {/* White-hot core */}
        <path
          className="flame-core"
          d="M29 35 C27 30 27 24 29 19 C30 16 31 14 30 11 C32 14 33 19 32 24 C33 20 34 17 33 14 C35 18 35 23 34 27 C33 32 31 36 29 35Z"
          fill="#fef9c3"
          opacity="0.9"
        />

        {/* Embers */}
        <circle className="ember-1" cx="24" cy="20" r="1.2" fill="#fb923c" />
        <circle className="ember-2" cx="32" cy="15" r="0.9" fill="#fbbf24" />
        <circle className="ember-3" cx="27" cy="12" r="1.0" fill="#f97316" />
        <circle className="ember-4" cx="35" cy="18" r="0.8" fill="#fed7aa" />
      </svg>
    </>
  );
}

export function PremiumStreakCard({ currentStreak, className = '' }: PremiumStreakCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#000000', '#ffffff', '#f97316', '#fbbf24'],
        ticks: 200,
        shapes: ['square']
      });
    }
  }, [currentStreak]);

  const nextMilestone = currentStreak < 3 ? 3 : currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : currentStreak < 30 ? 30 : currentStreak < 50 ? 50 : currentStreak < 100 ? 100 : currentStreak + 50;
  const progress = currentStreak > 0 ? Math.min((currentStreak / nextMilestone) * 100, 100) : 0;
  const daysLeft = nextMilestone - currentStreak;

  const getTierName = (n: number) => {
    if (n >= 100) return 'LEGENDARY';
    if (n >= 50) return 'MASTER';
    if (n >= 30) return 'EXPERT';
    if (n >= 14) return 'COMMITTED';
    if (n >= 7) return 'BUILDING';
    if (n >= 3) return 'IGNITION';
    return 'OFFLINE';
  };

  const getTierLevel = (n: number) => {
    if (n >= 100) return 6;
    if (n >= 50) return 5;
    if (n >= 30) return 4;
    if (n >= 14) return 3;
    if (n >= 7) return 2;
    if (n >= 3) return 1;
    return 0;
  };

  const tier = getTierName(currentStreak);
  const level = getTierLevel(currentStreak);

  return (
    <div className={cn('w-full', className)}>
      {/* Neo-Brutalist container: hard black border, offset shadow, white/black palette + orange accent */}
      <div
        className="bg-black border-4 border-black relative overflow-hidden"
        style={{ boxShadow: '8px 8px 0px #f97316' }}
      >
        {/* Orange top accent bar */}
        <div className="h-1.5 w-full bg-orange-500" />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-4 border-zinc-800">
            <div className="flex items-center gap-5">
              {/* The single animated flame icon — always burns the same way */}
              <div
                className="w-20 h-20 bg-zinc-900 border-4 border-zinc-700 flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '4px 4px 0px #f97316' }}
              >
                <AnimatedFlame size={52} />
              </div>

              <div>
                <div className="text-orange-500 text-[10px] font-bold uppercase tracking-tight mb-1">
                  CURRENT STREAK
                </div>
                <h3 className="text-white text-3xl font-bold uppercase tracking-tight italic leading-none mb-3">
                  {currentStreak > 0 ? 'On Fire' : 'Get Started'}
                </h3>
                <div className="flex gap-2">
                  <span
                    className="px-2.5 py-1 bg-orange-500 text-black text-[10px] font-black uppercase tracking-wider border-2 border-black"
                    style={{ boxShadow: '2px 2px 0px #000' }}
                  >
                    {tier}
                  </span>
                  <span
                    className="px-2.5 py-1 bg-zinc-800 text-orange-400 text-[10px] font-black uppercase tracking-wider border-2 border-zinc-600"
                  >
                    LVL {level}
                  </span>
                </div>
              </div>
            </div>

            {/* Status badge */}
            {mounted && (
              <div
                className={cn(
                  'hidden sm:flex items-center gap-2 px-3 py-2 border-2 border-black text-[10px] font-bold uppercase tracking-tight',
                  currentStreak > 0
                    ? 'bg-orange-500 text-black'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                )}
                style={currentStreak > 0 ? { boxShadow: '3px 3px 0px #000' } : {}}
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    currentStreak > 0 ? 'bg-black animate-pulse' : 'bg-zinc-600'
                  )}
                />
                {currentStreak > 0 ? 'ACTIVE' : 'INACTIVE'}
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            {/* Big streak number */}
            <div className="flex-shrink-0">
              <div className="flex items-baseline gap-3">
                <span className="font-bold leading-none tabular-nums text-white"
                  style={{
                    fontSize: 'clamp(5rem, 13vw, 8rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {currentStreak}
                </span>
                <span className="text-3xl font-bold uppercase text-zinc-500 tracking-tight italic">
                  DAYS
                </span>
              </div>
              <div
                className="mt-3 inline-block bg-zinc-900 border-2 border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-tight text-zinc-300"
              >
                {currentStreak === 0 && 'START YOUR FIRST SESSION'}
                {currentStreak === 1 && 'FIRST DAY — KEEP GOING'}
                {currentStreak > 1 && currentStreak < 7 && `${daysLeft} DAYS TO 1 WEEK`}
                {currentStreak >= 7 && currentStreak < 30 && 'BUILDING A REAL HABIT'}
                {currentStreak >= 30 && 'UNSTOPPABLE MOMENTUM'}
              </div>
            </div>

            {/* Progress section */}
            {currentStreak > 0 && (
              <div className="flex-1 w-full">
                {/* Neo-brutalist progress bar */}
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                    NEXT MILESTONE
                  </span>
                  <span className="text-orange-500 font-black text-sm">{nextMilestone} DAYS</span>
                </div>
                <div
                  className="h-6 w-full bg-zinc-900 border-2 border-zinc-700 relative overflow-hidden"
                >
                  <div
                    className="h-full bg-orange-500 border-r-2 border-black transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-white">
                    {Math.round(progress)}%
                  </span>
                </div>

                {/* Milestone dots */}
                <div className="flex justify-between mt-5">
                  {[3, 7, 14, 30, 50, 100].map((m) => (
                    <div key={m} className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          'w-7 h-7 border-2 border-black flex items-center justify-center text-[9px] font-black transition-all duration-500',
                          currentStreak >= m
                            ? 'bg-orange-500 text-black'
                            : 'bg-zinc-900 text-zinc-600 border-zinc-700'
                        )}
                        style={currentStreak >= m ? { boxShadow: '2px 2px 0px #000' } : {}}
                      >
                        {currentStreak >= m ? '✓' : m}
                      </div>
                      <span className={cn('text-[8px] font-black uppercase', currentStreak >= m ? 'text-orange-500' : 'text-zinc-700')}>
                        {m}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent strip */}
        <div className="bg-zinc-900 border-t-4 border-zinc-800 px-6 md:px-8 py-3 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            FORGRIN · FOCUS STREAK
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
            {currentStreak > 0 ? `🔥 ${currentStreak} DAY${currentStreak !== 1 ? 'S' : ''}` : 'NO STREAK YET'}
          </span>
        </div>
      </div>
    </div>
  );
}
