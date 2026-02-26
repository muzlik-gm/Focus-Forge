'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Wrench,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { tauriApi } from '@/lib/tauri-api';

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
}

interface SystemInfo {
  appVersion: string;
  platform: string;
  arch: string;
  tauriVersion: string;
}

interface DatabaseInfo {
  isHealthy: boolean;
  backupCount: number;
  databaseSizeBytes: number;
  databasePath: string;
}

export default function DiagnosticTool() {
  const [running, setRunning] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const runFullDiagnostic = async () => {
    setRunning(true);
    setDiagnosticResults([]);
    const results: DiagnosticResult[] = [];

    try {
      // System Information
      results.push({
        status: 'info',
        message: 'Checking system information...',
      });

      try {
        const version = await tauriApi.system.getVersion();
        const platform = typeof window !== 'undefined' ? navigator.platform : 'Unknown';
        const arch = typeof window !== 'undefined' ? (navigator as any).userAgentData?.platform || 'Unknown' : 'Unknown';
        
        setSystemInfo({
          appVersion: version,
          platform,
          arch,
          tauriVersion: '1.x', // Tauri v1
        });

        results.push({
          status: 'success',
          message: 'System information retrieved',
          details: `App Version: ${version}, Platform: ${platform}`,
        });
      } catch (error) {
        results.push({
          status: 'error',
          message: 'Failed to retrieve system information',
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Database Health Check
      results.push({
        status: 'info',
        message: 'Checking database health...',
      });

      try {
        const recoveryInfo = await tauriApi.database.getRecoveryInfo();
        setDatabaseInfo(recoveryInfo);

        if (recoveryInfo.is_healthy) {
          results.push({
            status: 'success',
            message: 'Database is healthy',
            details: `Size: ${formatBytes(recoveryInfo.database_size_bytes)}, Backups: ${recoveryInfo.backup_count}`,
          });
        } else {
          results.push({
            status: 'warning',
            message: 'Database may have issues',
            details: 'Consider running recovery or creating a backup',
          });
        }
      } catch (error) {
        results.push({
          status: 'error',
          message: 'Failed to check database health',
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Database Integrity Check
      results.push({
        status: 'info',
        message: 'Running database integrity check...',
      });

      try {
        const isIntegrityOk = await tauriApi.database.checkIntegrity();
        if (isIntegrityOk) {
          results.push({
            status: 'success',
            message: 'Database integrity check passed',
          });
        } else {
          results.push({
            status: 'error',
            message: 'Database integrity check failed',
            details: 'Database may be corrupted. Consider running recovery.',
          });
        }
      } catch (error) {
        results.push({
          status: 'error',
          message: 'Failed to run integrity check',
          details: error instanceof Error ? error.message : String(error),
        });
      }

      // Monitoring Status
      results.push({
        status: 'info',
        message: 'Checking monitoring system...',
      });

      try {
        const activeWindow = await tauriApi.monitoring.getActiveWindow();
        results.push({
          status: 'success',
          message: 'Monitoring system is operational',
          details: `Currently tracking: ${activeWindow.name}`,
        });
      } catch (error) {
        results.push({
          status: 'warning',
          message: 'Monitoring system may not be running',
          details: 'Try starting monitoring from the dashboard',
        });
      }

      // Final summary
      const errorCount = results.filter((r) => r.status === 'error').length;
      const warningCount = results.filter((r) => r.status === 'warning').length;

      if (errorCount === 0 && warningCount === 0) {
        results.push({
          status: 'success',
          message: 'All diagnostic checks passed',
        });
      } else if (errorCount > 0) {
        results.push({
          status: 'error',
          message: `Diagnostic completed with ${errorCount} error(s) and ${warningCount} warning(s)`,
        });
      } else {
        results.push({
          status: 'warning',
          message: `Diagnostic completed with ${warningCount} warning(s)`,
        });
      }
    } catch (error) {
      results.push({
        status: 'error',
        message: 'Diagnostic failed',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setDiagnosticResults(results);
      setRunning(false);
    }
  };

  const handleCreateBackup = async () => {
    setActionInProgress('backup');
    try {
      const backup = await tauriApi.database.createBackup();
      setDiagnosticResults((prev) => [
        ...prev,
        {
          status: 'success',
          message: 'Backup created successfully',
          details: `Path: ${backup.path}, Size: ${formatBytes(backup.size_bytes)}`,
        },
      ]);
      
      // Refresh database info
      const recoveryInfo = await tauriApi.database.getRecoveryInfo();
      setDatabaseInfo(recoveryInfo);
    } catch (error) {
      setDiagnosticResults((prev) => [
        ...prev,
        {
          status: 'error',
          message: 'Failed to create backup',
          details: error instanceof Error ? error.message : String(error),
        },
      ]);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRunVacuum = async () => {
    setActionInProgress('vacuum');
    try {
      const result = await tauriApi.database.vacuum();
      setDiagnosticResults((prev) => [
        ...prev,
        {
          status: 'success',
          message: 'Database optimized successfully',
          details: result,
        },
      ]);
      
      // Refresh database info
      const recoveryInfo = await tauriApi.database.getRecoveryInfo();
      setDatabaseInfo(recoveryInfo);
    } catch (error) {
      setDiagnosticResults((prev) => [
        ...prev,
        {
          status: 'error',
          message: 'Failed to optimize database',
          details: error instanceof Error ? error.message : String(error),
        },
      ]);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRecoverDatabase = async () => {
    if (
      !confirm(
        'This will attempt to recover the database. A backup will be created first. Continue?'
      )
    ) {
      return;
    }

    setActionInProgress('recover');
    try {
      const result = await tauriApi.database.recover();
      setDiagnosticResults((prev) => [
        ...prev,
        {
          status: 'success',
          message: 'Database recovery completed',
          details: result,
        },
      ]);
      
      // Refresh database info
      const recoveryInfo = await tauriApi.database.getRecoveryInfo();
      setDatabaseInfo(recoveryInfo);
    } catch (error) {
      setDiagnosticResults((prev) => [
        ...prev,
        {
          status: 'error',
          message: 'Database recovery failed',
          details: error instanceof Error ? error.message : String(error),
        },
      ]);
    } finally {
      setActionInProgress(null);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold mb-2">System Diagnostics</h2>
        <p className="text-sm text-gray-400">
          Check system health, database integrity, and troubleshoot issues
        </p>
      </div>

      {/* Run Diagnostic Button */}
      <div className="flex gap-3">
        <Button onClick={runFullDiagnostic} disabled={running} className="flex items-center gap-2">
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              Run Full Diagnostic
            </>
          )}
        </Button>
      </div>

      {/* System Information */}
      {systemInfo && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">System Information</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pl-8">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">App Version</p>
              <p className="font-mono text-sm">{systemInfo.appVersion}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Platform</p>
              <p className="font-mono text-sm">{systemInfo.platform}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Architecture</p>
              <p className="font-mono text-sm">{systemInfo.arch}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Tauri Version</p>
              <p className="font-mono text-sm">{systemInfo.tauriVersion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Database Health */}
      {databaseInfo && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Database Health</h3>
          </div>

          <div className="space-y-4 pl-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {databaseInfo.isHealthy ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className="text-sm text-gray-400">Status</p>
                </div>
                <p className="font-semibold">
                  {databaseInfo.isHealthy ? 'Healthy' : 'Needs Attention'}
                </p>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Database Size</p>
                <p className="font-semibold">{formatBytes(databaseInfo.databaseSizeBytes)}</p>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Backup Count</p>
                <p className="font-semibold">{databaseInfo.backupCount} backups</p>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Database Path</p>
                <p className="font-mono text-xs break-all">{databaseInfo.databasePath}</p>
              </div>
            </div>

            {/* Database Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={handleCreateBackup}
                disabled={actionInProgress !== null}
                className="flex items-center gap-2"
              >
                {actionInProgress === 'backup' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Create Backup
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={handleRunVacuum}
                disabled={actionInProgress !== null}
                className="flex items-center gap-2"
              >
                {actionInProgress === 'vacuum' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    Optimize (VACUUM)
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={handleRecoverDatabase}
                disabled={actionInProgress !== null}
                className="flex items-center gap-2"
              >
                {actionInProgress === 'recover' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4" />
                    Recover Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Results */}
      {diagnosticResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold">Diagnostic Results</h3>
          </div>

          <div className="space-y-2 pl-8">
            {diagnosticResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <p className="font-medium">{result.message}</p>
                    {result.details && (
                      <p className="text-sm mt-1 opacity-80">{result.details}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-2">About Diagnostics</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Run full diagnostic to check system health and database integrity</li>
              <li>Create backups regularly to protect your data</li>
              <li>Use VACUUM to optimize database performance</li>
              <li>Run recovery if you experience database corruption</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
