// Notification Service
//
// Manages system notifications for distraction alerts and other events.
// Requirements: 7.1, 7.2, 7.3, 7.5, 17.1, 17.2, 17.3, 17.5, 17.6

use std::sync::Arc;
use tokio::sync::RwLock;
use anyhow::Result;
use chrono::{DateTime, Utc};

use crate::database::Database;
use crate::database::settings;

#[cfg(not(target_os = "windows"))]
use notify_rust::Notification;

#[cfg(target_os = "windows")]
use super::windows_toast::windows_notifications;

// Windows-specific notification setup
#[cfg(target_os = "windows")]
fn send_notification_impl(title: &str, body: &str, _icon: &str, _timeout_ms: i32) -> Result<()> {
    windows_notifications::send_toast_notification(title, body)
}

#[cfg(not(target_os = "windows"))]
fn send_notification_impl(title: &str, body: &str, icon: &str, timeout_ms: i32) -> Result<()> {
    Notification::new()
        .appname("FocusForge")
        .summary(title)
        .body(body)
        .icon(icon)
        .timeout(timeout_ms)
        .show()?;
    Ok(())
}

/// Notification history entry
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct NotificationHistoryEntry {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub title: String,
    pub body: String,
    pub notification_type: String,
}

/// Notification service for managing system notifications
pub struct NotificationService {
    database: Arc<Database>,
    history: Arc<RwLock<Vec<NotificationHistoryEntry>>>,
    max_history_size: usize,
}

impl NotificationService {
    /// Create a new NotificationService
    pub fn new(database: Arc<Database>) -> Self {
        Self {
            database,
            history: Arc::new(RwLock::new(Vec::new())),
            max_history_size: 50,
        }
    }
    
    /// Send a distraction alert notification
    /// 
    /// # Arguments
    /// * `application_name` - Name of the distracting application
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if notification sent successfully
    /// 
    /// # Requirements
    /// Validates: Requirements 7.1, 7.3, 17.3
    pub async fn send_distraction_alert(&self, application_name: &str) -> Result<()> {
        // Check if notifications are enabled
        let enabled = settings::get_bool(self.database.pool(), "notifications_enabled", true).await?;
        if !enabled {
            log::debug!("Notifications disabled, skipping distraction alert");
            return Ok(());
        }
        
        // Get configurable timeout (default 5 seconds)
        let timeout_ms = settings::get_i64(self.database.pool(), "notification_timeout_ms", 5000).await?;
        
        let title = "Focus Alert";
        let body = format!("You switched to {} - Stay focused!", application_name);
        
        // Send notification
        match send_notification_impl(title, &body, "dialog-warning", timeout_ms as i32) {
            Ok(_) => {
                log::info!("Distraction alert sent for: {}", application_name);
            }
            Err(e) => {
                log::warn!("Failed to send notification: {}", e);
            }
        }
        
        // Add to history
        self.add_to_history(title.to_string(), body, "distraction").await;
        
        Ok(())
    }
    
    /// Send a follow-up reminder for extended distractions
    /// 
    /// # Arguments
    /// * `application_name` - Name of the distracting application
    /// * `duration_minutes` - How long the user has been distracted
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if notification sent successfully
    /// 
    /// # Requirements
    /// Validates: Requirement 7.5, 17.3
    pub async fn send_extended_distraction_reminder(
        &self,
        application_name: &str,
        duration_minutes: i64,
    ) -> Result<()> {
        let enabled = settings::get_bool(self.database.pool(), "notifications_enabled", true).await?;
        if !enabled {
            return Ok(());
        }
        
        // Get configurable timeout (default 10 seconds for extended distractions)
        let timeout_ms = settings::get_i64(self.database.pool(), "notification_timeout_ms", 5000).await?;
        let extended_timeout_ms = timeout_ms * 2; // Double timeout for extended distractions
        
        let title = "Extended Distraction";
        let body = format!(
            "You've been on {} for {} minutes. Time to refocus?",
            application_name,
            duration_minutes
        );
        
        // Send notification
        match send_notification_impl(title, &body, "dialog-warning", extended_timeout_ms as i32) {
            Ok(_) => {
                log::info!("Extended distraction reminder sent for: {}", application_name);
            }
            Err(e) => {
                log::warn!("Failed to send extended reminder: {}", e);
            }
        }
        
        self.add_to_history(title.to_string(), body, "extended_distraction").await;
        
        Ok(())
    }
    
    /// Send a session completion notification
    /// 
    /// # Arguments
    /// * `session_id` - ID of the completed session
    /// * `productivity_score` - Productivity score for the session
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if notification sent successfully
    /// 
    /// # Requirements
    /// Validates: Requirement 17.3
    pub async fn send_session_complete(
        &self,
        session_id: &str,
        productivity_score: i64,
    ) -> Result<()> {
        let enabled = settings::get_bool(self.database.pool(), "notifications_enabled", true).await?;
        if !enabled {
            return Ok(());
        }
        
        // Get configurable timeout (default 5 seconds)
        let timeout_ms = settings::get_i64(self.database.pool(), "notification_timeout_ms", 5000).await?;
        
        let title = "Focus Session Complete! 🎉";
        let body = format!("Great work! You completed 22:28 with {}%", productivity_score);
        
        send_notification_impl(title, &body, "dialog-information", timeout_ms as i32)?;
        
        self.add_to_history(title.to_string(), body, "session_complete").await;
        
        log::info!("Session complete notification sent for: {}", session_id);
        Ok(())
    }
    
    /// Get notification history
    /// 
    /// # Returns
    /// * `Vec<NotificationHistoryEntry>` - List of recent notifications
    /// 
    /// # Requirements
    /// Validates: Requirement 17.6
    pub async fn get_history(&self) -> Vec<NotificationHistoryEntry> {
        self.history.read().await.clone()
    }
    
    /// Clear notification history
    pub async fn clear_history(&self) {
        self.history.write().await.clear();
        log::info!("Notification history cleared");
    }
    
    /// Add a notification to history
    async fn add_to_history(&self, title: String, body: String, notification_type: &str) {
        let mut history = self.history.write().await;
        
        let entry = NotificationHistoryEntry {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            title,
            body,
            notification_type: notification_type.to_string(),
        };
        
        history.push(entry);
        
        // Keep only the most recent entries
        if history.len() > self.max_history_size {
            history.remove(0);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database;
    
    async fn create_test_database() -> Arc<Database> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_notifications_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;
        
        let db = Database::new(db_path).await.unwrap();
        Arc::new(db)
    }
    
    #[tokio::test]
    async fn test_notification_service_creation() {
        let db = create_test_database().await;
        let service = NotificationService::new(db);
        
        let history = service.get_history().await;
        assert_eq!(history.len(), 0);
    }
    
    #[tokio::test]
    async fn test_notification_history() {
        let db = create_test_database().await;
        let service = NotificationService::new(Arc::clone(&db));
        
        // Add some notifications to history
        service.add_to_history(
            "Test Title".to_string(),
            "Test Body".to_string(),
            "test"
        ).await;
        
        let history = service.get_history().await;
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].title, "Test Title");
        
        // Clear history
        service.clear_history().await;
        let history = service.get_history().await;
        assert_eq!(history.len(), 0);
    }
}
