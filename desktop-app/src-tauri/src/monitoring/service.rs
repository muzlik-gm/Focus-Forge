// MonitoringService - Core service that manages the monitoring lifecycle
// 
// This service ties together the platform monitor and database to provide
// continuous application focus tracking. It runs in a background task and
// records activity logs whenever the focused application changes.
//
// Requirements: 3.2, 3.3, 3.4

use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::task::JoinHandle;
use anyhow::{Context, Result};

use crate::database::Database;
use crate::database::activity_logs::{ActivityLog, self};
use crate::focus::FocusSessionManager;
use crate::notifications::NotificationService;
use super::{PlatformMonitor, FocusEvent, create_platform_monitor};

/// MonitoringService manages the application monitoring lifecycle
/// 
/// This service:
/// - Subscribes to focus events from the platform monitor
/// - Records activity logs to the database when focus changes
/// - Tracks the duration of each application focus period
/// - Detects distractions during active focus sessions
/// - Sends follow-up reminders for extended distractions (5+ minutes)
/// - Runs in a background task that can be started and stopped
pub struct MonitoringService {
    /// Platform-specific monitor for tracking application focus
    platform_monitor: Arc<Box<dyn PlatformMonitor>>,
    
    /// Database for persisting activity logs
    database: Arc<Database>,
    
    /// Focus session manager for distraction detection
    focus_session_manager: Option<Arc<FocusSessionManager>>,
    
    /// Notification service for sending alerts
    notification_service: Option<Arc<NotificationService>>,
    
    /// Handle to the background monitoring task
    task_handle: Arc<RwLock<Option<JoinHandle<()>>>>,
    
    /// Channel for sending stop signal to the monitoring task
    stop_tx: Arc<RwLock<Option<mpsc::Sender<()>>>>,
    
    /// Current monitoring state
    is_running: Arc<RwLock<bool>>,
    
    /// Track current distraction state (application name, start timestamp, reminder sent)
    current_distraction: Arc<RwLock<Option<(String, i64, bool)>>>,
}

impl MonitoringService {
    /// Create a new MonitoringService instance
    /// 
    /// # Arguments
    /// * `database` - Database instance for persisting activity logs
    /// 
    /// # Returns
    /// * `Self` - New MonitoringService instance
    pub fn new(database: Arc<Database>) -> Self {
        let platform_monitor = Arc::new(create_platform_monitor());
        
        Self {
            platform_monitor,
            database,
            focus_session_manager: None,
            notification_service: None,
            task_handle: Arc::new(RwLock::new(None)),
            stop_tx: Arc::new(RwLock::new(None)),
            is_running: Arc::new(RwLock::new(false)),
            current_distraction: Arc::new(RwLock::new(None)),
        }
    }
    
    /// Set the focus session manager for distraction detection
    /// 
    /// This should be called after creating the MonitoringService to enable
    /// automatic distraction detection during focus sessions.
    /// 
    /// # Arguments
    /// * `manager` - Focus session manager instance
    pub fn set_focus_session_manager(&mut self, manager: Arc<FocusSessionManager>) {
        self.focus_session_manager = Some(manager);
    }
    
    /// Set the notification service for sending alerts
    /// 
    /// This should be called after creating the MonitoringService to enable
    /// distraction notifications.
    /// 
    /// # Arguments
    /// * `service` - Notification service instance
    pub fn set_notification_service(&mut self, service: Arc<NotificationService>) {
        self.notification_service = Some(service);
    }
    
