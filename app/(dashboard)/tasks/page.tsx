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
    <div className="w-full max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Tasks</h1>
          <p className="text-zinc-300 text-lg">Organize and track your work</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, items]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const StatusIcon = status === 'DONE' ? CheckCircle2 : status === 'IN_PROGRESS' ? Clock : Circle;

          return (
            <div key={status} className="skeuo-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                    <StatusIcon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h2 className="font-bold text-lg embossed-text">{config.label}</h2>
                </div>
                <span className="skeuo-badge">
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
                        className="skeuo-card p-5 skeuo-card-hover cursor-pointer"
                      >
                        <p className="text-base font-medium mb-3 text-zinc-100">{task.title}</p>
                        <span className="skeuo-chip">
                          <PriorityIcon className="w-3.5 h-3.5" />
                          <span className="text-xs">{priorityInfo.label}</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowCreateModal(false)}>
          <div className="skeuo-modal p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 embossed-text">Create New Task</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="skeuo-input w-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="skeuo-input w-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center]"
                >
                  <option value="LOW" className="bg-zinc-800">Low</option>
                  <option value="MEDIUM" className="bg-zinc-800">Medium</option>
                  <option value="HIGH" className="bg-zinc-800">High</option>
                  <option value="URGENT" className="bg-zinc-800">Urgent</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="skeuo-card hover:bg-zinc-800 flex-1 py-3 text-white font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  disabled={creating || !newTaskTitle.trim()}
                  className="skeuo-button flex-1 py-3 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
