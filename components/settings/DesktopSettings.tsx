'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Download, Trash2, Database, FolderOpen, FileText, AlertCircle, Activity, CloudCog, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { tauriApi } from '@/lib/tauri-api';
import DiagnosticTool from './DiagnosticTool';
import { desktopNotifications } from '@/lib/desktop-notifications';
import Link from 'next/link';

interface NotificationSettings {
  enabled: boolean;
  timeout_ms: number;
}

interface ExportResult {
  file_path: string;
  metadata: {
    export_date: string;
    app_version: string;
    record_count: number;
  };
  file_size: number;
}

export default function DesktopSettings() {
  const [activeSection, setActiveSection] = useState<'settings' | 'diagnostics'>('settings');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    timeout_ms: 5000,
  });
  const [exportDirectory, setExportDirectory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notifPermission, setNotifPermission] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    loadSettings();
    desktopNotifications.getPermissionStatus().then(setNotifPermission);
  }, []);

  const loadSettings = async () => {
    try {
      const [notifSettings, exportDir] = await Promise.all([
        tauriApi.notifications.getSettings().catch(() => ({ enabled: true, timeout_ms: 5000 })),
        tauriApi.exportData.getExportDirectory().catch(() => '~/Documents/FocusForge/exports'),
      ]);

      setNotificationSettings(notifSettings);
      setExportDirectory(exportDir);

      // Also load from localStorage as fallback
      const localSettings = localStorage.getItem('ff_notif_settings');
      if (localSettings && !notifSettings) {
        setNotificationSettings(JSON.parse(localSettings));
      }
    } catch (error) {
      console.error('Error loading desktop settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // In Tauri desktop, use the Rust backend to persist settings.
      // If the invoke fails (e.g., web preview), fall back to localStorage.
      try {
        await tauriApi.notifications.setSettings(
          notificationSettings.enabled,
          notificationSettings.timeout_ms
        );
      } catch {
        // Fallback: save to localStorage for non-Tauri environments
        localStorage.setItem('ff_notif_settings', JSON.stringify(notificationSettings));
      }

      // Send a test notification so the user can see it working
      await desktopNotifications.send({
        title: '🔔 Notifications Active',
        body: `Desktop notifications are ${notificationSettings.enabled ? 'enabled' : 'disabled'} with a ${notificationSettings.timeout_ms / 1000}s timeout.`,
        type: 'info',
        durationMs: 4000,
      });

      setMessage({ type: 'success', text: 'Notification settings saved successfully' });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setMessage({ type: 'error', text: 'Settings saved locally (cloud sync pending)' });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await desktopNotifications.requestPermission();
    const status = await desktopNotifications.getPermissionStatus();
    setNotifPermission(status);
    if (granted) {
      await desktopNotifications.send({
        title: '✅ Notifications Enabled!',
        body: 'You will now receive FocusForge desktop notifications.',
        type: 'achievement',
        durationMs: 5000,
      });
    }
  };

  const handleExportActivityLogs = async () => {
    setExporting(true);
    setMessage(null);

    try {
      // Export last 30 days
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (30 * 24 * 60 * 60);

      const result: ExportResult = await tauriApi.exportData.exportActivityLogsCsv(
        startTime,
        endTime
      );

      setMessage({
        type: 'success',
        text: `Exported ${result.metadata.record_count} records to ${result.file_path}`,
      });
    } catch (error) {
      console.error('Error exporting activity logs:', error);
      setMessage({ type: 'error', text: 'Failed to export activity logs' });
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllData = async () => {
    setExporting(true);
    setMessage(null);

    try {
      // Export all data
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = 0; // All time

      const result: ExportResult = await tauriApi.exportData.exportAllDataJson(
        startTime,
        endTime
      );

      const fileSizeMB = (result.file_size / (1024 * 1024)).toFixed(2);
      setMessage({
        type: 'success',
        text: `Exported all data (${fileSizeMB} MB) to ${result.file_path}`,
      });
    } catch (error) {
      console.error('Error exporting all data:', error);
      setMessage({ type: 'error', text: 'Failed to export all data' });
    } finally {
      setExporting(false);
    }
  };

  const handleClearNotificationHistory = async () => {
    if (!confirm('Are you sure you want to clear notification history?')) {
      return;
    }

    try {
      await tauriApi.notifications.clearHistory();
      setMessage({ type: 'success', text: 'Notification history cleared' });
    } catch (error) {
      console.error('Error clearing notification history:', error);
      setMessage({ type: 'error', text: 'Failed to clear notification history' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/5 rounded w-48 mb-4"></div>
          <div className="h-12 bg-white/5 rounded w-full mb-2"></div>
          <div className="h-12 bg-white/5 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-xl font-semibold mb-2">Desktop App Settings</h2>
        <p className="text-sm text-gray-400">
          Configure desktop-specific features including notifications, data export, and diagnostics
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveSection('settings')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeSection === 'settings'
            ? 'border-blue-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveSection('diagnostics')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeSection === 'diagnostics'
            ? 'border-blue-500 text-white'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <Activity className="w-4 h-4" />
          Diagnostics
        </button>
      </div>

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <>
          {message && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold">Notification Settings</h3>
            </div>

            <div className="space-y-4 pl-8">
              <div className="flex items-center justify-between p-6 skeuo-card">
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-gray-500">
                    Show desktop notifications for focus session events and distractions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationSettings.enabled}
                    onChange={(e) =>
                      setNotificationSettings({ ...notificationSettings, enabled: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="p-6 skeuo-card">
                <label className="block mb-2">
                  <span className="font-medium">Auto-dismiss Timeout</span>
                  <p className="text-sm text-gray-500 mb-3">
                    How long notifications stay visible before auto-dismissing
                  </p>
                </label>
                <select
                  value={notificationSettings.timeout_ms}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      timeout_ms: parseInt(e.target.value),
                    })
                  }
                  className="skeuo-input w-full px-5 py-3 text-white focus:outline-none"
                >
                  <option value="3000">3 seconds</option>
                  <option value="5000">5 seconds</option>
                  <option value="10000">10 seconds</option>
                  <option value="15000">15 seconds</option>
                  <option value="30000">30 seconds</option>
                </select>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button onClick={handleSaveNotifications} disabled={saving} className="skeuo-button px-6 py-3 font-medium text-white shadow-lg transition-all">
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </button>
                <button
                  onClick={() => desktopNotifications.send({ title: '🔔 Test Notification', body: 'FocusForge desktop notifications are working!', type: 'info', durationMs: 5000 })}
                  className="skeuo-card flex items-center px-6 py-3 font-medium text-white transition-all hover:bg-white/5"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Send Test
                </button>
                <button onClick={handleClearNotificationHistory} className="skeuo-card flex items-center px-6 py-3 font-medium text-white transition-all hover:bg-white/5">
                  <Trash2 className="w-5 h-5 mr-3" />
                  Clear History
                </button>
              </div>

              {/* OS Permission Card */}
              <div className={`p-5 skeuo-card flex items-center justify-between gap-4 ${notifPermission === 'granted'
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : notifPermission === 'denied'
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-amber-500/20 bg-amber-500/5'
                }`}>
                <div className="flex items-center gap-4">
                  <ShieldCheck className={`w-6 h-6 flex-shrink-0 ${notifPermission === 'granted' ? 'text-emerald-400'
                      : notifPermission === 'denied' ? 'text-red-400'
                        : 'text-amber-400'
                    }`} strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-bold text-white">
                      OS Notification Permission:{' '}
                      <span className={`capitalize ${notifPermission === 'granted' ? 'text-emerald-400'
                          : notifPermission === 'denied' ? 'text-red-400'
                            : 'text-amber-400'
                        }`}>{notifPermission}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {notifPermission === 'granted'
                        ? 'Native desktop notifications are active and working.'
                        : notifPermission === 'denied'
                          ? 'Blocked by OS. Enable in your system notification settings.'
                          : 'Click to request OS permission for native notifications.'
                      }
                    </p>
                  </div>
                </div>
                {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                  <button
                    onClick={handleRequestPermission}
                    className="skeuo-button px-5 py-2.5 text-sm font-bold text-white flex-shrink-0"
                  >
                    Allow
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Data Export</h3>
            </div>

            <div className="space-y-4 pl-8">
              <div className="p-6 skeuo-card">
                <div className="flex items-start gap-4 mb-4">
                  <FolderOpen className="w-6 h-6 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Export Directory</p>
                    <p className="text-sm text-gray-400 font-mono break-all">{exportDirectory}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 skeuo-card">
                  <FileText className="w-10 h-10 text-blue-400 mb-4" />
                  <h4 className="font-semibold mb-3">Activity Logs (CSV)</h4>
                  <p className="text-sm text-gray-400 mb-6">
                    Export the last 30 days of activity logs in CSV format for analysis in spreadsheet applications
                  </p>
                  <button
                    onClick={handleExportActivityLogs}
                    disabled={exporting}
                    className="skeuo-button w-full px-6 py-3 font-medium text-white shadow-lg transition-all"
                  >
                    {exporting ? 'Exporting...' : 'Export Activity Logs'}
                  </button>
                </div>

                <div className="p-6 skeuo-card">
                  <Database className="w-10 h-10 text-purple-400 mb-4" />
                  <h4 className="font-semibold mb-3">All Data (JSON)</h4>
                  <p className="text-sm text-gray-400 mb-6">
                    Export all your data including settings, categories, sessions, and activity logs in JSON format
                  </p>
                  <button
                    onClick={handleExportAllData}
                    disabled={exporting}
                    className="skeuo-button w-full px-6 py-3 font-medium text-white shadow-lg transition-all"
                  >
                    {exporting ? 'Exporting...' : 'Export All Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold">Data Retention</h3>
            </div>

            <div className="space-y-4 pl-8">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-400 mb-1">Data Retention Policy</p>
                    <p className="text-sm text-gray-300">
                      All activity data is stored locally on your device. You can configure automatic
                      data retention policies in a future update. For now, use the export feature to
                      back up your data before clearing old records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Configuration — now live */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <CloudCog className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold">Cloud Sync</h3>
            </div>

            <div className="space-y-4 pl-8">
              <div className="p-6 skeuo-card bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="flex-1">
                    <p className="font-bold text-emerald-400 mb-1">Cloud Sync is Live</p>
                    <p className="text-sm text-zinc-400 mb-4">
                      Your focus sessions and tasks now sync automatically with your cloud account every 5 minutes.
                      Open Cloud Sync settings to view your sync stats, trigger a manual sync, or pull data from the web.
                    </p>
                    <Link
                      href="/settings?tab=cloud-sync"
                      className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all"
                    >
                      <CloudCog className="w-4 h-4" />
                      Open Cloud Sync Settings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Diagnostics Section */}
      {activeSection === 'diagnostics' && <DiagnosticTool />}
    </motion.div>
  );
}
