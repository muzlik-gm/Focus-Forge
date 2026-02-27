'use client';

interface DistractionHeatmapProps {
  data: { day: string; hour: number; count: number }[];
}

/**
 * DistractionHeatmap Component
 * 
 * Displays a heatmap showing distraction patterns by day and time
 * 
 * Requirements: 5.3
 */
export function DistractionHeatmap({ data }: DistractionHeatmapProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Find max count for color scaling
  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Get color intensity based on count
  const getColor = (count: number): string => {
    if (count === 0) return 'bg-gray-800';
    
    const intensity = count / maxCount;
    if (intensity < 0.2) return 'bg-red-900/30';
    if (intensity < 0.4) return 'bg-red-800/50';
    if (intensity < 0.6) return 'bg-red-700/70';
    if (intensity < 0.8) return 'bg-red-600/90';
    return 'bg-red-500';
  };

  // Get data for specific day and hour
  const getCount = (day: string, hour: number): number => {
    const entry = data.find(d => d.day === day && d.hour === hour);
    return entry?.count || 0;
  };

  // Format hour for display
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12am';
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return '12pm';
    return `${hour - 12}pm`;
  };

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Distraction Heatmap
        </h2>
        <p className="text-sm text-gray-400">
          Identify when distractions occur most frequently
        </p>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-24 flex-shrink-0"></div>
            <div className="flex-1 flex">
              {[0, 6, 12, 18].map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-xs text-gray-500 text-center"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          {days.map((day) => (
            <div key={day} className="flex items-center mb-1">
              {/* Day label */}
              <div className="w-24 flex-shrink-0 text-sm text-gray-400 pr-4">
                {day.slice(0, 3)}
              </div>

              {/* Hour cells */}
              <div className="flex-1 flex gap-1">
                {hours.map((hour) => {
                  const count = getCount(day, hour);
                  return (
                    <div
                      key={hour}
                      className={`flex-1 aspect-square rounded ${getColor(count)} transition-all cursor-pointer group relative`}
                      title={`${day} ${formatHour(hour)}: ${count} distractions`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-700 z-10">
                        <div className="font-semibold">{day}</div>
                        <div className="text-gray-400">{formatHour(hour)}</div>
                        <div className="text-red-400 font-semibold">{count} distractions</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-xs text-gray-500">Less</span>
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded bg-gray-800"></div>
              <div className="w-6 h-6 rounded bg-red-900/30"></div>
              <div className="w-6 h-6 rounded bg-red-800/50"></div>
              <div className="w-6 h-6 rounded bg-red-700/70"></div>
              <div className="w-6 h-6 rounded bg-red-600/90"></div>
              <div className="w-6 h-6 rounded bg-red-500"></div>
            </div>
            <span className="text-xs text-gray-500">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
