// Notification system module
// 
// Provides cross-platform notifications for distraction alerts and other events.
// Requirements: 7.1, 7.2, 17.1, 17.2, 17.5

pub mod service;
mod windows_toast;

pub use service::{NotificationService, NotificationHistoryEntry};
