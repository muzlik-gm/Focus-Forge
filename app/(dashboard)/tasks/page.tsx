'use client';

import { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { get, post, patch } from '@/lib/api-client';

interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  createdAt: Date;
}

const priorityConfig = {
  URGENT: { color: 'rose', icon: AlertCircle, label: 'Urgent' },
  HIGH: { color: 'orange', icon: AlertCircle, label: 'High' },
  MEDIUM: { color: 'blue', icon: Circle, label: 'Medium' },
  LOW: { color: 'gray', icon: Circle, label: 'Low' },
};

const getStatusLabel = (status: string) => {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [creating, setCreating] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const [taskStates, setTaskStates] = useState<string[]>(['BACKLOG', 'IN_PROGRESS', 'DONE']);
  const [isAddingState, setIsAddingState] = useState(false);
  const [newStateName, setNewStateName] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const [tasksRes, statesRes] = await Promise.all([
        get('/api/tasks'),
        get('/api/tasks/states').catch(() => null)
      ]);
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }
      if (statesRes?.ok) {
        const data = await statesRes.json();
        if (data.states && data.states.length > 0) {
          setTaskStates(data.states);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddState = async () => {
    if (!newStateName.trim()) {
      setIsAddingState(false);
      return;
    }

    // Convert to uppercase format with underscores
    const statusId = newStateName.trim().toUpperCase().replace(/\s+/g, '_');
    if (taskStates.includes(statusId)) return;

    const updatedStates = [...taskStates, statusId];
    setTaskStates(updatedStates);
    setIsAddingState(false);
    setNewStateName('');

    try {
      await patch('/api/tasks/states', { states: updatedStates });
      // We will also use POST if it's the required endpoint for task states actually:
      await post('/api/tasks/states', { states: updatedStates });
    } catch (e) {
      console.error(e);
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

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const res = await patch(`/api/tasks/${taskId}`, { status: newStatus });
      if (!res.ok) {
        setTasks(previousTasks); // Revert on failure
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setTasks(previousTasks); // Revert on error
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    // Delay setting visual state so browser captures the ghost image correctly
    setTimeout(() => setDraggedTaskId(taskId), 0);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();

    // Fallback to React state if dataTransfer is empty in this cycle
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;

    setDragOverStatus(null);
    setDraggedTaskId(null);

    if (taskId) {
      updateTaskStatus(taskId, status as any);
    }
  };

  const tasksByStatus = taskStates.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {} as Record<string, Task[]>);

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

      <div className="flex gap-6 overflow-x-auto pb-6 snap-x w-full" style={{ paddingBottom: '2rem' }}>
        {Object.entries(tasksByStatus).map(([status, items]) => {
          const StatusIcon = status === 'DONE' ? CheckCircle2 : status === 'IN_PROGRESS' ? Clock : Circle;

          return (
            <div
              key={status}
              className={`skeuo-panel p-6 border transition-colors duration-200 min-w-[320px] max-w-[320px] shrink-0 h-fit ${dragOverStatus === status ? 'bg-white/[0.03] border-blue-500/30 ring-1 ring-blue-500/20' : 'border-white/[0.02]'
                }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragEnter={(e) => { e.preventDefault(); }}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                    <StatusIcon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h2 className="font-bold text-lg embossed-text">{getStatusLabel(status)}</h2>
                </div>
                <span className="skeuo-badge">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center pointer-events-none">
                    <StatusIcon className={`w-12 h-12 mb-4 transition-colors ${dragOverStatus === status ? 'text-blue-500/50' : 'text-zinc-700'}`} />
                    <p className={`text-sm transition-colors ${dragOverStatus === status ? 'text-blue-400' : 'text-zinc-500'}`}>
                      {dragOverStatus === status ? 'Drop task here' : 'No tasks here'}
                    </p>
                  </div>
                ) : (
                  items.map((task) => {
                    const priorityInfo = priorityConfig[task.priority];
                    const PriorityIcon = priorityInfo.icon;
                    const isDragging = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`skeuo-card select-none p-5 border transition-colors duration-200 ${isDragging ? 'opacity-50 shadow-none border-blue-500/30 bg-blue-500/5 cursor-grabbing' : 'hover:border-white/10 hover:bg-white/[0.03] border-transparent cursor-grab'}
                          `}
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
                {/* Visual placeholder for drop zone */}
                {dragOverStatus === status && items.length > 0 && (
                  <div className="h-24 rounded-2xl border-2 border-dashed border-blue-500/30 bg-blue-500/5 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}

        {/* Add State Column */}
        <div className="min-w-[320px] max-w-[320px] shrink-0">
          {isAddingState ? (
            <div className="skeuo-panel p-4 border border-blue-500/30 bg-blue-500/5">
              <input
                type="text"
                autoFocus
                value={newStateName}
                onChange={(e) => setNewStateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddState();
                  if (e.key === 'Escape') setIsAddingState(false);
                }}
                onBlur={handleAddState}
                placeholder="List name (e.g. Design)"
                className="w-full bg-transparent text-white focus:outline-none mb-3"
              />
              <div className="flex justify-end gap-2 text-xs font-medium">
                <button onMouseDown={() => setIsAddingState(false)} className="px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">Cancel</button>
                <button onMouseDown={handleAddState} className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors">Add</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingState(true)}
              className="w-full skeuo-panel border-dashed border-2 border-white/10 hover:border-white/20 p-6 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-white transition-all cursor-pointer h-[120px]"
            >
              <Plus className="w-6 h-6" />
              <span className="font-medium text-sm">Add custom list</span>
            </button>
          )}
        </div>
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
