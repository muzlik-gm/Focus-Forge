// System monitoring module
// Tracks application usage, window focus, and user activity

pub mod app_monitor;
pub mod web_monitor;
pub mod idle_detector;
pub mod focus_analyzer;
pub mod platform;
pub mod service;
pub mod categorizer;

// Re-export platform abstraction types for convenience
pub use platform::{ApplicationInfo, FocusEvent, PlatformMonitor, create_platform_monitor};
pub use service::MonitoringService;

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationActivity {
    pub process_name: String,
    pub window_title: String,
    pub executable_path: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration: i64, // seconds
    pub category: ActivityCategory,
    pub is_fullscreen: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebsiteActivity {
    pub url: String,
    pub domain: String,
    pub title: String,
    pub browser: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration: i64, // seconds
    pub category: ActivityCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ActivityCategory {
    Productive,
    Neutral,
    Distracting,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FocusLossEvent {
    pub id: String,
    pub session_id: String,
    pub timestamp: DateTime<Utc>,
    pub event_type: FocusLossType,
    pub from_app: Option<String>,
    pub to_app: Option<String>,
    pub from_url: Option<String>,
    pub to_url: Option<String>,
    pub severity: Severity,
    pub auto_detected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FocusLossType {
    AppSwitch,
    WebsiteChange,
    Idle,
    Notification,
    Manual,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Severity {
    Low,
    Medium,
    High,
}

/// Monitor trait for platform-specific implementations
pub trait ActivityMonitor: Send + Sync {
    /// Start monitoring system activity
    fn start(&mut self) -> anyhow::Result<()>;
    
    /// Stop monitoring
    fn stop(&mut self) -> anyhow::Result<()>;
    
    /// Get current active window/application
    fn get_active_window(&self) -> anyhow::Result<ApplicationActivity>;
    
    /// Get list of running applications
    fn get_running_apps(&self) -> anyhow::Result<Vec<String>>;
    
    /// Check if user is idle
    fn is_idle(&self, threshold_seconds: u64) -> anyhow::Result<bool>;
}
