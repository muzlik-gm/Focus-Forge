'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: 'standard' | 'stats' | 'task' | 'session';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'standard', className = '', children, ...props }, ref) => {
    // Base styles with glassmorphism effect
    const baseStyles = 'rounded-card transition-all duration-200';
    
    // Variant styles
    const variantStyles = {
      standard: 'bg-dark-gray/80 backdrop-blur-sm border border-gray-800 p-4 shadow-lg hover:shadow-xl',
      stats: 'bg-gradient-to-br from-electric-blue/20 to-soft-purple/20 backdrop-blur-sm border border-gray-800 p-6 shadow-lg hover:shadow-xl',
      task: 'bg-dark-gray/80 backdrop-blur-sm border border-gray-800 p-3 shadow-md hover:shadow-lg',
      session: 'bg-dark-gray/80 backdrop-blur-sm border border-gray-800 p-5 shadow-lg hover:shadow-xl',
    };
    
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;
    
    return (
      <motion.div
        ref={ref}
        className={combinedClassName}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
