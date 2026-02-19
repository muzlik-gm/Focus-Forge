'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Loader2 } from 'lucide-react';
import { post, get } from '@/lib/api-client';

interface Session {
  id: string;
  duration: number;
  distractions: number;
  createdAt: string;
}

export default function FocusPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60);
  const [distractions, setDistractions] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

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
      const res = await post('/api/sessions/start', { durationMinutes: 25 });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session.id);
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const stopSession = async () => {
    if (!sessionId) return;
    try {
      await post(`/api/sessions/${sessionId}/stop`, {});
      setIsRunning(false);
      setTime(25 * 60);
      setDistractions(0);
      setSessionId(null);
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Focus Session</h1>
        <p className="text-zinc-400 text-sm">Start a deep work session</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="text-7xl font-bold mb-8">{formatTime(time)}</div>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              {!isRunning ? (
                <button
                  onClick={startSession}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsRunning(false)}
                    className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                  <button
                    onClick={stopSession}
                    className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-8 text-sm">
              <div>
                <div className="text-2xl font-bold mb-1">{distractions}</div>
                <div className="text-zinc-400">Distractions</div>
              </div>
              <button
                onClick={logDistraction}
                disabled={!isRunning}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="font-medium mb-6">Recent Sessions</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No sessions yet</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border-b border-zinc-800 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{formatSessionDuration(session.duration)}</span>
                    <span className="text-xs text-zinc-500">{formatRelativeTime(session.createdAt)}</span>
                  </div>
                  <div className="text-xs text-zinc-500">{session.distractions} distraction{session.distractions !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
