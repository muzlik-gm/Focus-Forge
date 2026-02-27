'use client';

import { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle2, Clock, AlertCircle, Loader2, Trash2, X } from 'lucide-react';
import { get, post, patch, del } from '@/lib/api-client';

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
  const [draggedColumnStatus, setDraggedColumnStatus] = useState<string | null>(null);

  const [taskStates, setTaskStates] = useState<string[]>(['BACKLOG', 'IN_PROGRESS', 'DONE']);
  const [isAddingState, setIsAddingState] = useState(false);
  const [newStateName, setNewStateName] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

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

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setDeletingTaskId(taskId);
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      const res = await del(`/api/tasks/${taskId}`);
      if (!res.ok) {
        setTasks(previousTasks);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setTasks(previousTasks);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.stopPropagation();
    // Delay setting visual state so browser captures the ghost image correctly
    setTimeout(() => setDraggedTaskId(taskId), 0);
    e.dataTransfer.setData('source', 'task');
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleColumnDragStart = (e: React.DragEvent, status: string) => {
    e.stopPropagation();
    setTimeout(() => setDraggedColumnStatus(status), 0);
    e.dataTransfer.setData('source', 'column');
    e.dataTransfer.setData('status', status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnStatus(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStatus(null);

    const source = e.dataTransfer.getData('source');

    if (source === 'column' || draggedColumnStatus) {
      const sourceStatus = e.dataTransfer.getData('status') || draggedColumnStatus;
      setDraggedColumnStatus(null);
      if (sourceStatus && sourceStatus !== targetStatus) {
        // Reorder columns
        const newStates = [...taskStates];
        const sourceIndex = newStates.indexOf(sourceStatus);
        const targetIndex = newStates.indexOf(targetStatus);

        if (sourceIndex > -1 && targetIndex > -1) {
          newStates.splice(sourceIndex, 1);
          newStates.splice(targetIndex, 0, sourceStatus);
          setTaskStates(newStates);
          try {
            await post('/api/tasks/states', { states: newStates });
          } catch (err) {
            console.error(err);
          }
        }
      }
    } else {
      // Fallback to React state if dataTransfer is empty in this cycle
      const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
      setDraggedTaskId(null);

      if (taskId) {
        updateTaskStatus(taskId, targetStatus);
      }
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
    <div className="w-full p-4 md:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 embossed-text tracking-tight">Tasks</h1>
          <p className="text-zinc-300 text-sm">Organize and track your work</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="skeuo-button inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium text-sm shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 0 }}>
        {Object.entries(tasksByStatus).map(([status, items]) => {
          const StatusIcon = status === 'DONE' ? CheckCircle2 : status === 'IN_PROGRESS' ? Clock : Circle;

          return (
            <div
              key={status}
              draggable
              onDragStart={(e) => handleColumnDragStart(e, status)}
              onDragEnd={handleColumnDragEnd}
              className={`skeuo-panel p-3 border transition-colors duration-200 min-w-[220px] max-w-[220px] shrink-0 ${dragOverStatus === status ? 'bg-white/[0.03] border-blue-500/30 ring-1 ring-blue-500/20' : 'border-white/[0.02]'
                } inline-flex flex-col ${draggedColumnStatus === status ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragEnter={(e) => { e.preventDefault(); }}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="skeuo-avatar w-7 h-7 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                    <StatusIcon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <h2 className="font-semibold text-sm embossed-text">{getStatusLabel(status)}</h2>
                </div>
                <span className="skeuo-badge scale-75 origin-right">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[200px]">
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
                        className={`skeuo-card select-none p-4 border transition-colors duration-200 group ${isDragging ? 'opacity-50 shadow-none border-blue-500/30 bg-blue-500/5 cursor-grabbing' : 'hover:border-white/10 hover:bg-white/[0.03] border-transparent cursor-grab'}
                          `}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-zinc-100 leading-snug flex-1">{task.title}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            disabled={deletingTaskId === task.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 disabled:opacity-50"
                            title="Delete task"
                          >
                            {deletingTaskId === task.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="skeuo-chip py-0.5 px-2">
                          <PriorityIcon className="w-3 h-3" />
                          <span className="text-[10px] font-medium tracking-wide uppercase">{priorityInfo.label}</span>
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
        <div className="min-w-[200px] max-w-[200px] shrink-0">
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
              className="w-full skeuo-panel border-dashed border-2 border-white/10 hover:border-white/20 p-4 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white transition-all cursor-pointer h-[100px]"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium text-xs">Add custom list</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowCreateModal(false)}>
          <div className="skeuo-modal p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-5 embossed-text">Create New Task</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="skeuo-input w-full px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="skeuo-input w-full px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-zinc-900 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center]"
                >
                  <option value="LOW" className="bg-zinc-800">Low</option>
                  <option value="MEDIUM" className="bg-zinc-800">Medium</option>
                  <option value="HIGH" className="bg-zinc-800">High</option>
                  <option value="URGENT" className="bg-zinc-800">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="skeuo-card hover:bg-zinc-800 flex-1 py-2.5 text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  disabled={creating || !newTaskTitle.trim()}
                  className="skeuo-button flex-1 py-2.5 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
