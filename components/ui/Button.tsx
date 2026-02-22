import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-electric-blue hover:bg-blue-700 text-white',
    secondary: 'bg-transparent border border-zinc-700 text-white hover:bg-zinc-800',
    ghost: 'hover:bg-zinc-800 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    icon: 'bg-transparent rounded-full',
  };

  const sizes = {
    sm: variant === 'icon' ? 'h-8 w-8' : 'px-3 py-1.5 text-sm',
    md: variant === 'icon' ? 'h-10 w-10' : 'px-4 py-2 text-base',
    lg: variant === 'icon' ? 'h-12 w-12' : 'px-6 py-3 text-lg',
  };

  const hoverStyles = variant !== 'icon' ? 'hover:shadow-md' : '';
  const activeStyles = variant !== 'icon' ? 'active:shadow-inner' : '';
  const focusStyles = variant !== 'icon' ? 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-electric-blue' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${hoverStyles} ${activeStyles} ${focusStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
