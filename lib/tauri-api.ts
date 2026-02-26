/**
 * Tauri API Client
 * 
 * This module provides a typed interface for communicating with the Rust backend
 * via Tauri's IPC (Inter-Process Communication) system.
 * 
 * All functions use the `invoke` API to call Rust commands defined in src-tauri/src/main.rs
 * 
 * Requirements: 2.3, 2.5
 */

import { invoke } from '@tauri-apps/api/tauri';
import type {
  ApplicationInfo,
  ActivityLog,
  ApplicationCategory,
  FocusSessionConfig,
  FocusSession,
  SessionSummary,
  DistractionEvent,
  MonitoringStatus,
} from '@/types/tauri';

/**
 * Check if the app is running in Tauri environment
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Monitoring Commands
 */
export const monitoring = {
  /**
   * Start the system monitoring service
   * @returns Success message
   */
  async start(): Promise<string> {
    return invoke<string>('start_monitoring');
  },

  /**
   * Stop the system monitoring service
   * @returns Success message
   */
  async stop(): Promise<string> {
    return invoke<string>('stop_monitoring');
  },

  /**
   * Get information about the currently active window
   * @returns Active window information
   */
  async getActiveWindow(): Promise<ApplicationInfo> {
    return invoke<ApplicationInfo>('get_active_window');
  },

  /**
   * Get list of all running applications
   * @returns Array of application information
   */
  async getRunningApps(): Promise<ApplicationInfo[]> {
    return invoke<ApplicationInfo[]>('get_running_apps');
  },

  /**
   * Get current monitoring status
   * @returns Monitoring status information
   */
  async getStatus(): Promise<MonitoringStatus> {
    // TODO: Implement in Rust backend (task 4.1)
    return invoke<MonitoringStatus>('get_monitoring_status');
  },
};

/**
 * Activity Log Commands
 */
export const activityLogs = {
  /**
   * Create a new activity log entry
   * @param application Application name
   * @param timestamp Unix timestamp (seconds)
   * @param duration Duration in seconds
   * @returns Activity log ID
   */
  async create(application: string, timestamp: number, duration: number): Promise<number> {
    return invoke<number>('create_activity_log', { application, timestamp, duration });
  },

  /**
   * Get activity logs for a specific time range
   * @param startTime Unix timestamp (seconds)
   * @param endTime Unix timestamp (seconds)
   * @returns Array of activity log entries
   */
  async getLogs(startTime: number, endTime: number): Promise<ActivityLog[]> {
    return invoke<ActivityLog[]>('get_activity_logs', { startTime, endTime });
  },

  /**
   * Get activity logs for today
   * @returns Array of activity log entries
   */
  async getToday(): Promise<ActivityLog[]> {
    const now = Math.floor(Date.now() / 1000);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTime = Math.floor(startOfDay.getTime() / 1000);
    return this.getLogs(startTime, now);
  },

  /**
   * Get time spent per application in a time range
   * @param startTime Unix timestamp (seconds)
   * @param endTime Unix timestamp (seconds)
   * @returns Array of [application, duration] tuples
   */
  async getTimeByApplication(startTime: number, endTime: number): Promise<[string, number][]> {
    return invoke<[string, number][]>('get_time_by_application', { startTime, endTime });
  },
};

/**
 * Application Category Commands
 */
