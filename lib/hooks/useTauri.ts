/**
 * React hooks for Tauri API
 * 
 * These hooks provide a convenient way to use Tauri commands in React components
 * with proper state management and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { tauriApi } from '@/lib/tauri-api';

/**
 * Hook to check if running in Tauri environment
 */
export function useIsTauri() {
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    setIsTauri(tauriApi.isTauriEnvironment());
  }, []);

  return isTauri;
}

/**
 * Hook for monitoring status
 */
export function useMonitoring() {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await tauriApi.monitoring.start();
      setIsActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await tauriApi.monitoring.stop();
      setIsActive(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isActive,
    loading,
    error,
    start,
    stop,
  };
}

/**
 * Hook for fetching activity logs
 */
export function useActivityLogs(startTime?: number, endTime?: number) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!startTime || !endTime) return;

    setLoading(true);
    setError(null);
    try {
      const result = await tauriApi.activityLogs.getLogs(startTime, endTime);
      setLogs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (tauriApi.isTauriEnvironment() && startTime && endTime) {
      fetchLogs();
    }
  }, [startTime, endTime, fetchLogs]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
}

/**
 * Hook for app version
 */
export function useAppVersion() {
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tauriApi.isTauriEnvironment()) {
      setLoading(false);
      return;
    }

    const fetchVersion = async () => {
      try {
        const v = await tauriApi.system.getVersion();
        setVersion(v);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchVersion();
  }, []);

  return { version, loading, error };
}

/**
 * Generic hook for Tauri commands
 */
export function useTauriCommand<T>(
  commandFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    if (!tauriApi.isTauriEnvironment()) {
      setError('Not running in Tauri environment');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await commandFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [commandFn, ...deps]);

  return {
    data,
    loading,
    error,
    execute,
  };
}
