'use client';

interface FocusByTimeOfDayProps {
  data: { hour: number; minutes: number }[];
}

/**
 * FocusByTimeOfDay Component
 * 
 * Displays a histogram showing focus session distribution across hours
 * 
 * Requirements: 5.4
 */
export function FocusByTimeOfDay({ data }: FocusByTimeOfDayProps) {
  // Find max value for scaling
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);

  // Format hour for display
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12am';
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return '12pm';
    return `${hour - 12}pm`;
  };

  // Group hours into time periods
  const getTimePeriod = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  // Calculate total by time period
  const periodTotals = data.reduce((acc, d) => {
    const period = getTimePeriod(d.hour);
    acc[period] = (acc[period] || 0) + d.minutes;
    return acc;
  }, {} as Record<string, number>);

  const mostProductivePeriod = Object.entries(periodTotals)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Focus by Time of Day
          </h2>
          <p className="text-sm text-gray-400">
            Your most productive time: <span className="text-blue-400 font-semibold">{mostProductivePeriod}</span>
          </p>
        </div>
      </div>

      {/* Histogram */}
      <div className="overflow-x-auto">
        <div className="flex items-end justify-between gap-1 h-48 min-w-[600px]">
          {data.map((item) => {
            const heightPercent = (item.minutes / maxMinutes) * 100;
            const hours = (item.minutes / 60).toFixed(1);
            const period = getTimePeriod(item.hour);
            
            // Color based on time period
            const getBarColor = () => {
              switch (period) {
                case 'Morning': return 'from-yellow-600 to-yellow-400';
                case 'Afternoon': return 'from-blue-600 to-blue-400';
                case 'Evening': return 'from-purple-600 to-purple-400';
                case 'Night': return 'from-indigo-600 to-indigo-400';
                default: return 'from-gray-600 to-gray-400';
              }
            };

            return (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar */}
                <div className="relative w-full flex items-end justify-center group">
                  <div 
                    className={`w-full bg-gradient-to-t ${getBarColor()} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-700 z-10">
                      <div className="font-semibold">{formatHour(item.hour)}</div>
                      <div className="text-blue-400">{hours} hours</div>
                      <div className="text-xs text-gray-400">{item.minutes} minutes</div>
                    </div>
                  </div>
                </div>
                
                {/* Hour label (show every 3 hours) */}
                {item.hour % 3 === 0 && (
                  <span className="text-xs text-gray-500 font-medium">
                    {formatHour(item.hour)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time period legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-600 to-yellow-400"></div>
          <span className="text-xs text-gray-400">Morning (5am-12pm)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-600 to-blue-400"></div>
          <span className="text-xs text-gray-400">Afternoon (12pm-5pm)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-600 to-purple-400"></div>
          <span className="text-xs text-gray-400">Evening (5pm-9pm)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-indigo-600 to-indigo-400"></div>
          <span className="text-xs text-gray-400">Night (9pm-5am)</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
        {Object.entries(periodTotals).map(([period, minutes]) => (
          <div key={period} className="text-center">
            <div className="text-2xl font-bold text-white">
              {(minutes / 60).toFixed(1)}h
            </div>
            <div className="text-xs text-gray-400">{period}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
