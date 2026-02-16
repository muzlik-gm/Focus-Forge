import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const ActionIcon = action?.icon;
  
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">{description}</p>
      </div>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            {ActionIcon && <ActionIcon className="w-5 h-5" />}
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            {ActionIcon && <ActionIcon className="w-5 h-5" />}
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