export const categories = {
  /**
   * Get the category for a specific application
   * @param application Application name
   * @returns Application category or null if not found
   */
  async getCategory(application: string): Promise<ApplicationCategory | null> {
    return invoke<ApplicationCategory | null>('get_application_category', { application });
  },

  /**
   * Get category with fallback to Neutral
   * @param application Application name
   * @returns Category name (defaults to "Neutral" if not found)
   */
  async getCategoryWithFallback(application: string): Promise<string> {
    return invoke<string>('get_category_with_fallback', { application });
  },

  /**
   * Set the category for a specific application
   * @param application Application name
   * @param category Category name
   * @param custom Whether this is a custom category
   */
  async setCategory(
    application: string,
    category: string,
    custom: boolean = false
  ): Promise<string> {
    return invoke<string>('set_application_category', { application, category, custom });
  },

  /**
   * Create a custom category for an application
   * @param application Application name
   * @param category Custom category name
   * @returns Success message
   */
  async createCustomCategory(application: string, category: string): Promise<string> {
    return invoke<string>('create_custom_category', { application, category });
  },

  /**
   * Delete an application category
   * @param application Application name
   * @returns Success message
   */
  async deleteCategory(application: string): Promise<string> {
    return invoke<string>('delete_application_category', { application });
  },

  /**
   * Get all application categories
   * @returns Array of all application categories
   */
  async listAll(): Promise<ApplicationCategory[]> {
    return invoke<ApplicationCategory[]>('get_all_categories');
  },

  /**
   * Get all custom (user-defined) categories
   * @returns Array of custom application categories
   */
  async listCustom(): Promise<ApplicationCategory[]> {
    return invoke<ApplicationCategory[]>('get_custom_categories');
  },

  /**
   * List all unique category names
   * @returns Array of distinct category names
   */
  async listCategoryNames(): Promise<string[]> {
    return invoke<string[]>('list_category_names');
  },

  /**
   * Initialize default categories
   * @returns Success message
   */
  async initDefaults(): Promise<string> {
    return invoke<string>('init_default_categories');
  },

  /**
   * Session-scoped category overrides
   * These overrides only apply during the current focus session
   */
  session: {
    /**
     * Set a temporary category override for the current session
     * @param application Application name
     * @param category Category to use for this session only
     * @returns Success message
     */
    async setOverride(application: string, category: string): Promise<string> {
      return invoke<string>('set_session_category_override', { application, category });
    },

    /**
     * Get a session-scoped category override
     * @param application Application name
     * @returns Override category or null if no override exists
     */
    async getOverride(application: string): Promise<string | null> {
      return invoke<string | null>('get_session_category_override', { application });
    },

    /**
     * Get all session-scoped category overrides
     * @returns Map of application names to override categories
     */
    async getAllOverrides(): Promise<Record<string, string>> {
      return invoke<Record<string, string>>('get_all_session_category_overrides');
    },

    /**
     * Clear a session-scoped category override
     * @param application Application name
     * @returns Success message
     */
    async clearOverride(application: string): Promise<string> {
      return invoke<string>('clear_session_category_override', { application });
    },

    /**
     * Clear all session-scoped category overrides
     * @returns Success message
     */
    async clearAllOverrides(): Promise<string> {
      return invoke<string>('clear_all_session_category_overrides');
    },
  },
};

/**
 * Focus Session Commands
 */
export const focusSessions = {
  /**
   * Create a new focus session
   * @param id Session ID (UUID)
   * @param startTime Unix timestamp (milliseconds)
   * @param productiveCategories Array of productive category names
   * @param goal Optional session goal
   * @returns Success message
   */
  async create(
    id: string,
    startTime: number,
    productiveCategories: string[],
    goal?: string
  ): Promise<string> {
    return invoke<string>('create_focus_session', {
      id,
      startTime,
      productiveCategories,
      goal: goal || null,
    });
  },

  /**
   * Get focus session by ID
   * @param id Session ID
   * @returns Focus session or null if not found
   */
  async getById(id: string): Promise<FocusSession | null> {
    return invoke<FocusSession | null>('get_focus_session', { id });
  },

  /**
   * Get the current active focus session
   * @returns Current focus session or null if none active
   */
  async getCurrent(): Promise<FocusSession | null> {
    return invoke<FocusSession | null>('get_active_session');
  },

  /**
   * Update session status
   * @param id Session ID
   * @param status New status ('Active', 'Paused', or 'Completed')
   * @returns Success message
   */
  async updateStatus(id: string, status: string): Promise<string> {
    return invoke<string>('update_session_status', { id, status });
  },

  /**
   * Complete a focus session
   * @param id Session ID
   * @param endTime Unix timestamp (milliseconds)
   * @returns Success message
   */
  async complete(id: string, endTime: number): Promise<string> {
    return invoke<string>('complete_focus_session', { id, endTime });
  },

  /**
   * Pause the current focus session
   */
  async pause(): Promise<void> {
    const current = await this.getCurrent();
    if (current) {
      await this.updateStatus(current.id, 'Paused');
    }
  },

  /**
   * Resume the current focus session
   */
  async resume(): Promise<void> {
    const current = await this.getCurrent();
    if (current) {
      await this.updateStatus(current.id, 'Active');
    }
  },

  /**
   * Mark a distraction as intentional break
   * @param distractionId Distraction event ID
   */
  async markIntentionalBreak(distractionId: number): Promise<void> {
    // TODO: Implement in Rust backend (task 7.2)
    return invoke('mark_intentional_break', { distractionId });
  },
};