    /// Start the monitoring service
    /// 
    /// This spawns a background task that:
    /// 1. Subscribes to focus events from the platform monitor
    /// 2. Records activity logs when focus changes
    /// 3. Updates duration when focus is lost
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if started successfully, Err if already running or failed to start
    /// 
    /// # Requirements
    /// Validates: Requirements 3.2, 3.3, 3.4
    pub async fn start(&self) -> Result<()> {
        let mut is_running = self.is_running.write().await;
        
        if *is_running {
            log::warn!("MonitoringService is already running");
            return Ok(());
        }
        
        log::info!("Starting MonitoringService...");
        
        // Subscribe to focus events
        let mut focus_events = self.platform_monitor.subscribe_to_focus_events()
            .context("Failed to subscribe to focus events")?;
        
        // Create stop channel
        let (stop_tx, mut stop_rx) = mpsc::channel::<()>(1);
        *self.stop_tx.write().await = Some(stop_tx);
        
        // Clone Arc references for the background task
        let database = Arc::clone(&self.database);
        let focus_manager = self.focus_session_manager.clone();
        let notification_service = self.notification_service.clone();
        let current_distraction = Arc::clone(&self.current_distraction);
        
        // Spawn background monitoring task
        let handle = tokio::spawn(async move {
            log::info!("Monitoring task started");
            
            // Track the last activity log ID so we can update its duration
            let mut last_log_id: Option<i64> = None;
            let mut last_timestamp: Option<i64> = None;
            
            // Create a timer for checking extended distractions (check every 30 seconds)
            let mut distraction_check_interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
            
            loop {
                tokio::select! {
                    // Handle focus events
                    Some(event) = focus_events.recv() => {
                        if let Err(e) = Self::handle_focus_event(
                            &database,
                            &focus_manager,
                            &notification_service,
                            &current_distraction,
                            event,
                            &mut last_log_id,
                            &mut last_timestamp,
                        ).await {
                            log::error!("Error handling focus event: {}", e);
                        }
                    }
                    
                    // Check for extended distractions periodically
                    _ = distraction_check_interval.tick() => {
                        if let Err(e) = Self::check_extended_distraction(
                            &notification_service,
                            &current_distraction,
                        ).await {
                            log::error!("Error checking extended distraction: {}", e);
                        }
                    }
                    
                    // Handle stop signal
                    _ = stop_rx.recv() => {
                        log::info!("Received stop signal, shutting down monitoring task");
                        
                        // Update duration for the last activity log before stopping
                        if let (Some(log_id), Some(timestamp)) = (last_log_id, last_timestamp) {
                            let now = chrono::Utc::now().timestamp_millis();
                            let duration = ((now - timestamp) / 1000).max(0);
                            
                            if let Err(e) = activity_logs::update_duration(database.pool(), log_id, duration).await {
                                log::error!("Failed to update final duration: {}", e);
                            }
                        }
                        
                        break;
                    }
                }
            }
            
            log::info!("Monitoring task stopped");
        });
        
        *self.task_handle.write().await = Some(handle);
        *is_running = true;
        
        log::info!("MonitoringService started successfully");
        Ok(())
    }
    
    /// Stop the monitoring service
    /// 
    /// This sends a stop signal to the background task and waits for it to complete.
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if stopped successfully, Err if not running or failed to stop
    pub async fn stop(&self) -> Result<()> {
        let mut is_running = self.is_running.write().await;
        
        if !*is_running {
            log::warn!("MonitoringService is not running");
            return Ok(());
        }
        
        log::info!("Stopping MonitoringService...");
        
        // Send stop signal
        if let Some(stop_tx) = self.stop_tx.write().await.take() {
            let _ = stop_tx.send(()).await;
        }
        
        // Wait for task to complete
        if let Some(handle) = self.task_handle.write().await.take() {
            let _ = handle.await;
        }
        
        *is_running = false;
        
        log::info!("MonitoringService stopped successfully");
        Ok(())
    }
    
    /// Check if the monitoring service is currently running
    /// 
    /// # Returns
    /// * `bool` - true if running, false otherwise
    pub async fn is_running(&self) -> bool {
        *self.is_running.read().await
    }

