'use client';

import { useState, useEffect } from 'react';
import { tauriApi } from '@/lib/tauri-api';

export default function DebugTrackingPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(typeof window !== 'undefined' && !!(window as any).__TAURI__);
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testMonitoring = async () => {
    try {
      addLog('Testing monitoring status...');
      const status = await tauriApi.monitoring.getStatus();
      addLog(`Monitoring status: ${status ? 'RUNNING' : 'STOPPED'}`);
      
      if (!status) {
        addLog('Starting monitoring...');
        await tauriApi.monitoring.start();
        addLog('Monitoring started successfully');
      }
    } catch (err) {
      addLog(`ERROR: ${err}`);
    }
  };

  const testCurrentApp = async () => {
    try {
      addLog('Getting current application...');
      const app = await tauriApi.monitoring.getActiveWindow();
      addLog(`Current app: ${app.name} (PID: ${app.process_id})`);
      
      addLog('Getting category...');
      const category = await tauriApi.categories.getCategoryWithFallback(app.name);
      addLog(`Category: ${category}`);
    } catch (err) {
      addLog(`ERROR: ${err}`);
    }
  };

  const testActivityLogs = async () => {
    try {
      addLog('Getting today\'s activity logs...');
      const now = Math.floor(Date.now() / 1000);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startTime = Math.floor(startOfDay.getTime() / 1000);
      
      addLog(`Querying from ${startTime} to ${now} (${now - startTime} seconds range)`);
      const logs = await tauriApi.activityLogs.getLogs(startTime, now);
      addLog(`Found ${logs.length} activity logs`);
      
      if (logs.length > 0) {
        addLog('Last 5 logs:');
        logs.slice(-5).forEach(log => {
          addLog(`  - ${log.application}: ${log.duration}s (timestamp: ${log.timestamp})`);
        });
      }
    } catch (err) {
      addLog(`ERROR: ${err}`);
    }
  };

  const testCategories = async () => {
    try {
      addLog('Testing category system...');
      
      const testApps = ['Kiro', 'Chrome', 'Discord', 'FocusForge'];
      for (const app of testApps) {
        const category = await tauriApi.categories.getCategoryWithFallback(app);
        addLog(`${app}: ${category}`);
      }
    } catch (err) {
      addLog(`ERROR: ${err}`);
    }
  };

  const runAllTests = async () => {
    setLogs([]);
    addLog('=== Starting Diagnostic Tests ===');
    await testMonitoring();
    await testCurrentApp();
    await testActivityLogs();
    await testCategories();
    addLog('=== Tests Complete ===');
  };

  if (!isDesktop) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Tracking</h1>
        <p className="text-red-400">This page only works in the desktop app.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Tracking System</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={runAllTests}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Run All Tests
        </button>
        <button
          onClick={testMonitoring}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Test Monitoring
        </button>
        <button
          onClick={testCurrentApp}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Test Current App
        </button>
        <button
          onClick={testActivityLogs}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Test Activity Logs
        </button>
        <button
          onClick={testCategories}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Test Categories
        </button>
        <button
          onClick={() => setLogs([])}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Clear
        </button>
      </div>

      <div className="bg-black p-4 rounded font-mono text-sm h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500">Click "Run All Tests" to start diagnostics...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={log.includes('ERROR') ? 'text-red-400' : 'text-green-400'}>
              {log}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded">
        <h2 className="font-bold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Run All Tests" to check if tracking is working</li>
          <li>Check if monitoring is running</li>
          <li>Check if current app is detected</li>
          <li>Check if activity logs are being created</li>
          <li>Check if categories are correct</li>
          <li>Share the output with support if issues persist</li>
        </ol>
      </div>
    </div>
  );
}
