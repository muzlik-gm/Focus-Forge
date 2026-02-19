import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input 
      className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:border-blue-600 focus:outline-none ${className}`}
      {...props}
    />
  );
}
