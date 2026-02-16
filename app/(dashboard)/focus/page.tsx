'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus } from 'lucide-react';

interface Session {
  id: string;
  duration: number;
  distractions: number;
  createdAt: string;
}

export default function FocusPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [distractions, setDistractions] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions?limit=10');
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Focus session</h1>
        <p className="text-sm text-gray-400">Start a deep work session and track your focus.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Timer */}
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-lg p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="text-8xl font-bold mb-8 tracking-tight">{formatTime(time)}</div>
            
            <div className="flex items-center justify-center gap-4 mb-12">
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-8 py-3 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsRunning(false)}
                    className="px-8 py-3 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-100 transition flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      setTime(25 * 60);
                      setDistractions(0);
                    }}
                    className="px-8 py-3 border border-white/20 text-sm font-medium rounded-md hover:bg-white/5 transition flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div>
                <div className="text-2xl font-bold text-white mb-1">{distractions}</div>
                <div>Distractions</div>
              </div>
              <button
                onClick={() => setDistractions(d => d + 1)}
                disabled={!isRunning}
                className="px-4 py-2 border border-white/20 text-sm font-medium rounded-md hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log distraction
              </button>
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-base font-semibold mb-6">Recent sessions</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse"></div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No sessions yet</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border-b border-white/5 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{formatSessionDuration(session.duration)}</span>
                    <span className="text-xs text-gray-500">{formatRelativeTime(session.createdAt)}</span>
                  </div>
                  <div className="text-xs text-gray-500">{session.distractions} distraction{session.distractions !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