/**
 * Analytics Commands
 */
export const analytics = {
  /**
   * Get productivity score for a time range
   * @param startTime Unix timestamp (milliseconds)
   * @param endTime Unix timestamp (milliseconds)
   * @returns Productivity score (0-100)
   */
  async getProductivityScore(startTime: number, endTime: number): Promise<number> {
    // TODO: Implement in Rust backend (task 11.2)
    return invoke<number>('get_productivity_score', { startTime, endTime });
  },

  /**
   * Get application usage breakdown
   * @param startTime Unix timestamp (milliseconds)
   * @param endTime Unix timestamp (milliseconds)
   * @returns Map of application names to duration in milliseconds
   */
  async getApplicationBreakdown(
    startTime: number,
    endTime: number
  ): Promise<Record<string, number>> {
    // TODO: Implement in Rust backend (task 11.1)
    return invoke<Record<string, number>>('get_application_breakdown', {
      startTime,
      endTime,
    });
  },

  /**
   * Export activity data
   * @param format Export format ('csv' or 'json')
   * @param startTime Unix timestamp (milliseconds)
   * @param endTime Unix timestamp (milliseconds)
   * @returns Path to exported file
   */
  async exportData(
    format: 'csv' | 'json',
    startTime: number,
    endTime: number
  ): Promise<string> {
    // TODO: Implement in Rust backend (task 11.4)
    return invoke<string>('export_data', { format, startTime, endTime });
  },
};

/**
 * Notification Commands
 */
export const notifications = {
  /**
   * Get notification settings
   * @returns Notification settings
   */
  async getSettings(): Promise<{ enabled: boolean; timeout_ms: number }> {
    return invoke<{ enabled: boolean; timeout_ms: number }>('get_notification_settings');
  },

  /**
   * Set notification settings
   * @param enabled Whether notifications are enabled
   * @param timeoutMs Auto-dismiss timeout in milliseconds
   * @returns Success message
   */
  async setSettings(enabled: boolean, timeoutMs: number): Promise<string> {
    return invoke<string>('set_notification_settings', { enabled, timeout_ms: timeoutMs });
  },

  /**
   * Get notification history
   * @returns Array of notification history entries
   */
  async getHistory(): Promise<Array<{ timestamp: number; message: string; type: string }>> {
    return invoke('get_notification_history');
  },

  /**
   * Clear notification history
   * @returns Success message
   */
  async clearHistory(): Promise<string> {
    return invoke<string>('clear_notification_history');
  },
};

/**
 * Export Commands
 */
