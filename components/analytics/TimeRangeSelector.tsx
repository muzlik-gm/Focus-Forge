'use client';

import { TimeRange } from './AnalyticsView';

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
}

/**
 * TimeRangeSelector Component
 * 
 * Allows users to select different time ranges for analytics
 * 
 * Requirements: 50
 */
export function TimeRangeSelector({
  timeRange,
  onTimeRangeChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: TimeRangeSelectorProps) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-4">Time Range</h2>
      
      <div className="flex flex-wrap gap-3">
        {/* Range Buttons */}
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onTimeRangeChange(range.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range.value
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Inputs */}
      {timeRange === 'custom' && (
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="start-date" className="block text-sm text-gray-400 mb-2">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="end-date" className="block text-sm text-gray-400 mb-2">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