    /// Get the currently active application
    /// 
    /// # Returns
    /// * `Result<ApplicationInfo>` - Information about the active application
    pub fn get_active_application(&self) -> Result<crate::monitoring::ApplicationInfo> {
        self.platform_monitor.get_active_application()
            .context("Failed to get active application")
    }

    /// List all running applications with visible windows
    /// 
    /// # Returns
    /// * `Result<Vec<ApplicationInfo>>` - List of all running applications
    pub fn list_applications(&self) -> Result<Vec<crate::monitoring::ApplicationInfo>> {
        self.platform_monitor.list_applications()
            .context("Failed to list applications")
    }
    
    /// Handle a focus event by recording it to the database and checking for distractions
    /// 
    /// This function:
    /// 1. Updates the duration of the previous activity log (if any)
    /// 2. Creates a new activity log for the newly focused application
    /// 3. Checks if the application is a distraction during an active focus session
    /// 4. Records distraction events and sends notifications if detected
    /// 5. Tracks distraction state for extended distraction reminders
    /// 
    /// # Arguments
    /// * `database` - Database instance
    /// * `focus_manager` - Optional focus session manager for distraction detection
    /// * `notification_service` - Optional notification service for sending alerts
    /// * `current_distraction` - Shared state tracking current distraction (app name, start time, reminder sent)
    /// * `event` - Focus event to handle
    /// * `last_log_id` - ID of the last activity log (updated by this function)
    /// * `last_timestamp` - Timestamp of the last focus event (updated by this function)
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if handled successfully, Err otherwise
    async fn handle_focus_event(
        database: &Database,
        focus_manager: &Option<Arc<FocusSessionManager>>,
        notification_service: &Option<Arc<NotificationService>>,
        current_distraction: &Arc<RwLock<Option<(String, i64, bool)>>>,
        event: FocusEvent,
        last_log_id: &mut Option<i64>,
        last_timestamp: &mut Option<i64>,
    ) -> Result<()> {
        log::info!(
            "Focus changed to: {} (PID: {})",
            event.application.name,
            event.application.process_id
        );
        
        // Update duration for the previous activity log
        if let (Some(log_id), Some(prev_timestamp)) = (*last_log_id, *last_timestamp) {
            let duration = ((event.timestamp - prev_timestamp) / 1000).max(0);
            
            activity_logs::update_duration(database.pool(), log_id, duration)
                .await
                .context("Failed to update previous activity duration")?;
            
            log::info!("Updated previous activity duration: {} seconds", duration);
        }
        
        // Create new activity log for the focused application
        let mut log = ActivityLog::new(
            event.application.name.clone(),
            event.timestamp,
        );
        
        log.process_id = Some(event.application.process_id as i32);
        log.executable_path = Some(event.application.executable_path.clone());
        
        // Try to get the category for this application
        if let Ok(Some(category)) = crate::database::categories::get_by_application(
            database.pool(),
            &event.application.name,
        ).await {
            log.category = Some(category.category);
        }
        
        let log_id = activity_logs::insert(database.pool(), &log)
            .await
            .context("Failed to insert activity log")?;
        
        log::debug!("Created new activity log with ID: {}", log_id);
        
        // Check for distractions if focus session manager is available
        if let Some(manager) = focus_manager {
            match manager.check_distraction(&event.application.name).await {
                Ok(true) => {
                    // This is a distraction - record it
                    match manager.record_distraction(&event.application.name).await {
                        Ok(distraction_id) => {
                            log::warn!(
                                "Distraction detected: {} (event ID: {})",
                                event.application.name,
                                distraction_id
                            );
                            
                            // Track this distraction for extended reminder
                            // Format: (app_name, start_timestamp, reminder_sent)
                            *current_distraction.write().await = Some((
                                event.application.name.clone(),
                                event.timestamp,
                                false, // reminder not sent yet
                            ));
                            
                            // Send notification if notification service is available
                            if let Some(notif_service) = notification_service {
                                if let Err(e) = notif_service.send_distraction_alert(&event.application.name).await {
                                    log::error!("Failed to send distraction notification: {}", e);
                                }
                            }
                        }
                        Err(e) => {
                            log::error!("Failed to record distraction: {}", e);
                        }
                    }
                }
                Ok(false) => {
                    // Not a distraction, clear distraction state
                    *current_distraction.write().await = None;
                    log::debug!("Application {} is productive", event.application.name);
                }
                Err(e) => {
                    log::error!("Failed to check distraction: {}", e);
                }
            }
        } else {
            // No focus session active, clear distraction state
            *current_distraction.write().await = None;
        }
        
        // Update tracking variables
        *last_log_id = Some(log_id);
        *last_timestamp = Some(event.timestamp);
        
        Ok(())
    }
    
