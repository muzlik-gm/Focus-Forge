import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'standard' | 'stats' | 'task' | 'session';
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'standard',
  onClick 
}: CardProps) {
  const baseStyles = 'rounded-lg';
  
  const variants = {
    standard: 'bg-zinc-900 border border-zinc-800 p-4',
    stats: 'bg-zinc-900/50 border border-zinc-700/50 p-6 text-center',
    task: 'bg-zinc-800/50 border border-zinc-700/30 p-4 hover:bg-zinc-800/70 transition-colors',
    session: 'bg-zinc-900/80 border border-zinc-700/50 p-6 text-center',
  };

  const cursorStyle = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${cursorStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
