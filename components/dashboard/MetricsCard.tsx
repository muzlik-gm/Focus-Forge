'use client';

interface MetricsCardProps {
  label: string;
  value: string;
  unit: string;
  gradient: string;
}

/**
 * MetricsCard Component
 * 
 * Displays a single metric with large number, label, and gradient background
 * 
 * Requirements: 19
 */
export function MetricsCard({ label, value, unit, gradient }: MetricsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-white tabular-nums">
            {value}
          </span>
          <span className="text-sm text-gray-400 font-medium">
            {unit}
          </span>
        </div>
        
        <p className="text-sm text-gray-400 font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}
