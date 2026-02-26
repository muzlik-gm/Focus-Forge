/**
 * TypeScript type definitions for Tauri IPC commands
 * These types match the Rust command signatures in src-tauri/src/main.rs
 */

/**
 * Application information returned by monitoring system
 */
export interface ApplicationInfo {
  name: string;
  process_id: number;
  bundle_id: string | null;
  executable_path: string;
}

/**
 * Activity log entry representing application usage
 */
export interface ActivityLog {
  id?: number;
  timestamp: number;
  application: string;
  processId?: number;
  category?: string;
  duration: number;
  url?: string;
  pageTitle?: string;
  browser?: string;
}

/**
 * Application category classification
 */
export interface ApplicationCategory {
  application: string;
  category: 'Productive' | 'Neutral' | 'Distracting' | string;
  custom: boolean;
}

/**
 * Focus session configuration
 */
export interface FocusSessionConfig {
  productiveCategories: string[];
  goal?: string;
  durationMinutes?: number;
}

/**
 * Focus session data
 * Note: startTime and endTime are Unix timestamps in milliseconds
 */
export interface FocusSession {
  id: string;
  startTime: number;
  endTime?: number;
  productiveCategories: string[];
  goal?: string;
  status: 'Active' | 'Paused' | 'Completed';
}

/**
 * Session summary with analytics
 */
export interface SessionSummary {
  sessionId: string;
  totalDuration: number;
  focusTime: number;
  distractionCount: number;
  applicationBreakdown: Record<string, number>;
  productivityScore: number;
}

/**
 * Distraction event during a focus session
 */
export interface DistractionEvent {
  id?: number;
  sessionId: string;
  timestamp: number;
  application: string;
  markedIntentional: boolean;
}

/**
 * Monitoring status
 */
export interface MonitoringStatus {
  active: boolean;
  currentApplication?: ApplicationInfo;
  activeSince?: number;
}
