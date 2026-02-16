'use client';

import { Task, TaskPriority, TaskStatus } from '@prisma/client';
import Link from 'next/link';

interface TodayTasksListProps {
  tasks: Task[];
}

/**
 * TodayTasksList Component
 * 
 * Displays today's task list with status indicators
 * 
 * Requirements: 2.6
 */
export function TodayTasksList({ tasks }: TodayTasksListProps) {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case TaskPriority.HIGH:
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case TaskPriority.MEDIUM:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case TaskPriority.LOW:
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return '✓';
      case TaskStatus.IN_PROGRESS:
        return '→';
      case TaskStatus.BACKLOG:
        return '○';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return 'text-green-400';
      case TaskStatus.IN_PROGRESS:
        return 'text-blue-400';
      case TaskStatus.BACKLOG:
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          Today&apos;s Tasks
        </h2>
        <Link 
          href="/tasks"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No tasks for today</p>
          <Link
            href="/tasks"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Create a task
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* Status Icon */}
              <span className={`text-lg ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
              </span>

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-400 truncate">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Priority Badge */}
              <span
                className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>

              {/* Estimated Time */}
              {task.estimatedMinutes && (
                <span className="text-sm text-gray-400 tabular-nums">
                  {task.estimatedMinutes}m
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
