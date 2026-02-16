'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon' | 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Variant styles
    const variantStyles = {
      primary: 'bg-electric-blue text-white hover:bg-blue-700 active:shadow-inner focus-visible:ring-electric-blue shadow-sm hover:shadow-md',
      secondary: 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:shadow-inner focus-visible:ring-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:shadow-inner focus-visible:ring-red-500 shadow-sm hover:shadow-md',
      icon: 'rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus-visible:ring-gray-400',
      default: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 active:shadow-inner focus-visible:ring-gray-400',
      outline: 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:shadow-inner focus-visible:ring-gray-400',
      ghost: 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:shadow-inner focus-visible:ring-gray-400',
    };
    
    // Size styles
    const sizeStyles = {
      sm: variant === 'icon' ? 'h-8 w-8 p-1' : 'px-3 py-1.5 text-sm rounded-lg',
      md: variant === 'icon' ? 'h-10 w-10 p-2' : 'px-4 py-2 text-base rounded-xl',
      lg: variant === 'icon' ? 'h-12 w-12 p-3' : 'px-6 py-3 text-lg rounded-xl',
    };
    
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
    
    return (
      <motion.button
        ref={ref}
        className={combinedClassName}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
