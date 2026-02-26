'use client';

import { useState, useEffect } from 'react';
import { Clock, Activity, Target, TrendingUp, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { tauriApi } from '@/lib/tauri-api';
import type { FocusSession, ActivityLog } from '@/types/tauri';

interface ProductivitySummary {
  totalTime: number;
  productiveTime: number;
  distractingTime: number;
  neutralTime: number;
  productivityScore: number;
  topApplications: Array<{ name: string; duration: number; category: string }>;
}

export default function DesktopMonitorPage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time monitoring state
  const [currentApp, setCurrentApp] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Focus session state
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  
  // Today's productivity summary
  const [todaySummary, setTodaySummary] = useState<ProductivitySummary>({
    totalTime: 0,
    productiveTime: 0,
    distractingTime: 0,
    neutralTime: 0,
    productivityScore: 0,
    topApplications: [],
  });

  // Check if running in Tauri environment
  useEffect(() => {
    const checkEnvironment = () => {
      const isTauri = tauriApi.isTauriEnvironment();
      setIsDesktop(isTauri);
      
      if (!isTauri) {
        setError('This page is only available in the desktop app');
        setLoading(false);
      }
    };
    
    checkEnvironment();
  }, []);

  // Initialize monitoring and load data
  useEffect(() => {
    if (!isDesktop) return;

    const initializeMonitoring = async () => {
      try {
        setLoading(true);
        
        // Start monitoring service
        await tauriApi.monitoring.start();
        setIsMonitoring(true);
        
        // Load initial data
        await Promise.all([
          loadCurrentApplication(),
          loadActiveSession(),
          loadTodaySummary(),
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Failed to initialize monitoring:', err);
        setError(`Failed to initialize: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    initializeMonitoring();
  }, [isDesktop]);

  // Poll for current application updates
  useEffect(() => {
    if (!isDesktop || !isMonitoring) return;

    const interval = setInterval(() => {
      loadCurrentApplication();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isDesktop, isMonitoring]);

  // Refresh summary periodically
  useEffect(() => {
    if (!isDesktop) return;

    const interval = setInterval(() => {
      loadTodaySummary();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isDesktop]);

  const loadCurrentApplication = async () => {
    try {
      const appInfo = await tauriApi.monitoring.getActiveWindow();
      setCurrentApp(appInfo.name);
      
      // Get category for current app
      const category = await tauriApi.categories.getCategoryWithFallback(appInfo.name);
      setCurrentCategory(category);
    } catch (err) {
      console.error('Failed to get current application:', err);
    }
  };

  const loadActiveSession = async () => {
    try {
      const session = await tauriApi.focusSessions.getCurrent();
      setActiveSession(session);
    } catch (err) {
      console.error('Failed to load active session:', err);
    }
  };

  const loadTodaySummary = async () => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startTime = Math.floor(startOfDay.getTime() / 1000);
      
      // Get today's activity logs
      const logs = await tauriApi.activityLogs.getLogs(startTime, now);
      
      // Calculate summary
      const summary = calculateSummary(logs);
      setTodaySummary(summary);
    } catch (err) {
      console.error('Failed to load today summary:', err);
    }
  };

  const calculateSummary = (logs: ActivityLog[]): ProductivitySummary => {
    let productiveTime = 0;
    let distractingTime = 0;
    let neutralTime = 0;
    const appDurations = new Map<string, { duration: number; category: string }>();

    logs.forEach(log => {
      const category = log.category || 'Neutral';
      const duration = log.duration;

      // Accumulate by category
      if (category === 'Productive') {
        productiveTime += duration;
      } else if (category === 'Distracting') {
        distractingTime += duration;
      } else {
        neutralTime += duration;
      }

      // Track per application
      const existing = appDurations.get(log.application);
      if (existing) {
        existing.duration += duration;
      } else {
        appDurations.set(log.application, { duration, category });
      }
    });

    const totalTime = productiveTime + distractingTime + neutralTime;
    const productivityScore = totalTime > 0 
      ? Math.round((productiveTime / totalTime) * 100) 
      : 0;

    // Get top 5 applications by duration
    const topApplications = Array.from(appDurations.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return {
      totalTime,
      productiveTime,
      distractingTime,
      neutralTime,
      productivityScore,
      topApplications,
    };
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Productive':
        return 'from-green-500 to-emerald-400';
      case 'Distracting':
        return 'from-orange-500 to-red-400';
      default:
        return 'from-zinc-600 to-zinc-700';
    }
  };

  const getCategoryBadgeColor = (category: string): string => {
    switch (category) {
      case 'Productive':
        return 'bg-green-500/20 text-green-300';
      case 'Distracting':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-zinc-500/20 text-zinc-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isDesktop || error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="skeuo-panel p-10 text-center">
          <div className="skeuo-avatar w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 embossed-text">Desktop Only</h2>
          <p className="text-zinc-300 text-lg mb-2">
            This page is only available in the FocusForge desktop app
          </p>
          {error && (
            <p className="text-zinc-400 text-sm mt-4">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">
          Desktop Monitor
        </h1>
        <p className="text-zinc-300 text-lg">
          Real-time application tracking and productivity insights
        </p>
      </div>

      {/* Current Activity Card */}
      <div className="skeuo-panel p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1 embossed-text">Current Activity</h2>
            <p className="text-zinc-400 text-sm">What you're working on right now</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-sm text-zinc-400">
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="skeuo-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Application</div>
                <div className="text-lg font-bold embossed-text">
                  {currentApp || 'No application detected'}
                </div>
              </div>
            </div>
          </div>

          <div className="skeuo-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`skeuo-avatar w-12 h-12 bg-gradient-to-br ${getCategoryColor(currentCategory)} flex items-center justify-center`}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Category</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold embossed-text">{currentCategory || 'Unknown'}</div>
                  <div className={`skeuo-badge ${getCategoryBadgeColor(currentCategory)}`}>
                    <span className="text-xs">{currentCategory}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Focus Session */}
        {activeSession && (
          <div className="mt-6 skeuo-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-3">
              <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-grow">
                <div className="text-sm font-bold text-purple-300 mb-1">Focus Session Active</div>
                <div className="text-xs text-zinc-400">
                  {activeSession.goal || 'No goal set'} • Status: {activeSession.status}
                </div>
              </div>
              <div className="skeuo-badge bg-purple-500/20 text-purple-300">
                <span className="text-xs">In Progress</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today's Productivity Summary */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="skeuo-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="skeuo-badge">TODAY</div>
          </div>
          <div className="text-3xl font-bold mb-1 embossed-text">
            {formatDuration(todaySummary.totalTime)}
          </div>
          <div className="text-zinc-400 text-sm">Total tracked</div>
        </div>

        <div className="skeuo-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="skeuo-badge">PRODUCTIVE</div>
          </div>
          <div className="text-3xl font-bold mb-1 embossed-text">
            {formatDuration(todaySummary.productiveTime)}
          </div>
          <div className="text-zinc-400 text-sm">Productive time</div>
        </div>

        <div className="skeuo-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="skeuo-badge">DISTRACTING</div>
          </div>
          <div className="text-3xl font-bold mb-1 embossed-text">
            {formatDuration(todaySummary.distractingTime)}
          </div>
          <div className="text-zinc-400 text-sm">Distraction time</div>
        </div>

        <div className="skeuo-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="skeuo-badge">SCORE</div>
          </div>
          <div className="text-3xl font-bold mb-1 embossed-text">
            {todaySummary.productivityScore}%
          </div>
          <div className="text-zinc-400 text-sm">Productivity</div>
          <div className="skeuo-progress mt-4">
            <div 
              className="skeuo-progress-bar" 
              style={{ width: `${todaySummary.productivityScore}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Top Applications */}
      <div className="skeuo-panel p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1 embossed-text">Top Applications Today</h2>
          <p className="text-zinc-400 text-sm">Where you're spending your time</p>
        </div>

        {todaySummary.topApplications.length > 0 ? (
          <div className="space-y-4">
            {todaySummary.topApplications.map((app, index) => {
              const percentage = todaySummary.totalTime > 0
                ? Math.round((app.duration / todaySummary.totalTime) * 100)
                : 0;

              return (
                <div key={index} className="skeuo-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`skeuo-avatar w-10 h-10 bg-gradient-to-br ${getCategoryColor(app.category)} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-bold text-zinc-200">{app.name}</div>
                        <div className="text-xs text-zinc-500">{app.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-zinc-200">{formatDuration(app.duration)}</div>
                      <div className="text-xs text-zinc-500">{percentage}%</div>
                    </div>
                  </div>
                  <div className="skeuo-progress">
                    <div 
                      className="skeuo-progress-bar" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="skeuo-avatar w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
              <Activity className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-400 text-sm">No activity tracked yet today</p>
            <p className="text-zinc-500 text-xs mt-2">Start using applications to see your productivity data</p>
          </div>
        )}
      </div>
    </div>
  );
}
