'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Circle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
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

  const tasksByStatus = {
    BACKLOG: tasks.filter(t => t.status === 'BACKLOG'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <div className="h-10 w-64 bg-[var(--surface)] rounded-lg animate-pulse mb-3"></div>
          <div className="h-5 w-96 bg-[var(--surface)] rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--surface)] rounded-2xl p-6 h-96 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Tasks"
        description="Organize and track your work with a visual kanban board"
        action={{
          label: 'New Task',
          icon: Plus,
          onClick: () => console.log('Create task'),
        }}
      />

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, items]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const StatusIcon = status === 'DONE' ? CheckCircle2 : status === 'IN_PROGRESS' ? Clock : Circle;
          
          return (
            <div key={status} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-5 h-5 text-${config.color}-400`} />
                  <h2 className="text-lg font-semibold">{config.label}</h2>
                </div>
                <span className="px-2.5 py-1 bg-[var(--surface-elevated)] rounded-lg text-sm font-medium text-[var(--text-secondary)]">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-[var(--surface-elevated)] rounded-2xl flex items-center justify-center mb-4">
                      <StatusIcon className="w-8 h-8 text-[var(--text-tertiary)]" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">No tasks here</p>
                  </div>
                ) : (
                  items.map((task) => {
                    const priorityInfo = priorityConfig[task.priority];
                    const PriorityIcon = priorityInfo.icon;
                    
                    return (
                      <div
                        key={task.id}
                        className="group bg-[var(--surface-elevated)] hover:bg-[var(--border)] border border-[var(--border)] hover:border-indigo-500/30 rounded-xl p-4 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-sm font-medium flex-1 pr-2 group-hover:text-white transition-colors">
                            {task.title}
                          </p>
                          <button className="text-[var(--text-tertiary)] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-${priorityInfo.color}-500/10 text-${priorityInfo.color}-400 border border-${priorityInfo.color}-500/20`}>
                            <PriorityIcon className="w-3 h-3" />
                            {priorityInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {items.length > 0 && (
                <button className="w-full mt-4 py-2.5 border-2 border-dashed border-[var(--border)] hover:border-indigo-500/30 rounded-xl text-sm text-[var(--text-secondary)] hover:text-indigo-400 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add task
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
