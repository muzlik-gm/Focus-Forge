'use client';

import { Task } from '@prisma/client';
import { Reorder } from 'framer-motion';
import { useState } from 'react';
import { toSafeString } from '@/lib/render-safe';

/**
 * TaskCard Component
 * 
 * Displays individual task with:
 * - Title and description
 * - Priority color coding
 * - Tags as badges
 * - Estimated time
 * - Completion checkbox
 * - Drag handle for reordering
 * 
 * Requirements: 19, 38
 */

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}

const priorityColors = {
  LOW: {
    border: 'border-l-gray-500',
    badge: 'bg-gray-700 text-gray-300',
  },
  MEDIUM: {
    border: 'border-l-blue-500',
    badge: 'bg-blue-900 text-blue-200',
  },
  HIGH: {
    border: 'border-l-yellow-500',
    badge: 'bg-yellow-900 text-yellow-200',
  },
  URGENT: {
    border: 'border-l-red-500',
    badge: 'bg-red-900 text-red-200',
  },
};

export function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === 'DONE');

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('status', task.status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const completed = e.target.checked;
    setIsCompleted(completed);
    
    if (onToggleComplete) {
      onToggleComplete(task.id, completed);
    }
  };

  const colors = priorityColors[task.priority];

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      className="cursor-move"
    >
      <div
        draggable
        onDragStart={handleDragStart}
        className={`bg-gray-900 rounded-lg p-4 border-l-4 ${colors.border} 
          hover:bg-gray-850 hover:shadow-lg transition-all duration-200 shadow-md
          ${isCompleted ? 'opacity-60' : ''}`}
      >
        {/* Header with Checkbox and Drag Handle */}
        <div className="flex items-start gap-3 mb-2">
          {/* Completion Checkbox */}
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleCheckboxChange}
            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 
              text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
              cursor-pointer"
            aria-label={`Mark "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
          />

          {/* Task Title */}
          <h4 className={`flex-1 text-white font-medium ${isCompleted ? 'line-through' : ''}`}>
            {toSafeString(task.title)}
          </h4>

          {/* Drag Handle */}
          <div 
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Drag to reorder"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 8h16M4 16h16" 
              />
            </svg>
          </div>
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2 ml-7">
            {toSafeString(task.description)}
          </p>
        )}

        {/* Task Metadata */}
        <div className="flex items-center gap-3 text-xs ml-7">
          {/* Priority Badge */}
          <span className={`px-2 py-1 rounded font-medium ${colors.badge}`}>
            {task.priority}
          </span>

          {/* Estimated Time */}
          {task.estimatedMinutes && (
            <span className="flex items-center gap-1 text-gray-500">
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span>{task.estimatedMinutes}m</span>
            </span>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 ml-7">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs
                  border border-gray-700 hover:border-gray-600 transition-colors"
              >
                #{toSafeString(tag)}
              </span>
            ))}
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}
