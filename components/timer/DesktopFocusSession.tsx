'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Settings, CheckCircle } from 'lucide-react';
import { tauriApi } from '@/lib/tauri-api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { FocusSession, ApplicationCategory } from '@/types/tauri';

/**
 * DesktopFocusSession Component
 * 
 * Desktop-specific focus session management UI that integrates with Tauri commands.
 * Features:
 * - Session start dialog with category selection
 * - Active session controls (pause/resume/stop)
 * - Session summary display after completion
 * - Real-time monitoring integration
 * 
 * Requirements: 6.1, 6.5
 */

interface SessionSummary {
  totalDuration: number;
  focusTime: number;
  distractionCount: number;
  applicationBreakdown: Record<string, number>;
  productivityScore: number;
}

export function DesktopFocusSession() {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  // Start dialog state
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Productive']);
  const [sessionGoal, setSessionGoal] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);

  // Session state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentApp, setCurrentApp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load available categories on mount
  useEffect(() => {
    loadCategories();
    checkActiveSession();
  }, []);

  // Timer for elapsed time
  useEffect(() => {
    if (currentSession?.status === 'Active') {
      const interval = setInterval(() => {
        const now = Date.now(); // milliseconds
        const elapsed = Math.floor((now - currentSession.startTime) / 1000); // convert to seconds for display
        setElapsedTime(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  // Poll current application
  useEffect(() => {
    if (currentSession?.status === 'Active') {
      const interval = setInterval(async () => {
        try {
          const appInfo = await tauriApi.monitoring.getActiveWindow();
          setCurrentApp(appInfo.name);
        } catch (err) {
          console.error('Error getting active window:', err);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const loadCategories = async () => {
    try {
      const categoryNames = await tauriApi.categories.listCategoryNames();
      setCategories(categoryNames);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories(['Productive', 'Neutral', 'Distracting']);
    }
  };

  const checkActiveSession = async () => {
    try {
      const session = await tauriApi.focusSessions.getCurrent();
      if (session) {
        setCurrentSession(session);
        const now = Date.now(); // milliseconds
        const elapsed = Math.floor((now - session.startTime) / 1000); // convert to seconds for display
        setElapsedTime(elapsed);
      }
    } catch (err) {
      console.error('Error checking active session:', err);
    }
  };

  const handleStartSession = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one productive category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionId = crypto.randomUUID();
      const startTime = Date.now(); // milliseconds - matches Rust backend

      await tauriApi.focusSessions.create(
        sessionId,
        startTime,
        selectedCategories,
        sessionGoal || undefined
      );

      const session = await tauriApi.focusSessions.getById(sessionId);
      setCurrentSession(session);
      setShowStartDialog(false);
      setElapsedTime(0);

      // Start monitoring if not already running
      try {
        await tauriApi.monitoring.start();
      } catch (err) {
        console.log('Monitoring already running or failed to start:', err);
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await tauriApi.focusSessions.pause();
      const updated = await tauriApi.focusSessions.getCurrent();
      setCurrentSession(updated);
    } catch (err) {
      console.error('Error pausing session:', err);
      setError('Failed to pause session');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await tauriApi.focusSessions.resume();
      const updated = await tauriApi.focusSessions.getCurrent();
      setCurrentSession(updated);
    } catch (err) {
      console.error('Error resuming session:', err);
      setError('Failed to resume session');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      const endTime = Date.now(); // milliseconds - matches Rust backend
      await tauriApi.focusSessions.complete(currentSession.id, endTime);

      // Generate session summary
      const summary = await generateSessionSummary(currentSession.id);
      setSessionSummary(summary);
      setShowSummary(true);
      setCurrentSession(null);
      setElapsedTime(0);
    } catch (err) {
      console.error('Error stopping session:', err);
      setError('Failed to stop session');
    } finally {
      setLoading(false);
    }
  };

  const generateSessionSummary = async (sessionId: string): Promise<SessionSummary> => {
    try {
      const session = await tauriApi.focusSessions.getById(sessionId);
      if (!session || !session.endTime) {
        throw new Error('Session not found or not completed');
      }

      // Times are in milliseconds, convert to seconds for duration
      const totalDuration = Math.floor((session.endTime - session.startTime) / 1000);

      // Get activity logs for the session period (convert to seconds for API)
      const logs = await tauriApi.activityLogs.getLogs(
        Math.floor(session.startTime / 1000),
        Math.floor(session.endTime / 1000)
      );

      // Calculate application breakdown
      const breakdown: Record<string, number> = {};
      let focusTime = 0;
      let distractionCount = 0;

      for (const log of logs) {
        breakdown[log.application] = (breakdown[log.application] || 0) + log.duration;

        const category = await tauriApi.categories.getCategoryWithFallback(log.application);
        if (session.productiveCategories.includes(category)) {
          focusTime += log.duration;
        } else {
          distractionCount++;
        }
      }

      const productivityScore = totalDuration > 0
        ? Math.round((focusTime / totalDuration) * 100)
        : 0;

      return {
        totalDuration,
        focusTime,
        distractionCount,
        applicationBreakdown: breakdown,
        productivityScore,
      };
    } catch (err) {
      console.error('Error generating summary:', err);
      return {
        totalDuration: 0,
        focusTime: 0,
        distractionCount: 0,
        applicationBreakdown: {},
        productivityScore: 0,
      };
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Session Display */}
      {!currentSession ? (
        <div className="skeuo-panel p-12 text-center max-w-2xl mx-auto">
          <div className="skeuo-avatar w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Play className="w-10 h-10 text-white ml-2" />
          </div>
          <h2 className="text-3xl font-bold mb-4 embossed-text">
            Ready to Focus?
          </h2>
          <p className="text-zinc-300 text-lg mb-8 max-w-md mx-auto">
            Start a focus session with automatic distraction detection in our tactile environment
          </p>
          <button
            onClick={() => setShowStartDialog(true)}
            className="skeuo-button inline-flex items-center gap-3 px-8 py-4 text-white font-medium text-lg"
          >
            <Play className="w-5 h-5" />
            Start Focus Session
          </button>
        </div>
      ) : (
        <div className="skeuo-panel p-12 max-w-2xl mx-auto">
          {/* Timer Display */}
          <div className="text-center mb-10">
            <div className="text-7xl font-bold mb-6 embossed-text font-mono tabular-nums">
              {formatTime(elapsedTime)}
            </div>

            {currentSession.status === 'Paused' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-lg text-yellow-400">
                <Pause className="w-4 h-4" />
                Session Paused
              </div>
            )}

            {currentSession.goal && (
              <div className="mt-4 text-gray-400">
                Goal: {currentSession.goal}
              </div>
            )}
          </div>

          {/* Current Application */}
          {currentApp && (
            <div className="mb-8 skeuo-card p-5">
              <div className="text-sm text-zinc-400 mb-1 font-medium">Current Application:</div>
              <div className="text-xl font-bold text-white embossed-text">{currentApp}</div>
            </div>
          )}

          {/* Session Controls */}
          <div className="flex gap-4 mt-6">
            {currentSession.status === 'Active' ? (
              <>
                <button
                  onClick={handlePauseSession}
                  disabled={loading}
                  className="skeuo-card hover:bg-zinc-800 flex-1 py-4 text-white font-medium text-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
                <button
                  onClick={handleStopSession}
                  disabled={loading}
                  className="skeuo-button flex-1 py-4 text-white font-medium text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(145deg, #e83d3d, #b82e2e)' }}
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleResumeSession}
                  disabled={loading}
                  className="skeuo-button flex-1 py-4 text-white font-medium text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
                <button
                  onClick={handleStopSession}
                  disabled={loading}
                  className="skeuo-button flex-1 py-4 text-white font-medium text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(145deg, #e83d3d, #b82e2e)' }}
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Productive Categories */}
          <div className="mt-8 pt-8 border-t border-zinc-800/30">
            <div className="text-sm text-zinc-400 mb-3 font-medium">Productive Categories</div>
            <div className="flex flex-wrap gap-2">
              {currentSession.productiveCategories?.map(category => (
                <span
                  key={category}
                  className="skeuo-chip bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-400"
                >
                  {category}
                </span>
              )) || <span className="text-zinc-500 text-sm">No categories selected</span>}
            </div>
          </div>
        </div>
      )}

      {/* Start Session Dialog */}
      <Modal
        isOpen={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        title="Start Focus Session"
      >
        <div className="space-y-6">
          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-3 embossed-text">
              Session Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 25)}
              className="skeuo-input w-full px-5 py-3 text-white focus:outline-none"
            />
          </div>

          {/* Goal Input */}
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-3 embossed-text">
              Session Goal (optional)
            </label>
            <input
              type="text"
              value={sessionGoal}
              onChange={(e) => setSessionGoal(e.target.value)}
              placeholder="What will you focus on?"
              className="skeuo-input w-full px-5 py-3 text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2 embossed-text">
              Productive Categories
            </label>
            <p className="text-sm text-zinc-400 mb-4">
              Select which application categories count as productive for this session
            </p>
            <div className="space-y-3">
              {categories.map(category => (
                <label
                  key={category}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${selectedCategories.includes(category)
                    ? 'bg-blue-500/10 border-blue-500/30 border shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]'
                    : 'skeuo-card hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${selectedCategories.includes(category)
                    ? 'bg-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
                    : 'bg-black/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]'
                    }`}>
                    {selectedCategories.includes(category) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="sr-only"
                  />
                  <span className={`font-medium ${selectedCategories.includes(category) ? 'text-white embossed-text' : 'text-zinc-400'}`}>
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={() => setShowStartDialog(false)}
              className="skeuo-card flex-1 py-4 text-white font-bold transition-all hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSession}
              disabled={loading || selectedCategories.length === 0}
              className="skeuo-button flex-1 py-4 text-white font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Session Summary Modal */}
      <Modal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        title="Session Complete!"
      >
        {sessionSummary && (
          <div className="space-y-6">
            {/* Completion Icon */}
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                Great Work!
              </h3>
              <p className="text-gray-400">
                You completed your focus session
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="skeuo-card p-5">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Total Time</div>
                <div className="text-2xl font-bold text-white embossed-text">
                  {formatTime(sessionSummary.totalDuration)}
                </div>
              </div>
              <div className="skeuo-card p-5">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Focus Time</div>
                <div className="text-2xl font-bold text-green-400 embossed-text">
                  {formatTime(sessionSummary.focusTime)}
                </div>
              </div>
              <div className="skeuo-card p-5">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Distractions</div>
                <div className="text-2xl font-bold text-yellow-500 embossed-text">
                  {sessionSummary.distractionCount}
                </div>
              </div>
              <div className="skeuo-card p-5">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Productivity</div>
                <div className="text-2xl font-bold text-blue-400 embossed-text">
                  {sessionSummary.productivityScore}%
                </div>
              </div>
            </div>

            {/* Application Breakdown */}
            {Object.keys(sessionSummary.applicationBreakdown).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Time by Application
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(sessionSummary.applicationBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([app, duration]) => (
                      <div
                        key={app}
                        className="flex items-center justify-between p-3 skeuo-card"
                      >
                        <span className="text-sm text-white truncate">{app}</span>
                        <span className="text-sm text-gray-400 ml-2">
                          {formatTime(duration)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setShowSummary(false)}
                className="skeuo-card flex-1 py-4 text-white font-bold transition-all hover:bg-white/5 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowSummary(false);
                  setShowStartDialog(true);
                }}
                className="skeuo-button flex-1 py-4 text-white font-bold inline-flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Another
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
