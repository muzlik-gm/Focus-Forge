'use client';

interface MonthlyComparisonChartProps {
  currentMonth: { date: string; minutes: number }[];
  previousMonth: { date: string; minutes: number }[];
  totalCurrent: number;
  totalPrevious: number;
}

/**
 * MonthlyComparisonChart Component
 * 
 * Displays a line chart comparing current month to previous month
 * 
 * Requirements: 5.2
 */
export function MonthlyComparisonChart({
  currentMonth,
  previousMonth,
  totalCurrent,
  totalPrevious,
}: MonthlyComparisonChartProps) {
  // Calculate max value for scaling
  const allMinutes = [...currentMonth.map(d => d.minutes), ...previousMonth.map(d => d.minutes)];
  const maxMinutes = Math.max(...allMinutes, 1);

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points for line chart
  const getPoints = (data: { date: string; minutes: number }[]) => {
    return data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.minutes / maxMinutes) * chartHeight;
      return { x, y, minutes: d.minutes };
    });
  };

  const currentPoints = getPoints(currentMonth);
  const previousPoints = getPoints(previousMonth);

  // Create path string for SVG
  const createPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // Calculate percentage change
  const percentChange = totalPrevious > 0
    ? ((totalCurrent - totalPrevious) / totalPrevious) * 100
    : 0;

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          Monthly Comparison
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">
            {(totalCurrent / 60).toFixed(1)} hrs
          </div>
          <div className={`text-sm font-medium ${percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}% vs last month
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: '600px' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {((maxMinutes * ratio) / 60).toFixed(0)}h
                </text>
              </g>
            );
          })}

          {/* Previous month line */}
          <path
            d={createPath(previousPoints)}
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Current month line */}
          <path
            d={createPath(currentPoints)}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
          />

          {/* Current month points */}
          {currentPoints.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#3B82F6"
                className="hover:r-6 transition-all cursor-pointer"
              />
            </g>
          ))}

          {/* X-axis labels (show every 5th day) */}
          {currentMonth.map((d, i) => {
            if (i % 5 === 0 || i === currentMonth.length - 1) {
              const point = currentPoints[i];
              const day = new Date(d.date).getDate();
              return (
                <text
                  key={i}
                  x={point.x}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {day}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <span className="text-sm text-gray-400">Current Month</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-500 border-dashed border-t-2"></div>
          <span className="text-sm text-gray-400">Previous Month</span>
        </div>
      </div>
    </div>
  );
}
