'use client';

interface WeeklyFocusGraphProps {
  data: { date: string; minutes: number }[];
}

/**
 * WeeklyFocusGraph Component
 * 
 * Displays a bar chart showing focus hours per day
 * 
 * Requirements: 5.1
 */
export function WeeklyFocusGraph({ data }: WeeklyFocusGraphProps) {
  // Find max value for scaling
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);
  
  // Convert date strings to day names
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Calculate total hours
  const totalHours = data.reduce((sum, d) => sum + d.minutes, 0) / 60;

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          Weekly Focus
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">
            {totalHours.toFixed(1)} hrs
          </div>
          <div className="text-xs text-gray-400">Total this period</div>
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-3 h-64">
        {data.map((day, index) => {
          const heightPercent = (day.minutes / maxMinutes) * 100;
          const hours = (day.minutes / 60).toFixed(1);
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="relative w-full flex items-end justify-center group">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300 cursor-pointer"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-700 z-10">
                    <div className="font-semibold">{hours} hours</div>
                    <div className="text-xs text-gray-400">{day.minutes} minutes</div>
                  </div>
                </div>
              </div>
              
              {/* Day label */}
              <span className="text-xs text-gray-400 font-medium text-center">
                {getDayName(day.date)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Y-axis labels */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>0 hrs</span>
        <span>{(maxMinutes / 60).toFixed(1)} hrs</span>
      </div>
    </div>
  );
}
