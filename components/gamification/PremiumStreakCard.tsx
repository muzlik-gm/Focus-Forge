'use client';

import { motion, useAnimation } from 'framer-motion';
import { Flame, Trophy, Crown, Star, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PremiumStreakCardProps {
  currentStreak: number;
  className?: string;
}

export function PremiumStreakCard({ currentStreak, className = '' }: PremiumStreakCardProps) {
  const [mounted, setMounted] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setMounted(true);
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#000000', '#ffffff', '#3b82f6', '#fbbf24'],
        ticks: 200,
        shapes: ['square']
      });
    }

    if (currentStreak >= 14) {
      controls.start({
        rotate: [0, -2, 2, -2, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      });
    }
  }, [currentStreak, controls]);

  const getTier = (streak: number) => {
    if (streak >= 100) return {
      name: 'Legendary_Node',
      icon: Crown,
      color: '#fbbf24',
      bgClass: 'bg-yellow-400',
      textClass: 'text-black',
      borderClass: 'border-yellow-400',
      shadowClass: 'shadow-[8px_8px_0px_#fbbf24]',
      level: 6
    };
    if (streak >= 50) return {
      name: 'Master_Core',
      icon: Trophy,
      color: '#a855f7',
      bgClass: 'bg-purple-500',
      textClass: 'text-white',
      borderClass: 'border-purple-500',
      shadowClass: 'shadow-[8px_8px_0px_#a855f7]',
      level: 5
    };
    if (streak >= 30) return {
      name: 'Expert_Link',
      icon: Sparkles,
      color: '#3b82f6',
      bgClass: 'bg-blue-500',
      textClass: 'text-white',
      borderClass: 'border-blue-500',
      shadowClass: 'shadow-[8px_8px_0px_#3b82f6]',
      level: 4
    };
    if (streak >= 14) return {
      name: 'Committed_Array',
      icon: Zap,
      color: '#10b981',
      bgClass: 'bg-green-500',
      textClass: 'text-black',
      borderClass: 'border-green-500',
      shadowClass: 'shadow-[8px_8px_0px_#10b981]',
      level: 3
    };
    if (streak >= 7) return {
      name: 'Building_Block',
      icon: Star,
      color: '#f59e0b',
      bgClass: 'bg-orange-500',
      textClass: 'text-black',
      borderClass: 'border-orange-500',
      shadowClass: 'shadow-[8px_8px_0px_#f59e0b]',
      level: 2
    };
    if (streak >= 3) return {
      name: 'Ignition',
      icon: Flame,
      color: '#ef4444',
      bgClass: 'bg-red-500',
      textClass: 'text-white',
      borderClass: 'border-red-500',
      shadowClass: 'shadow-[8px_8px_0px_#ef4444]',
      level: 1
    };
    return {
      name: 'Offline',
      icon: Flame,
      color: '#ffffff',
      bgClass: 'bg-zinc-100',
      textClass: 'text-black',
      borderClass: 'border-white',
      shadowClass: 'shadow-[8px_8px_0px_white]',
      level: 0
    };
  };

  const tier = getTier(currentStreak);
  const Icon = tier.icon;
  const nextMilestone = currentStreak < 3 ? 3 : currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : currentStreak < 30 ? 30 : currentStreak < 50 ? 50 : currentStreak < 100 ? 100 : currentStreak + 50;
  const progress = currentStreak > 0 ? (currentStreak / nextMilestone) * 100 : 0;
  const daysLeft = nextMilestone - currentStreak;

  // Animation intensities based on level
  const NumberAnimation = mounted && tier.level >= 2 ? {
    scale: [1, 1.05, 1],
    transition: { duration: 1.5, repeat: Infinity }
  } : {};

  const IconAnimation = mounted && tier.level >= 1 ? {
    rotate: [0, 15, -15, 0],
    scale: [1, 1.2, 1],
    transition: { duration: 1, repeat: Infinity }
  } : {};

  const ParticleWrapper: any = mounted && tier.level >= 4 ? {
    backgroundPosition: ['0% 0%', '100% 100%'],
    transition: { duration: 5, repeat: Infinity, ease: "linear" }
  } : {};

  return (
    <motion.div
      className={cn("w-full h-full", className)}
      animate={controls}
    >
      {/* Neo-Brutalist Main Container */}
      <motion.div
        className={cn(
          "relative p-8 overflow-hidden border-4 border-black ring-2 ring-black bg-black",
          tier.shadowClass
        )}
        animate={ParticleWrapper}
        style={{
          backgroundImage: tier.level >= 4 ? `repeating-linear-gradient(45deg, ${tier.color}20 0px, ${tier.color}20 2px, transparent 2px, transparent 10px)` : 'none'
        }}
      >
        <div className="relative z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-white">
            <div className="flex items-center gap-4">
              <motion.div
                className={cn(
                  "w-16 h-16 border-4 border-black flex items-center justify-center",
                  tier.bgClass
                )}
                animate={IconAnimation}
              >
                <Icon className={cn("w-8 h-8", tier.textClass)} strokeWidth={3} />
              </motion.div>
              <div>
                <h3 className="text-white text-2xl font-black uppercase tracking-tighter italic">Gamification_Drive</h3>
                <div className="flex gap-2 mt-1 relative cursor-pointer group">
                  <div className={cn("px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_black]", tier.bgClass, tier.textClass)}>
                    {tier.name}
                  </div>
                  <div className="bg-white text-black px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_black]">
                    LVL {tier.level}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden sm:block">
              <motion.div
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest border-2 border-black px-4 py-2",
                  currentStreak > 0 ? "bg-green-400 text-black" : "bg-red-500 text-white"
                )}
                animate={mounted && currentStreak > 0 ? { opacity: [1, 0.5, 1], transition: { duration: 1, repeat: Infinity } } : {}}
              >
                {currentStreak > 0 ? 'STATUS: SUSTAINING' : 'STATUS: CRITICAL FAIL'}
              </motion.div>
            </div>
          </div>

          {/* Streak Display & Intense Typography */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
            <div className="flex-1 text-center md:text-left">
              <motion.div
                className="flex items-baseline justify-center md:justify-start gap-3 mb-2"
                animate={NumberAnimation}
              >
                <span
                  className="text-[120px] lg:text-[180px] font-black leading-none tracking-tighter"
                  style={{
                    WebkitTextStroke: `4px white`,
                    color: tier.level >= 3 ? tier.color : 'black',
                    textShadow: tier.level >= 5 ? `10px 10px 0px ${tier.color}` : 'none'
                  }}
                >
                  {currentStreak}
                </span>
                <span className="text-4xl lg:text-5xl font-black uppercase text-white tracking-tighter italic" style={{ WebkitTextStroke: '2px black' }}>Days</span>
              </motion.div>
              <div className="text-white font-black uppercase tracking-widest text-sm bg-black border-2 border-white inline-block px-4 py-2 shadow-[4px_4px_0px_white]">
                {currentStreak === 0 && 'INITIALIZE LINK NOW'}
                {currentStreak === 1 && 'UPLINK ESTABLISHED'}
                {currentStreak > 1 && `MAINTAINING SUCCESSFUL CHAIN`}
              </div>
            </div>

            {/* Progress Visualizer Matrix */}
            {currentStreak > 0 && daysLeft > 0 && (
              <div className="flex-1 w-full bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black] transform rotate-1">
                <div className="flex justify-between items-end mb-4 border-b-2 border-black pb-2">
                  <span className="text-black font-black uppercase text-xl italic">Upload_Status</span>
                  <span className="text-black font-black text-3xl">{Math.round(progress)}%</span>
                </div>

                {/* Neo-brutalist Progress Bar */}
                <div className="h-10 w-full bg-zinc-200 border-4 border-black relative overflow-hidden mb-2">
                  <motion.div
                    className={cn("h-full border-r-4 border-black", tier.bgClass)}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                  />
                  {/* Glitch Overlay for high levels */}
                  {tier.level >= 4 && (
                    <motion.div
                      className="absolute inset-0 bg-white/30 mix-blend-overlay"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <div className="text-right text-[10px] font-black uppercase text-black">
                  {daysLeft} DAYS CYCLE TO TIER [{nextMilestone}]
                </div>
              </div>
            )}
          </div>

          {/* Milestones Track */}
          <div className="pt-6 border-t-4 border-white mt-4 bg-zinc-900 -mx-8 -mb-8 px-8 py-6 flex justify-between">
            {[3, 7, 14, 30, 50, 100].map((milestone) => (
              <div key={milestone} className="flex flex-col items-center gap-2 relative">
                <motion.div
                  className={cn(
                    "w-8 h-8 border-2 border-black flex items-center justify-center text-[10px] font-black z-10 transition-colors duration-500",
                    currentStreak >= milestone ? tier.bgClass : "bg-black text-white"
                  )}
                  animate={currentStreak >= milestone && tier.level >= 3 ? { rotate: [0, 90, 180, 270, 360], transition: { duration: 4, repeat: Infinity, ease: 'linear' } } : {}}
                >
                  {currentStreak >= milestone ? <Check className="w-4 h-4 text-black" /> : milestone}
                </motion.div>

                {/* Connecting Line */}
                <div className={cn(
                  "absolute top-4 left-4 w-[10vw] max-w-[80px] h-1 border-t-2 border-dashed z-0",
                  milestone === 100 ? "hidden" : "",
                  currentStreak >= milestone ? "border-white" : "border-zinc-700"
                )} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Ensure Check icon is local if not imported from lucide-react in parent scope
function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