export const exportData = {
  /**
   * Export activity logs to CSV
   * @param startTime Unix timestamp (seconds)
   * @param endTime Unix timestamp (seconds)
   * @param outputPath Optional custom output path
   * @returns Export result with file path and metadata
   */
  async exportActivityLogsCsv(
    startTime: number,
    endTime: number,
    outputPath?: string
  ): Promise<{ file_path: string; metadata: any; file_size: number }> {
    return invoke('export_activity_logs_csv', { startTime, endTime, outputPath: outputPath || null });
  },

  /**
   * Export all data to JSON
   * @param startTime Unix timestamp (seconds)
   * @param endTime Unix timestamp (seconds)
   * @param outputPath Optional custom output path
   * @returns Export result with file path and metadata
   */
  async exportAllDataJson(
    startTime: number,
    endTime: number,
    outputPath?: string
  ): Promise<{ file_path: string; metadata: any; file_size: number }> {
    return invoke('export_all_data_json', { startTime, endTime, outputPath: outputPath || null });
  },

  /**
   * Get the default export directory path
   * @returns Path to export directory
   */
  async getExportDirectory(): Promise<string> {
    return invoke<string>('get_export_directory');
  },
};

/**
 * Database Recovery Commands
 */
export const database = {
  /**
   * Check database integrity
   * @returns True if database is healthy, false otherwise
   */
  async checkIntegrity(): Promise<boolean> {
    return invoke<boolean>('check_database_integrity');
  },

  /**
   * Get database recovery information
   * @returns Recovery status and backup information
   */
  async getRecoveryInfo(): Promise<{
    is_healthy: boolean;
    backup_count: number;
    database_size_bytes: number;
    database_path: string;
  }> {
    return invoke('get_database_recovery_info');
  },

  /**
   * Create a manual database backup
   * @returns Backup information
   */
  async createBackup(): Promise<{
    path: string;
    timestamp: number;
    size_bytes: number;
  }> {
    return invoke('create_database_backup');
  },

  /**
   * Recover database from corruption
   * @returns Recovery status message
   */
  async recover(): Promise<string> {
    return invoke<string>('recover_database');
  },

  /**
   * Run VACUUM on database to optimize
   * @returns Success message
   */
  async vacuum(): Promise<string> {
    return invoke<string>('vacuum_database');
  },
};

/**
 * System Commands
 */
export const system = {
  /**
   * Get application version
   * @returns Version string
   */
  async getVersion(): Promise<string> {
    return invoke<string>('get_app_version');
  },

  /**
   * Check database status
   * @returns Database status message
   */
  async checkDatabaseStatus(): Promise<string> {
    return invoke<string>('check_database_status');
  },

  /**
   * Get a setting value
   * @param key Setting key
   * @returns Setting value or null if not found
   */
  async getSetting(key: string): Promise<string | null> {
    return invoke<string | null>('get_setting', { key });
  },

  /**
   * Set a setting value
   * @param key Setting key
   * @param value Setting value
   * @returns Success message
   */
  async setSetting(key: string, value: string): Promise<string> {
    return invoke<string>('set_setting', { key, value });
  },

  /**
   * Get all settings
   * @returns Array of [key, value] tuples
   */
  async getAllSettings(): Promise<[string, string][]> {
    return invoke<[string, string][]>('get_all_settings');
  },

  /**
   * Check for updates
   * @returns Update information or null if no update available
   */
  async checkForUpdates(): Promise<{ version: string; releaseNotes: string } | null> {
    // TODO: Implement in Rust backend (task 19.1)
    return invoke('check_for_updates');
  },

  /**
   * Run diagnostic checks
   * @returns Diagnostic results
   */
  async runDiagnostics(): Promise<{
    permissions: boolean;
    database: boolean;
    browserExtension: boolean;
  }> {
    // TODO: Implement in Rust backend (task 18.3)
    return invoke('run_diagnostics');
  },
};

/**
 * Main Tauri API object
 * Provides organized access to all Tauri commands
 */
export const tauriApi = {
  monitoring,
  activityLogs,
  categories,
  focusSessions,
  analytics,
  notifications,
  exportData,
  database,
  system,
  isTauriEnvironment,
};

export default tauriApi;
