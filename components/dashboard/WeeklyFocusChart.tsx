'use client';

interface WeeklyFocusChartProps {
  data: { date: string; minutes: number }[];
}

/**
 * WeeklyFocusChart Component
 * 
 * Displays a bar chart showing focus hours for the last 7 days
 * 
 * Requirements: 2.5, 39
 */
export function WeeklyFocusChart({ data }: WeeklyFocusChartProps) {
  // Find max value for scaling
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);
  
  // Convert date strings to day names
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-6">
        Weekly Focus
      </h2>
      
      <div className="flex items-end justify-between gap-3 h-48">
        {data.map((day, index) => {
          const heightPercent = (day.minutes / maxMinutes) * 100;
          const hours = (day.minutes / 60).toFixed(1);
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="relative w-full flex items-end justify-center group">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {hours} hrs
                  </div>
                </div>
              </div>
              
              {/* Day label */}
              <span className="text-xs text-gray-400 font-medium">
                {getDayName(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
