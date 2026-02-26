'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Settings, CheckCircle, Code2, Gamepad2, Palette, PenTool } from 'lucide-react';
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

  const WORK_PROFILES = [
    { id: 'dev_web', name: 'Web Dev', icon: Code2, productive: ['Productive', 'programming', 'ide', 'web browser', 'terminal', 'utility'] },
    { id: 'dev_game', name: 'Game Dev', icon: Gamepad2, productive: ['Productive', 'game engine', '3d modeling', 'programming', 'ide', 'graphics editor', 'utility'] },
    { id: 'art_design', name: 'Art & Design', icon: Palette, productive: ['Productive', 'graphics editor', 'vector graphics', '3d modeling', 'design', 'utility'] },
    { id: 'writing', name: 'Writing', icon: PenTool, productive: ['Productive', 'word processor', 'writing', 'web browser', 'utility'] },
    { id: 'custom', name: 'Custom', icon: Settings, productive: ['Productive'] },
  ];

  // Start dialog state
  const [selectedProfile, setSelectedProfile] = useState(WORK_PROFILES[0]);
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
        const elapsed = Math.floor((now - currentSession.startTime) / 1000);

        // Retrieve duration from local storage (set during session start)
        const storedDuration = localStorage.getItem(`session_duration_${currentSession.id}`);
        if (storedDuration) {
          const durationSeconds = parseInt(storedDuration) * 60;
          const remaining = Math.max(0, durationSeconds - elapsed);
          setElapsedTime(remaining);
        } else {
          setElapsedTime(elapsed);
        }
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
        const now = Date.now();
        const elapsed = Math.floor((now - session.startTime) / 1000);

        const storedDuration = localStorage.getItem(`session_duration_${session.id}`);
        if (storedDuration) {
          const durationSeconds = parseInt(storedDuration) * 60;
          setElapsedTime(Math.max(0, durationSeconds - elapsed));
        } else {
          setElapsedTime(elapsed);
        }
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

      // Store the requested duration locally for countdown interface
      localStorage.setItem(`session_duration_${sessionId}`, durationMinutes.toString());
      setElapsedTime(durationMinutes * 60);

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
        session.startTime,
        session.endTime
      );

      // Calculate application breakdown
      const breakdown: Record<string, number> = {};
      let focusTime = 0;
      let distractionCount = 0;

      for (const log of logs) {
        breakdown[log.application] = (breakdown[log.application] || 0) + log.duration;

        const categoryStr = await tauriApi.categories.getCategoryWithFallback(log.application);
        const logCategories = categoryStr.split(',').map(c => c.trim());

        const isProductive = logCategories.some(c => session.productiveCategories.includes(c));

        if (isProductive) {
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
        <div className="flex flex-col items-center justify-center p-16 max-w-2xl mx-auto rounded-3xl skeuo-panel">
          <div className="w-24 h-24 mb-8 skeuo-avatar flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-300">
            <Play className="w-10 h-10 text-zinc-300 ml-1.5" fill="currentColor" strokeWidth={1} style={{ opacity: 0.9 }} />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 text-white tracking-tight drop-shadow-md">
            Ready to Focus?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-sm text-center font-medium leading-relaxed">
            Start a focus session with automatic distraction detection in a calm, tactile environment.
          </p>
          <button
            onClick={() => setShowStartDialog(true)}
            className="skeuo-button inline-flex items-center justify-center gap-3 px-10 py-4 text-white font-bold text-lg min-w-[260px] shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <Play className="w-5 h-5 fill-current" strokeWidth={0} />
            Start Session
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

          {/* Smart Work Profile Selection */}
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2 embossed-text">
              What are you working on? (Smart Profile)
            </label>
            <p className="text-sm text-zinc-400 mb-4">
              Select a work profile to automatically categorize your productive applications.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {WORK_PROFILES.map(profile => (
                <div
                  key={profile.id}
                  onClick={() => {
                    setSelectedProfile(profile);
                    if (profile.id !== 'custom') {
                      setSelectedCategories(Array.from(new Set([...categories, ...profile.productive])));
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all ${selectedProfile.id === profile.id
                    ? 'bg-blue-500/10 border-blue-500/50 border shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] text-blue-400'
                    : 'skeuo-card hover:bg-white/5 border border-transparent text-zinc-400'
                    }`}
                >
                  <profile.icon className="w-8 h-8 mb-2 drop-shadow-md" strokeWidth={1.5} />
                  <span className={`font-semibold text-sm ${selectedProfile.id === profile.id ? 'text-white embossed-text' : 'text-zinc-400'}`}>
                    {profile.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Category Selection Overlay */}
            {selectedProfile.id === 'custom' && (
              <div className="space-y-3 mt-4 p-4 border border-zinc-700/50 rounded-xl bg-black/20">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">MANUAL CATEGORIES</span>
                {categories.map(category => (
                  <label
                    key={category}
                    className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all skeuo-card hover:bg-white/5"
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
            )}
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
