'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'info';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  hover?: boolean;
}

/**
 * GlassCard - Modern glassmorphism card with advanced effects
 * 
 * Features:
 * - Glassmorphism with backdrop blur
 * - Gradient borders
 * - Glow effects
 * - Smooth animations
 * - Multiple variants
 */
export function GlassCard({
  children,
  variant = 'default',
  blur = 'md',
  glow = false,
  hover = true,
  className,
  ...props
}: GlassCardProps) {
  const variants = {
    default: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      glow: 'shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]',
    },
    premium: {
      bg: 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10',
      border: 'border-purple-500/20',
      glow: 'shadow-[0_8px_32px_0_rgba(168,85,247,0.2)]',
    },
    success: {
      bg: 'bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10',
      border: 'border-green-500/20',
      glow: 'shadow-[0_8px_32px_0_rgba(34,197,94,0.2)]',
    },
    warning: {
      bg: 'bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10',
      border: 'border-orange-500/20',
      glow: 'shadow-[0_8px_32px_0_rgba(249,115,22,0.2)]',
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10',
      border: 'border-blue-500/20',
      glow: 'shadow-[0_8px_32px_0_rgba(59,130,246,0.2)]',
    },
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const config = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        'relative rounded-2xl border p-6',
        config.bg,
        config.border,
        blurClasses[blur],
        glow && config.glow,
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}