    /// Check if the current distraction has lasted 5+ minutes and send a reminder
    /// 
    /// This function is called periodically (every 30 seconds) to check if the user
    /// is still distracted and has been for more than 5 minutes. If so, it sends
    /// an extended distraction reminder notification.
    /// 
    /// # Arguments
    /// * `notification_service` - Optional notification service for sending alerts
    /// * `current_distraction` - Shared state tracking current distraction (app name, start time, reminder sent)
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if check completed successfully, Err otherwise
    /// 
    /// # Requirements
    /// Validates: Requirement 7.5 (Extended distraction follow-up)
    async fn check_extended_distraction(
        notification_service: &Option<Arc<NotificationService>>,
        current_distraction: &Arc<RwLock<Option<(String, i64, bool)>>>,
    ) -> Result<()> {
        let mut distraction_state = current_distraction.write().await;
        
        if let Some((app_name, start_time, reminder_sent)) = distraction_state.as_ref() {
            // Check if reminder has already been sent
            if *reminder_sent {
                return Ok(());
            }
            
            // Calculate how long the distraction has been ongoing
            let now = chrono::Utc::now().timestamp_millis();
            let duration_ms = now - start_time;
            let duration_minutes = duration_ms / 1000 / 60;
            
            // If distraction has lasted 5+ minutes, send reminder
            if duration_minutes >= 5 {
                log::info!(
                    "Extended distraction detected: {} for {} minutes",
                    app_name,
                    duration_minutes
                );
                
                // Send extended distraction reminder
                if let Some(notif_service) = notification_service {
                    if let Err(e) = notif_service
                        .send_extended_distraction_reminder(app_name, duration_minutes)
                        .await
                    {
                        log::error!("Failed to send extended distraction reminder: {}", e);
                    } else {
                        // Mark reminder as sent so we don't send it again
                        *distraction_state = Some((app_name.clone(), *start_time, true));
                        log::info!("Extended distraction reminder sent and marked");
                    }
                }
            }
        }
        
        Ok(())
    }
}

// Implement Drop to ensure the monitoring task is stopped when the service is dropped
impl Drop for MonitoringService {
    fn drop(&mut self) {
        // Note: We can't use async in Drop, so we just log a warning
        // The task will be cleaned up when the runtime shuts down
        log::debug!("MonitoringService dropped");
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;
    
    async fn create_test_database() -> Arc<Database> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_monitoring_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;
        
        let db = Database::new(db_path).await.unwrap();
        Arc::new(db)
    }
    
    #[tokio::test]
    async fn test_monitoring_service_creation() {
        let db = create_test_database().await;
        let service = MonitoringService::new(db);
        
        assert!(!service.is_running().await);
    }
    
    #[tokio::test]
    async fn test_monitoring_service_start_stop() {
        let db = create_test_database().await;
        let service = MonitoringService::new(Arc::clone(&db));
        
        // Start monitoring
        let result = service.start().await;
        assert!(result.is_ok(), "Failed to start monitoring: {:?}", result);
        assert!(service.is_running().await);
        
        // Wait a bit to let it run
        tokio::time::sleep(Duration::from_millis(100)).await;
        
        // Stop monitoring
        let result = service.stop().await;
        assert!(result.is_ok(), "Failed to stop monitoring: {:?}", result);
        assert!(!service.is_running().await);
    }
    
