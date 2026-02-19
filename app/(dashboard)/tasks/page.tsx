'use client';

import { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { get, post, patch } from '@/lib/api-client';

interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'BACKLOG' | 'IN_PROGRESS' | 'DONE';
  createdAt: Date;
}

const priorityConfig = {
  URGENT: { color: 'rose', icon: AlertCircle, label: 'Urgent' },
  HIGH: { color: 'orange', icon: AlertCircle, label: 'High' },
  MEDIUM: { color: 'blue', icon: Circle, label: 'Medium' },
  LOW: { color: 'gray', icon: Circle, label: 'Low' },
};

const statusConfig = {
  BACKLOG: { label: 'Backlog', color: 'gray', count: 0 },
  IN_PROGRESS: { label: 'In Progress', color: 'blue', count: 0 },
  DONE: { label: 'Done', color: 'emerald', count: 0 },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await get('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setCreating(true);
    try {
      const res = await post('/api/tasks', {
        title: newTaskTitle,
        priority: newTaskPriority,
      });
      
      if (res.ok) {
        setShowCreateModal(false);
        setNewTaskTitle('');
        setNewTaskPriority('MEDIUM');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setCreating(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'BACKLOG' | 'IN_PROGRESS' | 'DONE') => {
    try {
      const res = await patch(`/api/tasks/${taskId}`, { status: newStatus });
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const tasksByStatus = {
    BACKLOG: tasks.filter(t => t.status === 'BACKLOG'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Tasks</h1>
          <p className="text-zinc-400 text-sm">Organize and track your work</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, items]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const StatusIcon = status === 'DONE' ? CheckCircle2 : status === 'IN_PROGRESS' ? Clock : Circle;
          
          return (
            <div key={status} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <StatusIcon className="w-5 h-5 text-zinc-400" />
                  <h2 className="font-medium">{config.label}</h2>
                </div>
                <span className="px-2.5 py-1 bg-zinc-800 rounded-lg text-sm text-zinc-400">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <StatusIcon className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-sm text-zinc-500">No tasks here</p>
                  </div>
                ) : (
                  items.map((task) => {
                    const priorityInfo = priorityConfig[task.priority];
                    const PriorityIcon = priorityInfo.icon;
                    
                    return (
                      <div
                        key={task.id}
                        className="bg-zinc-800 hover:bg-zinc-800/80 border border-zinc-700 rounded-lg p-4 transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium mb-3">{task.title}</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-700">
                          <PriorityIcon className="w-3 h-3" />
                          {priorityInfo.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  disabled={creating || !newTaskTitle.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
