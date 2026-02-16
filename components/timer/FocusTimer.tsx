'use client';

import { useState, useEffect, useRef } from 'react';
import { post } from '@/lib/api-client';

/**
 * FocusTimer Component
 * 
 * Interactive timer for focus sessions with:
 * - Countdown display showing remaining time
 * - Start, pause, resume, stop controls
 * - Distraction logging button
 * - Timer tick using useEffect
 * - Completion notification
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 42, 49
 */

interface FocusTimerProps {
  sessionId?: string;
  initialDuration?: number; // in minutes
  onSessionComplete?: () => void;
  onSessionStop?: () => void;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export function FocusTimer({
  sessionId: initialSessionId,
  initialDuration = 25,
  onSessionComplete,
  onSessionStop,
}: FocusTimerProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [state, setState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60); // in seconds
  const [duration, setDuration] = useState(initialDuration);
  const [distractionCount, setDistractionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notesAutoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Timer tick effect
  useEffect(() => {
    if (state === 'running' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer completed
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, timeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notesAutoSaveRef.current) {
        clearTimeout(notesAutoSaveRef.current);
      }
    };
  }, []);

  // Auto-save notes periodically (every 10 seconds)
  useEffect(() => {
    if ((state === 'running' || state === 'paused') && sessionId && notes) {
      // Clear existing timeout
      if (notesAutoSaveRef.current) {
        clearTimeout(notesAutoSaveRef.current);
      }

      // Set new timeout for auto-save
      notesAutoSaveRef.current = setTimeout(() => {
        saveNotes();
      }, 10000); // 10 seconds

      return () => {
        if (notesAutoSaveRef.current) {
          clearTimeout(notesAutoSaveRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, state, sessionId]);

  const saveNotes = async () => {
    if (!sessionId || !notes) return;

    setIsSavingNotes(true);
    
    try {
      await post(`/api/sessions/${sessionId}/notes`, { notes });
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleTimerComplete = async () => {
    setState('completed');
    setShowNotification(true);
    
    // Play subtle sound (optional - browser support varies)
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio errors
      });
    } catch {
      // Ignore audio errors
    }

    // Stop the session on the backend with notes
    if (sessionId) {
      try {
        await post(`/api/sessions/${sessionId}/stop`, {
          notes: notes || undefined,
        });
      } catch (err) {
        console.error('Error stopping session:', err);
      }
    }

    // Request browser notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Send browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Session Complete! 🎉', {
        body: `Great work! You completed ${duration} minutes with ${distractionCount} distraction${distractionCount !== 1 ? 's' : ''}.`,
        icon: '/icon.png',
      });
    }

    if (onSessionComplete) {
      onSessionComplete();
    }
  };

  const handleStart = async () => {
    setError(null);
    
    try {
      // Start a new session on the backend
      const response = await post('/api/sessions/start', {
        durationMinutes: duration,
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      setSessionId(data.session.id);
      setTimeRemaining(duration * 60);
      setDistractionCount(0);
      setNotes('');
      setState('running');
      setShowNotification(false);
    } catch (err) {
      setError('Failed to start session. Please try again.');
      console.error('Error starting session:', err);
    }
  };

  const handlePause = async () => {
    if (!sessionId) return;
    
    setError(null);
    
    try {
      const response = await post(`/api/sessions/${sessionId}/pause`, {});

      if (!response.ok) {
        throw new Error('Failed to pause session');
      }

      setState('paused');
    } catch (err) {
      setError('Failed to pause session.');
      console.error('Error pausing session:', err);
    }
  };

  const handleResume = async () => {
    if (!sessionId) return;
    
    setError(null);
    
    try {
      const response = await post(`/api/sessions/${sessionId}/resume`, {});

      if (!response.ok) {
        throw new Error('Failed to resume session');
      }

      setState('running');
    } catch (err) {
      setError('Failed to resume session.');
      console.error('Error resuming session:', err);
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;
    
    setError(null);
    
    try {
      const response = await post(`/api/sessions/${sessionId}/stop`, {
        notes: notes || undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to stop session');
      }

      setState('idle');
      setTimeRemaining(duration * 60);
      setSessionId(null);
      setNotes('');
      
      if (onSessionStop) {
        onSessionStop();
      }
    } catch (err) {
      setError('Failed to stop session.');
      console.error('Error stopping session:', err);
    }
  };

  const handleLogDistraction = async () => {
    if (!sessionId || state !== 'running') return;
    
    setError(null);
    
    try {
      const response = await post(`/api/sessions/${sessionId}/distraction`, {});

      if (!response.ok) {
        throw new Error('Failed to log distraction');
      }

      setDistractionCount((prev) => prev + 1);
    } catch (err) {
      setError('Failed to log distraction.');
      console.error('Error logging distraction:', err);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = (): string => {
    const elapsed = (duration * 60) - timeRemaining;
    return formatTime(elapsed);
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-7xl font-bold text-white mb-2 font-mono tabular-nums">
          {formatTime(timeRemaining)}
        </div>
        
        {state !== 'idle' && (
          <div className="text-sm text-gray-400">
            Elapsed: {getElapsedTime()} / {duration}:00
          </div>
        )}

        {state === 'paused' && (
          <div className="mt-2 text-yellow-400 text-sm font-medium">
            ⏸ Paused
          </div>
        )}

        {state === 'completed' && (
          <div className="mt-2 text-green-400 text-sm font-medium">
            ✓ Completed!
          </div>
        )}
      </div>

      {/* Duration Input (only when idle) */}
      {state === 'idle' && (
        <div className="mb-6">
          <label htmlFor="duration" className="block text-sm text-gray-400 mb-2">
            Session Duration (minutes)
          </label>
          <input
            id="duration"
            type="number"
            min="1"
            max="480"
            value={duration}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setDuration(Math.min(480, Math.max(1, value)));
              setTimeRemaining(Math.min(480, Math.max(1, value)) * 60);
            }}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg
              text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Timer Controls */}
      <div className="flex gap-3 mb-6">
        {state === 'idle' && (
          <button
            onClick={handleStart}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white 
              rounded-lg font-medium transition-colors duration-200 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              focus:ring-offset-gray-900"
          >
            Start Focus Session
          </button>
        )}

        {state === 'running' && (
          <>
            <button
              onClick={handlePause}
              className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white 
                rounded-lg font-medium transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 
                focus:ring-offset-gray-900"
            >
              Pause
            </button>
            <button
              onClick={handleStop}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white 
                rounded-lg font-medium transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                focus:ring-offset-gray-900"
            >
              Stop
            </button>
          </>
        )}

        {state === 'paused' && (
          <>
            <button
              onClick={handleResume}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white 
                rounded-lg font-medium transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                focus:ring-offset-gray-900"
            >
              Resume
            </button>
            <button
              onClick={handleStop}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white 
                rounded-lg font-medium transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                focus:ring-offset-gray-900"
            >
              Stop
            </button>
          </>
        )}

        {state === 'completed' && (
          <button
            onClick={() => {
              setState('idle');
              setTimeRemaining(duration * 60);
              setSessionId(null);
              setNotes('');
              setShowNotification(false);
            }}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white 
              rounded-lg font-medium transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              focus:ring-offset-gray-900"
          >
            Start New Session
          </button>
        )}
      </div>

      {/* Distraction Counter and Log Button */}
      {(state === 'running' || state === 'paused') && (
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Distractions:</span>
            <span className="text-2xl font-bold text-white font-mono">
              {distractionCount}
            </span>
          </div>
          
          {state === 'running' && (
            <button
              onClick={handleLogDistraction}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white 
                rounded-lg text-sm font-medium transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Log distraction"
            >
              Log Distraction
            </button>
          )}
        </div>
      )}

      {/* Session Notes Input */}
      {(state === 'running' || state === 'paused') && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="session-notes" className="text-sm text-gray-400">
              Session Notes
            </label>
            {isSavingNotes && (
              <span className="text-xs text-gray-500">Saving...</span>
            )}
          </div>
          <textarea
            id="session-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What are you working on? Any thoughts or insights..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
              text-white placeholder-gray-500 resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors duration-200"
          />
          <div className="mt-1 text-xs text-gray-500">
            Notes auto-save every 10 seconds
          </div>
        </div>
      )}

      {/* Completion Notification */}
      {showNotification && state === 'completed' && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <h3 className="text-green-400 font-medium mb-2">
            🎉 Focus Session Complete!
          </h3>
          <p className="text-gray-300 text-sm">
            Great work! You completed {duration} minutes with {distractionCount} distraction{distractionCount !== 1 ? 's' : ''}.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                setState('idle');
                setTimeRemaining(duration * 60);
                setSessionId(null);
                setNotes('');
                setShowNotification(false);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Start Another Session
            </button>
            <button
              onClick={() => setShowNotification(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white 
                rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Take a Break
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
