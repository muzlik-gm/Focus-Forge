'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Loader2, Clock } from 'lucide-react';
import { post, get } from '@/lib/api-client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DesktopFocusSession } from '@/components/timer/DesktopFocusSession';

interface Session {
  id: string;
  durationMinutes: number;
  distractionCount: number;
  startTime: string;
  endTime: string | null;
  createdAt: string;
}

export default function FocusPage() {
  const { data: session } = useSession();
  const { isDesktop } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [distractions, setDistractions] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [autoDetectDistractions, setAutoDetectDistractions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFreeUser = session?.user?.subscriptionTier === 'FREE';
  const maxDuration = isFreeUser ? 180 : 480; // 3 hours for free, 8 hours for paid

  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      // Session completed
      stopSession();
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  // Automatic focus loss detection
  useEffect(() => {
    if (!isRunning || !autoDetectDistractions) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from the tab
        logDistraction();
      }
    };

    const handleBlur = () => {
      // User switched to another window/app
      logDistraction();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isRunning, autoDetectDistractions, sessionId]);

  const fetchSessions = async () => {
    try {
      const res = await get('/api/sessions?limit=10');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      setError(null);
      const res = await post('/api/sessions/start', { durationMinutes: selectedDuration });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session.id);
        setTime(selectedDuration * 60);
        setIsRunning(true);
      } else {
        const errorData = await res.json();
        if (errorData.error?.code === 'DURATION_LIMIT_EXCEEDED') {
          setError(errorData.error.message);
        } else {
          setError('Failed to start session');
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Failed to start session');
    }
  };

  const stopSession = async () => {
    if (!sessionId) return;
    try {
      await post(`/api/sessions/${sessionId}/stop`, {});
      setIsRunning(false);
      setTime(selectedDuration * 60);
      setDistractions(0);
      setSessionId(null);
      setError(null);
      fetchSessions();
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  const logDistraction = async () => {
    if (!sessionId) return;
    try {
      await post(`/api/sessions/${sessionId}/distraction`, {});
      setDistractions(d => d + 1);
    } catch (error) {
      console.error('Error logging distraction:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionDuration = (durationMinutes: number) => {
    const mins = Math.floor(durationMinutes);
    const secs = Math.floor((durationMinutes % 1) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Focus Session</h1>
        <p className="text-zinc-300 text-lg">
          {isDesktop ? 'Desktop focus session with automatic distraction detection' : 'Start a deep work session in our tactile environment'}
        </p>
      </div>

      {/* Use desktop-specific component when in Tauri environment */}
      {isDesktop ? (
        <DesktopFocusSession />
      ) : (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 skeuo-panel p-12">
            <div className="max-w-md mx-auto text-center">
              <div className="text-7xl font-bold mb-8 embossed-text tabular-nums">{formatTime(time)}</div>

              {!isRunning && (
                <div className="mb-8">
                  <label className="block text-sm text-zinc-400 mb-3">Session Duration</label>
                  <div className="flex items-center gap-3 justify-center mb-4">
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(Number(e.target.value))}
                      className="skeuo-input px-4 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                    >
                      <option value={25}>25 minutes</option>
                      <option value={50}>50 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                      {!isFreeUser && (
                        <>
                          <option value={240}>4 hours</option>
                          <option value={300}>5 hours</option>
                          <option value={360}>6 hours</option>
                          <option value={420}>7 hours</option>
                          <option value={480}>8 hours</option>
                        </>
                      )}
                    </select>
                    {isFreeUser && (
                      <Link
                        href="/billing"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        Upgrade for unlimited
                      </Link>
                    )}
                  </div>
                  {error && (
                    <div className="mb-4 skeuo-alert text-sm text-red-400 border-red-500/20">
                      {error}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                {!isRunning ? (
                  <button
                    onClick={startSession}
                    className="skeuo-button inline-flex items-center gap-3 px-8 py-4 text-white font-medium text-lg transition-all"
                  >
                    <Play className="w-5 h-5" />
                    Start Session
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsRunning(false)}
                      className="skeuo-card hover:bg-zinc-800 inline-flex items-center gap-3 px-8 py-4 text-white font-medium text-lg transition-colors cursor-pointer"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                    <button
                      onClick={stopSession}
                      className="skeuo-button inline-flex items-center gap-3 px-8 py-4 text-white font-medium text-lg transition-all"
                      style={{ background: 'linear-gradient(145deg, #e83d3d, #b82e2e)' }}
                    >
                      <Square className="w-5 h-5" />
                      Stop
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="skeuo-card px-8 py-6 flex items-center justify-between gap-6 w-full max-w-sm mx-auto">
                  <div className="text-left">
                    <div className="text-3xl font-bold mb-1 embossed-text">{distractions}</div>
                    <div className="text-zinc-400 text-sm">Distractions</div>
                  </div>
                  <button
                    onClick={logDistraction}
                    disabled={!isRunning}
                    className="skeuo-chip py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Log
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 flex items-center justify-center">
                <label className="flex items-center gap-4 text-sm text-zinc-300 font-medium cursor-pointer skeuo-card px-6 py-4 w-full max-w-sm">
                  <div
                    onClick={() => setAutoDetectDistractions(!autoDetectDistractions)}
                    className={`skeuo-toggle shrink-0 ${autoDetectDistractions ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                  />
                  <span className="text-left leading-tight">Auto-detect focus loss (window switches)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="skeuo-panel p-8">
            <h2 className="text-xl font-bold mb-6 embossed-text">Recent Sessions</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No sessions yet</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="skeuo-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-zinc-200">{formatSessionDuration(session.durationMinutes)}</span>
                      <span className="text-xs text-zinc-500">{formatRelativeTime(session.createdAt)}</span>
                    </div>
                    <div className="text-xs text-zinc-400 bg-black/20 inline-block px-2 py-1 rounded">
                      {session.distractionCount} distraction{session.distractionCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
