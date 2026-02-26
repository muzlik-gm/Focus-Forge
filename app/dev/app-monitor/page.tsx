'use client';

import { useState, useEffect } from 'react';

interface ApplicationInfo {
  name: string;
  process_id: number;
  bundle_id: string | null;
  executable_path: string;
}

export default function AppMonitorPage() {
  const [activeApp, setActiveApp] = useState<ApplicationInfo | null>(null);
  const [runningApps, setRunningApps] = useState<ApplicationInfo[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tauriInvoke, setTauriInvoke] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Dynamically import Tauri API
    const initTauri = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/tauri');
        setTauriInvoke(() => invoke);
        setIsDesktop(true);
        checkMonitoringStatus(invoke);
      } catch (e) {
        setError('This page only works in the desktop app');
      }
    };
    
    initTauri();
  }, []);

  const checkMonitoringStatus = async (invoke: any) => {
    try {
      const status = await invoke<boolean>('get_monitoring_status');
      setIsMonitoring(status);
    } catch (err) {
      console.error('Failed to check monitoring status:', err);
    }
  };

  const startMonitoring = async () => {
    if (!tauriInvoke) return;
    
    try {
      setLoading(true);
      setError(null);
      await tauriInvoke('start_monitoring');
      setIsMonitoring(true);
    } catch (err) {
      setError(`Failed to start monitoring: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    if (!tauriInvoke) return;
    
    try {
      setLoading(true);
      setError(null);
      await tauriInvoke('stop_monitoring');
      setIsMonitoring(false);
    } catch (err) {
      setError(`Failed to stop monitoring: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveApp = async () => {
    if (!tauriInvoke) return;
    
    try {
      setError(null);
      const app = await tauriInvoke<ApplicationInfo>('get_active_window');
      setActiveApp(app);
    } catch (err) {
      setError(`Failed to get active window: ${err}`);
    }
  };

  const refreshRunningApps = async () => {
    if (!tauriInvoke) return;
    
    try {
      setError(null);
      const apps = await tauriInvoke<ApplicationInfo[]>('get_running_apps');
      setRunningApps(apps);
    } catch (err) {
      setError(`Failed to get running apps: ${err}`);
    }
  };

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Desktop Only</h1>
          <p className="text-gray-600">This page only works in the desktop app.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Application Monitor Test</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Monitoring Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Monitoring Service</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">
                {isMonitoring ? 'Running' : 'Stopped'}
              </span>
            </div>
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              disabled={loading}
              className={`px-4 py-2 rounded font-medium ${
                isMonitoring
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50`}
            >
              {loading ? 'Loading...' : isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
        </div>

        {/* Active Application */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Application</h2>
            <button
              onClick={refreshActiveApp}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
            >
              Refresh
            </button>
          </div>
          {activeApp ? (
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="font-medium w-32">Name:</span>
                <span className="text-gray-700">{activeApp.name}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Process ID:</span>
                <span className="text-gray-700">{activeApp.process_id}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Path:</span>
                <span className="text-gray-700 text-sm break-all">{activeApp.executable_path}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Click "Refresh" to get the active application</p>
          )}
        </div>

        {/* Running Applications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Running Applications ({runningApps.length})
            </h2>
            <button
              onClick={refreshRunningApps}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
            >
              Refresh
            </button>
          </div>
          {runningApps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Process ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Executable Path
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {runningApps.map((app, index) => (
                    <tr key={`${app.process_id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {app.process_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 break-all">
                        {app.executable_path}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Click "Refresh" to list all running applications</p>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Click "Start Monitoring" to begin tracking application focus</li>
            <li>Click "Refresh" under Active Application to see which app is currently focused</li>
            <li>Click "Refresh" under Running Applications to see all open apps with windows</li>
            <li>Switch to different applications and refresh to see the changes</li>
            <li>When monitoring is active, all focus changes are logged to the database</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