    #[tokio::test]
    async fn test_monitoring_service_double_start() {
        let db = create_test_database().await;
        let service = MonitoringService::new(Arc::clone(&db));
        
        // Start monitoring
        service.start().await.unwrap();
        assert!(service.is_running().await);
        
        // Try to start again (should succeed but not create duplicate task)
        let result = service.start().await;
        assert!(result.is_ok());
        assert!(service.is_running().await);
        
        // Stop monitoring
        service.stop().await.unwrap();
    }
    
    #[tokio::test]
    async fn test_monitoring_service_stop_when_not_running() {
        let db = create_test_database().await;
        let service = MonitoringService::new(Arc::clone(&db));
        
        // Try to stop when not running (should succeed)
        let result = service.stop().await;
        assert!(result.is_ok());
        assert!(!service.is_running().await);
    }
    
    #[tokio::test]
    #[cfg(target_os = "windows")]
    async fn test_monitoring_service_records_activity() {
        let db = create_test_database().await;
        let service = MonitoringService::new(Arc::clone(&db));
        
        // Start monitoring
        service.start().await.unwrap();
        
        // Wait for some focus events to be recorded
        tokio::time::sleep(Duration::from_secs(3)).await;
        
        // Stop monitoring
        service.stop().await.unwrap();
        
        // Check if any activity logs were recorded
        let now = chrono::Utc::now().timestamp_millis();
        let five_seconds_ago = now - 5000;
        
        let logs = activity_logs::get_by_time_range(db.pool(), five_seconds_ago, now)
            .await
            .unwrap();
        
        // We should have at least one log entry
        assert!(logs.len() > 0, "No activity logs were recorded");
        
        // Verify the log has valid data
        let log = &logs[0];
        assert!(!log.application.is_empty());
        assert!(log.process_id.is_some());
        assert!(log.timestamp >= five_seconds_ago);
    }
    
    #[tokio::test]
    #[cfg(target_os = "windows")]
    async fn test_duration_tracking() {
        let db = create_test_database().await;
        let service = MonitoringService::new(Arc::clone(&db));
        
        // Start monitoring
        service.start().await.unwrap();
        
        // Wait for focus events to be recorded
        // During this time, if focus changes, durations should be calculated
        tokio::time::sleep(Duration::from_secs(5)).await;
        
        // Stop monitoring (this should update the final duration)
        service.stop().await.unwrap();
        
        // Check activity logs
        let now = chrono::Utc::now().timestamp_millis();
        let ten_seconds_ago = now - 10000;
        
        let logs = activity_logs::get_by_time_range(db.pool(), ten_seconds_ago, now)
            .await
            .unwrap();
        
        if logs.len() > 1 {
            // If we have multiple logs, check that earlier logs have durations set
            for log in &logs[..logs.len()-1] {
                println!("Log: {} - Duration: {} seconds", log.application, log.duration);
                // Earlier logs should have non-zero duration (unless focus changed very quickly)
                // We allow 0 duration for very quick switches
                assert!(log.duration >= 0, "Duration should be non-negative");
            }
            
            // The last log should have a duration set by the stop() call
            let last_log = &logs[logs.len()-1];
            println!("Last log: {} - Duration: {} seconds", last_log.application, last_log.duration);
            assert!(last_log.duration >= 0, "Last log duration should be non-negative");
        } else if logs.len() == 1 {
            // If only one log, it should have duration set by stop()
            let log = &logs[0];
            println!("Single log: {} - Duration: {} seconds", log.application, log.duration);
            assert!(log.duration >= 0, "Duration should be non-negative");
            // Should have some duration since we waited 5 seconds
            assert!(log.duration >= 4, "Duration should be at least 4 seconds (we waited 5)");
        }
    }
    
