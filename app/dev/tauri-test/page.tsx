'use client';

import { useState, useEffect } from 'react';
import { tauriApi } from '@/lib/tauri-api';

/**
 * Tauri IPC Test Page
 * 
 * This page provides a simple UI to test the Tauri IPC (Inter-Process Communication)
 * between the Next.js frontend and Rust backend.
 * 
 * It verifies that:
 * 1. The Tauri environment is detected correctly
 * 2. Commands can be invoked from the frontend
 * 3. Parameters are passed correctly
 * 4. Results are returned successfully
 */
export default function TauriTestPage() {
  const [isTauri, setIsTauri] = useState(false);
  const [pingResult, setPingResult] = useState<string>('');
  const [echoInput, setEchoInput] = useState('Hello from Next.js!');
  const [echoResult, setEchoResult] = useState<string>('');
  const [monitoringStatus, setMonitoringStatus] = useState<string>('');
  const [activeWindow, setActiveWindow] = useState<any>(null);
  const [runningApps, setRunningApps] = useState<any[]>([]);
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsTauri(tauriApi.isTauriEnvironment());
  }, []);

  const handleCommand = async (
    commandName: string,
    commandFn: () => Promise<any>,
    resultSetter: (result: any) => void
  ) => {
    setLoading((prev) => ({ ...prev, [commandName]: true }));
    setError('');
    try {
      const result = await commandFn();
      resultSetter(result);
    } catch (err) {
      setError(`Error in ${commandName}: ${err}`);
      console.error(`Error in ${commandName}:`, err);
    } finally {
      setLoading((prev) => ({ ...prev, [commandName]: false }));
    }
  };

  const testPing = () => {
    handleCommand('ping', tauriApi.system.getVersion, (result) => {
      setPingResult(`Received: ${result}`);
    });
  };

  const testEcho = () => {
    handleCommand(
      'echo',
      async () => {
        // Using the invoke API directly for the echo command
        const { invoke } = await import('@tauri-apps/api/tauri');
        return invoke<string>('echo', { message: echoInput });
      },
      setEchoResult
    );
  };

  const testStartMonitoring = () => {
    handleCommand('start_monitoring', tauriApi.monitoring.start, setMonitoringStatus);
  };

  const testStopMonitoring = () => {
    handleCommand('stop_monitoring', tauriApi.monitoring.stop, setMonitoringStatus);
  };

  const testGetActiveWindow = () => {
    handleCommand('get_active_window', tauriApi.monitoring.getActiveWindow, setActiveWindow);
  };

  const testGetRunningApps = () => {
    handleCommand('get_running_apps', tauriApi.monitoring.getRunningApps, setRunningApps);
  };

  const testGetVersion = () => {
    handleCommand('get_app_version', tauriApi.system.getVersion, setVersion);
  };

  if (!isTauri) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">
            ⚠️ Not Running in Tauri Environment
          </h1>
          <p className="text-yellow-700">
            This page is designed to test Tauri IPC commands and must be run within the Tauri
            desktop application.
          </p>
          <p className="text-yellow-700 mt-2">
            To test this page, run: <code className="bg-yellow-100 px-2 py-1 rounded">npm run tauri dev</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Tauri IPC Test Page</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800">
          ✅ Running in Tauri environment - IPC commands are available
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* System Commands */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Commands</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={testGetVersion}
                disabled={loading.get_app_version}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading.get_app_version ? 'Loading...' : 'Get App Version'}
              </button>
              {version && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <strong>Version:</strong> {version}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={testPing}
                disabled={loading.ping}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading.ping ? 'Loading...' : 'Test Ping'}
              </button>
              {pingResult && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <strong>Result:</strong> {pingResult}
                </div>
              )}
            </div>

            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={echoInput}
                  onChange={(e) => setEchoInput(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Enter message to echo"
                />
                <button
                  onClick={testEcho}
                  disabled={loading.echo}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading.echo ? 'Loading...' : 'Test Echo'}
                </button>
              </div>
              {echoResult && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <strong>Result:</strong> {echoResult}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Monitoring Commands */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Monitoring Commands</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={testStartMonitoring}
                disabled={loading.start_monitoring}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading.start_monitoring ? 'Loading...' : 'Start Monitoring'}
              </button>
              <button
                onClick={testStopMonitoring}
                disabled={loading.stop_monitoring}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
              >
                {loading.stop_monitoring ? 'Loading...' : 'Stop Monitoring'}
              </button>
            </div>
            {monitoringStatus && (
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <strong>Status:</strong> {monitoringStatus}
              </div>
            )}

            <div>
              <button
                onClick={testGetActiveWindow}
                disabled={loading.get_active_window}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading.get_active_window ? 'Loading...' : 'Get Active Window'}
              </button>
              {activeWindow && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <strong>Active Window:</strong> {activeWindow.name}
                  <div className="text-sm text-gray-600 mt-1">
                    Process ID: {activeWindow.process_id}
                    {activeWindow.bundle_id && <div>Bundle ID: {activeWindow.bundle_id}</div>}
                    <div className="text-xs truncate">Path: {activeWindow.executable_path}</div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={testGetRunningApps}
                disabled={loading.get_running_apps}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading.get_running_apps ? 'Loading...' : 'Get Running Apps'}
              </button>
              {runningApps.length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <strong>Running Apps:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {runningApps.map((app, index) => (
                      <li key={index}>{app.name} (PID: {app.process_id})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="border rounded-lg p-6 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click each button to test the corresponding Tauri command</li>
            <li>Verify that results are displayed correctly</li>
            <li>Check the terminal/console for log messages from the Rust backend</li>
            <li>Test the echo command with different input messages</li>
            <li>Verify that monitoring start/stop commands work</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
