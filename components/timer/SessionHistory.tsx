'use client';

import { useEffect, useState } from 'react';
import { FocusSession } from '@prisma/client';

/**
 * SessionHistory Component
 * 
 * Displays past focus sessions in a side panel with:
 * - Sessions in reverse chronological order
 * - Duration, distraction count, and notes for each session
 * - Distraction log with timestamps
 * 
 * Requirements: 23, 37
 */

interface Distraction {
  timestamp: string;
  note?: string;
}

interface SessionHistoryProps {
  onRefresh?: number; // Trigger to refresh the list
}

export function SessionHistory({ onRefresh }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [onRefresh]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/sessions?limit=20');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError('Failed to load session history');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Session History</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Session History</h2>
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchSessions}
          className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white 
            rounded-lg text-sm transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Session History</h2>
        <button
          onClick={fetchSessions}
          className="text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="Refresh session history"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No sessions yet</p>
          <p className="text-xs mt-1">Start your first focus session to see it here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {sessions.map((session) => {
            const distractions = (session.distractions as unknown as Distraction[]) || [];
            const isExpanded = expandedSessionId === session.id;
            const hasDistractions = distractions.length > 0;

            return (
              <div
                key={session.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 
                  hover:border-gray-600 transition-colors duration-200"
              >
                {/* Session Summary */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        {formatDuration(session.durationMinutes)}
                      </span>
                      {session.completed ? (
                        <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 
                          rounded-full border border-green-800">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-yellow-900/30 text-yellow-400 
                          rounded-full border border-yellow-800">
                          Stopped
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(session.startTime)}
                    </div>
                  </div>

                  {/* Distraction Count */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {session.distractionCount}
                      </div>
                      <div className="text-xs text-gray-400">
                        distraction{session.distractionCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Notes */}
                {session.notes && (
                  <div className="mt-3 p-3 bg-gray-900 rounded border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Notes:</div>
                    <div className="text-sm text-gray-300">{session.notes}</div>
                  </div>
                )}

                {/* Expand/Collapse Button for Distractions */}
                {hasDistractions && (
                  <button
                    onClick={() => toggleExpanded(session.id)}
                    className="mt-3 w-full flex items-center justify-between px-3 py-2 
                      bg-gray-900 hover:bg-gray-700 rounded border border-gray-700 
                      transition-colors duration-200 text-sm text-gray-300"
                  >
                    <span>
                      {isExpanded ? 'Hide' : 'Show'} distraction log
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Distraction Log */}
                {isExpanded && hasDistractions && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-gray-400 font-medium mb-2">
                      Distraction Log:
                    </div>
                    {distractions.map((distraction, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-gray-900 rounded 
                          border border-gray-700"
                      >
                        <div className="flex-shrink-0 w-16 text-xs text-gray-400">
                          {formatTimestamp(distraction.timestamp)}
                        </div>
                        <div className="flex-1 text-sm text-gray-300">
                          {distraction.note || 'No note'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