    #[tokio::test]
    #[cfg(target_os = "windows")]
    async fn test_multi_window_handling() {
        let db = create_test_database().await;
        let service = MonitoringService::new(Arc::clone(&db));
        
        // Start monitoring
        service.start().await.unwrap();
        
        println!("Test: Open multiple windows of the same application (e.g., multiple browser windows)");
        println!("Then switch between them. They should be tracked as the same application.");
        
        // Wait for focus events
        tokio::time::sleep(Duration::from_secs(5)).await;
        
        // Stop monitoring
        service.stop().await.unwrap();
        
        // Check activity logs
        let now = chrono::Utc::now().timestamp_millis();
        let ten_seconds_ago = now - 10000;
        
        let logs = activity_logs::get_by_time_range(db.pool(), ten_seconds_ago, now)
            .await
            .unwrap();
        
        // Print all logs for manual verification
        println!("\nRecorded activity logs:");
        for log in &logs {
            println!("  {} (PID: {:?}) - Duration: {}s", 
                log.application, 
                log.process_id, 
                log.duration
            );
        }
        
        // If the same application appears multiple times, they should have different PIDs
        // or be the same PID (meaning focus returned to the same app)
        // This test is mainly for manual verification
        assert!(logs.len() > 0, "Should have recorded some activity");
    }
    
    #[tokio::test]
    async fn test_extended_distraction_tracking() {
        use crate::focus::FocusSessionManager;
        use crate::notifications::NotificationService;
        use crate::database::categories;
        
        let db = create_test_database().await;
        
        // Initialize default categories
        categories::insert_defaults(db.pool()).await.unwrap();
        
        // Create focus session manager
        let focus_manager = Arc::new(FocusSessionManager::new(Arc::clone(&db)));
        
        // Create notification service
        let notification_service = Arc::new(NotificationService::new(Arc::clone(&db)));
        
        // Create monitoring service
        let mut service = MonitoringService::new(Arc::clone(&db));
        service.set_focus_session_manager(Arc::clone(&focus_manager));
        service.set_notification_service(Arc::clone(&notification_service));
        
        // Start a focus session with only "Productive" category
        focus_manager.start_session(
            vec!["Productive".to_string()],
            Some("Test extended distraction".to_string())
        ).await.unwrap();
        
        // Simulate a distraction by manually setting the distraction state
        // In a real scenario, this would be set by handle_focus_event
        let now = chrono::Utc::now().timestamp_millis();
        let five_minutes_ago = now - (5 * 60 * 1000) - 1000; // 5 minutes + 1 second ago
        
        *service.current_distraction.write().await = Some((
            "Spotify".to_string(),
            five_minutes_ago,
            false, // reminder not sent yet
        ));
        
        // Call check_extended_distraction
        MonitoringService::check_extended_distraction(
            &service.notification_service,
            &service.current_distraction,
        ).await.unwrap();
        
        // Verify that reminder was marked as sent
        let distraction_state = service.current_distraction.read().await;
        assert!(distraction_state.is_some());
        
        if let Some((app_name, start_time, reminder_sent)) = distraction_state.as_ref() {
            assert_eq!(app_name, "Spotify");
            assert_eq!(*start_time, five_minutes_ago);
            assert!(reminder_sent, "Reminder should be marked as sent");
        }
        
        // Check notification history
        let history = notification_service.get_history().await;
        assert!(history.len() > 0, "Should have notification in history");
        
        let last_notification = &history[history.len() - 1];
        assert_eq!(last_notification.notification_type, "extended_distraction");
        assert!(last_notification.body.contains("Spotify"));
        assert!(last_notification.body.contains("5 minutes") || last_notification.body.contains("6 minutes"));
        
        println!("✓ Extended distraction tracking test passed!");
        println!("  Notification sent: {}", last_notification.body);
    }
}
