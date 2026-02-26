-- Initial database schema for FocusForge Desktop Application
-- This migration creates all core tables for activity tracking, categorization, and focus sessions

-- Activity logs table: stores all application and website usage events
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    application TEXT NOT NULL,
    process_id INTEGER,
    category TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    url TEXT,
    page_title TEXT,
    browser TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_logs(timestamp);

-- Index for application-based queries
CREATE INDEX IF NOT EXISTS idx_activity_application ON activity_logs(application);

-- Application categories table: stores user-defined categorizations
CREATE TABLE IF NOT EXISTS application_categories (
    application TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Focus sessions table: stores focus session configurations and results
CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    start_time INTEGER NOT NULL,
    end_time INTEGER,
    productive_categories TEXT NOT NULL,
    goal TEXT,
    status TEXT NOT NULL CHECK(status IN ('Active', 'Paused', 'Completed')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for efficient time-range queries on sessions
CREATE INDEX IF NOT EXISTS idx_session_time ON focus_sessions(start_time, end_time);

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS idx_session_status ON focus_sessions(status);

-- Distraction events table: stores distractions during focus sessions
CREATE TABLE IF NOT EXISTS distraction_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    application TEXT NOT NULL,
    marked_intentional BOOLEAN NOT NULL DEFAULT FALSE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES focus_sessions(id) ON DELETE CASCADE
);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_distraction_session ON distraction_events(session_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_distraction_timestamp ON distraction_events(timestamp);

-- Sync metadata table: tracks last sync timestamp for cloud synchronization
CREATE TABLE IF NOT EXISTS sync_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Insert initial sync timestamp
INSERT OR IGNORE INTO sync_metadata (key, value) VALUES ('last_sync_timestamp', '0');

-- Settings table: stores application settings and preferences
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('notifications_enabled', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('notification_sound', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('notification_duration_ms', '5000');
INSERT OR IGNORE INTO settings (key, value) VALUES ('data_retention_days', '90');
INSERT OR IGNORE INTO settings (key, value) VALUES ('sync_enabled', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('sync_interval_minutes', '15');
