'use client';

import { useState, useOptimistic, useMemo } from 'react';
import { Task, TaskStatus } from '@prisma/client';
import { Reorder } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { TaskFilters, FilterState } from './TaskFilters';

/**
 * TaskBoard Component
 * 
 * A Kanban-style board with three columns: Backlog, In Progress, Done
 * Supports drag-and-drop to move tasks between columns
 * Uses optimistic updates for smooth UX
 * Includes filtering by priority and tags
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5, 24
 */

interface TaskBoardProps {
  initialTasks: Task[];
}

interface TasksByStatus {
  BACKLOG: Task[];
  IN_PROGRESS: Task[];
  DONE: Task[];
}

const COLUMN_CONFIG = [
  { status: 'BACKLOG' as TaskStatus, title: 'Backlog', color: 'bg-gray-700' },
  { status: 'IN_PROGRESS' as TaskStatus, title: 'In Progress', color: 'bg-blue-700' },
  { status: 'DONE' as TaskStatus, title: 'Done', color: 'bg-green-700' },
];

export function TaskBoard({ initialTasks }: TaskBoardProps) {
  // Group tasks by status
  const groupTasksByStatus = (tasks: Task[]): TasksByStatus => {
    return {
      BACKLOG: tasks.filter(t => t.status === 'BACKLOG').sort((a, b) => a.order - b.order),
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').sort((a, b) => a.order - b.order),
      DONE: tasks.filter(t => t.status === 'DONE').sort((a, b) => a.order - b.order),
    };
  };

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (state, newTasks: Task[]) => newTasks
  );
  const [filters, setFilters] = useState<FilterState>({ priority: null, tags: [] });

  /**
   * Extract all unique tags from tasks
   */
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  /**
   * Filter tasks based on selected filters
   * Requirements: 4.3, 4.4
   */
  const filteredTasks = useMemo(() => {
    let filtered = optimisticTasks;

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Filter by tags (task must contain ALL selected tags)
    if (filters.tags.length > 0) {
      filtered = filtered.filter(task => {
        if (!task.tags || task.tags.length === 0) return false;
        return filters.tags.every(filterTag => task.tags.includes(filterTag));
      });
    }

    return filtered;
  }, [optimisticTasks, filters]);

  const tasksByStatus = groupTasksByStatus(filteredTasks);

  /**
   * Handle task completion toggle
   * Updates task status to DONE when checked, IN_PROGRESS when unchecked
   * 
   * Requirements: 48
   */
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = completed ? 'DONE' : 'IN_PROGRESS';
    
    // Optimistic update
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus, completedAt: completed ? new Date() : null } : t
    );
    setOptimisticTasks(updatedTasks);

    try {
      // Update on server
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          completedAt: completed ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const { task: updatedTask } = await response.json();
      
      // Update with server response
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Revert optimistic update on error
      setTasks(tasks);
    }
  };

  /**
   * Handle task status change when dropped in a new column
   * Uses optimistic updates for immediate UI feedback
   * 
   * Requirements: 4.2, 24
   */
  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setOptimisticTasks(updatedTasks);

    try {
      // Update on server
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const { task: updatedTask } = await response.json();
      
      // Update with server response
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert optimistic update on error
      setTasks(tasks);
    }
  };

  /**
   * Handle task reordering within the same column
   * 
   * Requirements: 24
   */
  const handleReorder = async (status: TaskStatus, newOrder: Task[]) => {
    // Optimistic update
    const otherTasks = tasks.filter(t => t.status !== status);
    const reorderedTasks = newOrder.map((task, index) => ({
      ...task,
      order: index,
    }));
    const updatedTasks = [...otherTasks, ...reorderedTasks];
    
    setOptimisticTasks(updatedTasks);

    try {
      // Update order on server for each task
      await Promise.all(
        reorderedTasks.map((task, index) =>
          fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order: index }),
          })
        )
      );

      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      // Revert optimistic update on error
      setTasks(tasks);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <TaskFilters 
        availableTags={availableTags}
        onFilterChange={setFilters}
      />

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMN_CONFIG.map(({ status, title, color }) => (
          <TaskColumn
            key={status}
            status={status}
            title={title}
            color={color}
            tasks={tasksByStatus[status]}
            onTaskDrop={handleTaskStatusChange}
            onReorder={handleReorder}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * TaskColumn Component
 * 
 * A single column in the Kanban board
 * Handles drag-and-drop for tasks
 */

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onTaskDrop: (taskId: string, newStatus: TaskStatus) => void;
  onReorder: (status: TaskStatus, newOrder: Task[]) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

function TaskColumn({ status, title, color, tasks, onTaskDrop, onReorder, onToggleComplete }: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData('taskId');
    const sourceStatus = e.dataTransfer.getData('status');

    if (taskId && sourceStatus !== status) {
      onTaskDrop(taskId, status);
    }
  };

  return (
    <div
      className={`flex flex-col rounded-lg bg-gray-800 p-4 min-h-[500px] ${
        isDragOver ? 'ring-2 ring-blue-500' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="ml-auto text-sm text-gray-400">{tasks.length}</span>
      </div>

      {/* Task List with Reorder */}
      <Reorder.Group
        axis="y"
        values={tasks}
        onReorder={(newOrder) => onReorder(status, newOrder)}
        className="flex flex-col gap-3 flex-1"
      >
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onToggleComplete={onToggleComplete}
          />
        ))}
      </Reorder.Group>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          No tasks
        </div>
      )}
    </div>
  );
}
