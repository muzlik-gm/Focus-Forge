'use client';

import { useState } from 'react';
import { TaskPriority } from '@prisma/client';

/**
 * TaskFilters Component
 * 
 * Filter panel for tasks with priority and tag filters
 * Manages filter state and updates task list based on selections
 * 
 * Requirements: 4.3, 4.4
 */

interface TaskFiltersProps {
  availableTags: string[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  priority: TaskPriority | null;
  tags: string[];
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-500' },
  { value: 'HIGH', label: 'High', color: 'bg-yellow-500' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-500' },
];

export function TaskFilters({ availableTags, onFilterChange }: TaskFiltersProps) {
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Handle priority filter change
   * Requirements: 4.3
   */
  const handlePriorityChange = (priority: TaskPriority | null) => {
    setSelectedPriority(priority);
    onFilterChange({
      priority,
      tags: selectedTags,
    });
  };

  /**
   * Handle tag filter toggle
   * Requirements: 4.4
   */
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onFilterChange({
      priority: selectedPriority,
      tags: newTags,
    });
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setSelectedPriority(null);
    setSelectedTags([]);
    onFilterChange({
      priority: null,
      tags: [],
    });
  };

  const hasActiveFilters = selectedPriority !== null || selectedTags.length > 0;

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-md border border-gray-800">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="text-white font-semibold">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {(selectedPriority ? 1 : 0) + selectedTags.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors"
              aria-label="Clear all filters"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => handlePriorityChange(selectedPriority === value ? null : value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${
                      selectedPriority === value
                        ? `${color} text-white shadow-lg`
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  aria-pressed={selectedPriority === value}
                  aria-label={`Filter by ${label} priority`}
                >
                  <div className="flex items-center gap-2">
                    {selectedPriority !== value && (
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                    )}
                    {label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${
                        selectedTags.includes(tag)
                          ? 'bg-cyan-600 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                      }`}
                    aria-pressed={selectedTags.includes(tag)}
                    aria-label={`Filter by ${tag} tag`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedPriority && (
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">
              Priority: {selectedPriority}
            </span>
          )}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
