// Focus Session Manager
//
// Manages focus sessions with real-time distraction detection.
// Requirements: 6.1, 6.2, 6.3, 6.5, 6.6

use std::sync::Arc;
use std::collections::HashMap;
use tokio::sync::RwLock;
use anyhow::{Context, Result};
use chrono::Utc;

use crate::database::Database;
use crate::database::sessions::{self, FocusSession, SessionStatus};
use crate::database::distractions::{self, DistractionEvent};
use crate::database::categories;

/// Focus session manager that handles session lifecycle and distraction detection
pub struct FocusSessionManager {
    database: Arc<Database>,
    current_session: Arc<RwLock<Option<FocusSession>>>,
    /// Session-scoped category overrides (application -> category)
    /// These overrides only apply during the current session and are cleared when the session ends
    session_category_overrides: Arc<RwLock<HashMap<String, String>>>,
}

impl FocusSessionManager {
    /// Create a new FocusSessionManager
    pub fn new(database: Arc<Database>) -> Self {
        Self {
            database,
            current_session: Arc::new(RwLock::new(None)),
            session_category_overrides: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    /// Start a new focus session
    /// 
    /// # Arguments
    /// * `productive_categories` - List of categories considered productive for this session
    /// * `goal` - Optional goal description for the session
    /// 
    /// # Returns
    /// * `Result<String>` - Session ID if successful
    /// 
    /// # Requirements
    /// Validates: Requirement 6.1 (Focus Session Management)
    pub async fn start_session(
        &self,
        productive_categories: Vec<String>,
        goal: Option<String>,
    ) -> Result<String> {
        let mut current = self.current_session.write().await;
        
        if current.is_some() {
            anyhow::bail!("A focus session is already active");
        }
        
        let session_id = uuid::Uuid::new_v4().to_string();
        let start_time = Utc::now().timestamp_millis();
        
        let mut session = FocusSession::new(session_id.clone(), start_time, productive_categories);
        session.goal = goal;
        
        // Persist to database
        sessions::insert(self.database.pool(), &session).await
            .context("Failed to insert focus session")?;
        
        *current = Some(session);
        
        log::info!("Focus session started: {}", session_id);
        Ok(session_id)
    }
    
    /// Stop the current focus session
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if stopped successfully
    /// 
    /// # Requirements
    /// Validates: Requirement 6.1 (Focus Session Management)
    pub async fn stop_session(&self) -> Result<()> {
        let mut current = self.current_session.write().await;
        
        let session = current.take()
            .ok_or_else(|| anyhow::anyhow!("No active focus session"))?;
        
        let end_time = Utc::now().timestamp_millis();
        
        // Update session in database
        sessions::update_end_time(self.database.pool(), &session.id, end_time).await
            .context("Failed to update session end time")?;
        
        sessions::update_status(self.database.pool(), &session.id, SessionStatus::Completed).await
            .context("Failed to update session status")?;
        
        // Clear session-scoped category overrides
        self.session_category_overrides.write().await.clear();
        
        log::info!("Focus session stopped: {}", session.id);
        Ok(())
    }
    
    /// Pause the current focus session
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if paused successfully
    /// 
    /// # Requirements
    /// Validates: Requirement 6.6 (Session pause/resume)
    pub async fn pause_session(&self) -> Result<()> {
        let mut current = self.current_session.write().await;
        
        let session = current.as_mut()
            .ok_or_else(|| anyhow::anyhow!("No active focus session"))?;
        
        sessions::update_status(self.database.pool(), &session.id, SessionStatus::Paused).await
            .context("Failed to pause session")?;
        
        // Update in-memory session status
        session.status = SessionStatus::Paused.as_str().to_string();
        
        log::info!("Focus session paused: {}", session.id);
        Ok(())
    }
    
    /// Resume a paused focus session
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if resumed successfully
    /// 
    /// # Requirements
    /// Validates: Requirement 6.6 (Session pause/resume)
    pub async fn resume_session(&self) -> Result<()> {
        let mut current = self.current_session.write().await;
        
        let session = current.as_mut()
            .ok_or_else(|| anyhow::anyhow!("No active focus session"))?;
        
        sessions::update_status(self.database.pool(), &session.id, SessionStatus::Active).await
            .context("Failed to resume session")?;
        
        // Update in-memory session status
        session.status = SessionStatus::Active.as_str().to_string();
        
        log::info!("Focus session resumed: {}", session.id);
        Ok(())
    }
    
    /// Get the current active session
    /// 
    /// # Returns
    /// * `Option<FocusSession>` - Current session if one is active
    pub async fn get_current_session(&self) -> Option<FocusSession> {
        self.current_session.read().await.clone()
    }
    
    /// Check if an application is distracting during the current session
    /// 
    /// This checks if the given application is in the productive categories
    /// for the current session. If not, it's considered a distraction.
    /// Session-scoped category overrides are applied before checking.
    /// 
    /// # Arguments
    /// * `application_name` - Name of the application to check
    /// 
    /// # Returns
    /// * `Result<bool>` - true if distracting, false if productive or no session active
    /// 
    /// # Requirements
    /// Validates: Requirement 6.2 (Distraction detection), 5.5 (Session-scoped overrides)
    pub async fn check_distraction(&self, application_name: &str) -> Result<bool> {
        let current = self.current_session.read().await;
        
        let session = match current.as_ref() {
            Some(s) => s,
            None => return Ok(false), // No session active, not a distraction
        };
        
        // Check if session is paused
        if session.status == SessionStatus::Paused.as_str() {
            return Ok(false); // Paused sessions don't track distractions
        }
        
        // Check for session-scoped category override first
        let category = {
            let overrides = self.session_category_overrides.read().await;
            if let Some(override_category) = overrides.get(application_name) {
                override_category.clone()
            } else {
                // Get the application's category from database
                categories::get_category_with_fallback(
                    self.database.pool(),
                    application_name
                ).await?
            }
        };
        
        // Check if the category is in the productive list
        let productive_categories = session.get_productive_categories();
        let is_productive = productive_categories.contains(&category);
        
        Ok(!is_productive)
    }
    
    /// Record a distraction event
    /// 
    /// # Arguments
    /// * `application_name` - Name of the distracting application
    /// 
    /// # Returns
    /// * `Result<i64>` - Distraction event ID
    /// 
    /// # Requirements
    /// Validates: Requirement 6.3 (Distraction tracking)
    pub async fn record_distraction(&self, application_name: &str) -> Result<i64> {
        let current = self.current_session.read().await;
        
        let session = current.as_ref()
            .ok_or_else(|| anyhow::anyhow!("No active focus session"))?;
        
        let timestamp = Utc::now().timestamp_millis();
        let event = DistractionEvent::new(
            session.id.clone(),
            timestamp,
            application_name.to_string()
        );
        
        let event_id = distractions::insert(self.database.pool(), &event).await
            .context("Failed to insert distraction event")?;
        
        log::info!("Distraction recorded: {} in session {}", application_name, session.id);
        Ok(event_id)
    }
    
    /// Generate a summary for a completed session
    /// 
    /// # Arguments
    /// * `session_id` - ID of the session to summarize
    /// 
    /// # Returns
    /// * `Result<SessionSummary>` - Summary with focus time, distractions, etc.
    /// 
    /// # Requirements
    /// Validates: Requirement 6.5 (Session summary generation)
    pub async fn generate_summary(&self, session_id: &str) -> Result<SessionSummary> {
        use crate::database::activity_logs;
        
        // Get the session
        let session = sessions::get_by_id(self.database.pool(), session_id).await?
            .ok_or_else(|| anyhow::anyhow!("Session not found"))?;
        
        // Calculate total duration in seconds
        let total_duration = if let Some(end_time) = session.end_time {
            ((end_time - session.start_time) / 1000) as i64 // Convert milliseconds to seconds
        } else {
            // If session is still active, calculate duration up to now
            let now = Utc::now().timestamp_millis();
            ((now - session.start_time) / 1000) as i64
        };
        
        // Get distraction counts
        let distraction_count = distractions::count_by_session(
            self.database.pool(),
            session_id
        ).await?;
        
        let unintentional_distraction_count = distractions::count_unintentional_by_session(
            self.database.pool(),
            session_id
        ).await?;
        
        // Get application time breakdown from activity logs during the session
        let end_time = session.end_time.unwrap_or_else(|| Utc::now().timestamp_millis());
        let app_times = activity_logs::get_time_by_application(
            self.database.pool(),
            session.start_time,
            end_time
        ).await?;
        
        // Convert to HashMap for the summary
        let mut application_breakdown = std::collections::HashMap::new();
        let mut distraction_time: i64 = 0;
        
        // Get productive categories for this session
        let productive_categories = session.get_productive_categories();
        
        // Calculate time spent in each application and categorize as focus or distraction
        for (app_name, duration_ms) in app_times {
            let duration_seconds = duration_ms / 1000; // Convert milliseconds to seconds
            application_breakdown.insert(app_name.clone(), duration_seconds);
            
            // Check if this application was distracting during the session
            // Get the application's category
            let category = categories::get_category_with_fallback(
                self.database.pool(),
                &app_name
            ).await.unwrap_or_else(|_| "Neutral".to_string());
            
            // If the category is not in the productive list, it's distraction time
            if !productive_categories.contains(&category) {
                distraction_time += duration_seconds;
            }
        }
        
        // Calculate actual focus time (total time minus distraction time)
        let focus_time = total_duration.saturating_sub(distraction_time);
        
        // Calculate productivity score based on focus time ratio
        // Score = (focus_time / total_duration) * 100
        let productivity_score = if total_duration > 0 {
            ((focus_time as f64 / total_duration as f64) * 100.0) as i64
        } else {
            0
        };
        
        log::info!(
            "Session summary generated: {} - Total: {}s, Focus: {}s, Distractions: {}, Score: {}",
            session_id,
            total_duration,
            focus_time,
            distraction_count,
            productivity_score
        );
        
        Ok(SessionSummary {
            session_id: session_id.to_string(),
            total_duration,
            focus_time,
            distraction_count,
            unintentional_distraction_count,
            productivity_score,
            application_breakdown,
        })
    }
    
    /// Set a session-scoped category override
    /// 
    /// This temporarily overrides the category for an application during the current session.
    /// The override is cleared when the session ends.
    /// 
    /// # Arguments
    /// * `application` - Name of the application
    /// * `category` - Category to assign for this session only
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if override was set successfully
    /// 
    /// # Requirements
    /// Validates: Requirement 5.5 (Session-scoped category overrides)
    pub async fn set_session_category_override(
        &self,
        application: String,
        category: String,
    ) -> Result<()> {
        // Verify a session is active
        let current = self.current_session.read().await;
        if current.is_none() {
            anyhow::bail!("No active focus session");
        }
        
        // Set the override
        self.session_category_overrides.write().await.insert(application.clone(), category.clone());
        
        log::info!("Session category override set: {} -> {}", application, category);
        Ok(())
    }
    
    /// Get a session-scoped category override
    /// 
    /// # Arguments
    /// * `application` - Name of the application
    /// 
    /// # Returns
    /// * `Option<String>` - The override category if one exists
    pub async fn get_session_category_override(&self, application: &str) -> Option<String> {
        self.session_category_overrides.read().await.get(application).cloned()
    }
    
    /// Get all session-scoped category overrides
    /// 
    /// # Returns
    /// * `HashMap<String, String>` - Map of application names to override categories
    pub async fn get_all_session_category_overrides(&self) -> HashMap<String, String> {
        self.session_category_overrides.read().await.clone()
    }
    
    /// Clear a session-scoped category override
    /// 
    /// # Arguments
    /// * `application` - Name of the application
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if override was cleared
    pub async fn clear_session_category_override(&self, application: &str) -> Result<()> {
        self.session_category_overrides.write().await.remove(application);
        log::info!("Session category override cleared: {}", application);
        Ok(())
    }
    
    /// Clear all session-scoped category overrides
    /// 
    /// # Returns
    /// * `Result<()>` - Ok if all overrides were cleared
    pub async fn clear_all_session_category_overrides(&self) -> Result<()> {
        self.session_category_overrides.write().await.clear();
        log::info!("All session category overrides cleared");
        Ok(())
    }
}

/// Summary of a focus session
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SessionSummary {
    pub session_id: String,
    pub total_duration: i64,
    pub focus_time: i64,
    pub distraction_count: i64,
    pub unintentional_distraction_count: i64,
    pub productivity_score: i64,
    pub application_breakdown: std::collections::HashMap<String, i64>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database;
    
    async fn create_test_database() -> Arc<Database> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_focus_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;
        
        let db = Database::new(db_path).await.unwrap();
        
        // Initialize default categories
        categories::insert_defaults(db.pool()).await.unwrap();
        
        Arc::new(db)
    }
    
    #[tokio::test]
    async fn test_start_stop_session() {
        let db = create_test_database().await;
        let manager = FocusSessionManager::new(Arc::clone(&db));
        
        // Start session
        let session_id = manager.start_session(
            vec!["Productive".to_string()],
            Some("Test goal".to_string())
        ).await.unwrap();
        
        assert!(!session_id.is_empty());
        
        // Verify session is active
        let current = manager.get_current_session().await;
        assert!(current.is_some());
        
        // Stop session
        manager.stop_session().await.unwrap();
        
        // Verify session is no longer active
        let current = manager.get_current_session().await;
        assert!(current.is_none());
    }
    
    #[tokio::test]
    async fn test_distraction_detection() {
        let db = create_test_database().await;
        let manager = FocusSessionManager::new(Arc::clone(&db));
        
        // Start session with only "Productive" category
        manager.start_session(
            vec!["Productive".to_string()],
            None
        ).await.unwrap();
        
        // Check productive app (VS Code is in Productive category)
        let is_distraction = manager.check_distraction("Visual Studio Code").await.unwrap();
        assert!(!is_distraction, "VS Code should not be a distraction");
        
        // Check distracting app (Spotify is in Entertainment category)
        let is_distraction = manager.check_distraction("Spotify").await.unwrap();
        assert!(is_distraction, "Spotify should be a distraction");
        
        // Check unknown app (should default to Neutral, which is distracting)
        let is_distraction = manager.check_distraction("UnknownApp").await.unwrap();
        assert!(is_distraction, "Unknown app should be a distraction");
    }
    
    #[tokio::test]
    async fn test_pause_resume() {
        let db = create_test_database().await;
        let manager = FocusSessionManager::new(Arc::clone(&db));
        
        // Start session
        manager.start_session(
            vec!["Productive".to_string()],
            None
        ).await.unwrap();
        
        // Pause session
        manager.pause_session().await.unwrap();
        
        // Distractions should not be detected when paused
        let is_distraction = manager.check_distraction("Spotify").await.unwrap();
        assert!(!is_distraction, "Distractions should not be detected when paused");
        
        // Resume session
        manager.resume_session().await.unwrap();
        
        // Distractions should be detected again
        let is_distraction = manager.check_distraction("Spotify").await.unwrap();
        assert!(is_distraction, "Distractions should be detected after resume");
    }
    
    #[tokio::test]
    async fn test_session_summary_generation() {
        use crate::database::activity_logs::{self, ActivityLog};
        use crate::database::sessions;
        use crate::database::categories;
        
        let db = create_test_database().await;
        let manager = FocusSessionManager::new(Arc::clone(&db));
        
        // Set Chrome as productive for this test
        let chrome_category = categories::ApplicationCategory::new(
            "Google Chrome".to_string(),
            "Productive".to_string(),
            false
        );
        categories::upsert(db.pool(), &chrome_category).await.unwrap();
        
        // Create a session manually with a known duration
        let session_id = uuid::Uuid::new_v4().to_string();
        let start_time = Utc::now().timestamp_millis() - 120000; // 2 minutes ago
        let end_time = Utc::now().timestamp_millis(); // now
        
        let mut session = sessions::FocusSession::new(
            session_id.clone(),
            start_time,
            vec!["Productive".to_string()]
        );
        session.end_time = Some(end_time);
        session.status = sessions::SessionStatus::Completed.as_str().to_string();
        session.goal = Some("Test session".to_string());
        
        // Insert the session
        sessions::insert(db.pool(), &session).await.unwrap();
        
        // Add productive activity (VS Code - 60 seconds)
        let mut log1 = ActivityLog::new("Visual Studio Code".to_string(), start_time + 1000);
        log1.duration = 60000; // 60 seconds in milliseconds
        log1.category = Some("Productive".to_string());
        activity_logs::insert(db.pool(), &log1).await.unwrap();
        
        // Add distracting activity (Spotify - 30 seconds)
        let mut log2 = ActivityLog::new("Spotify".to_string(), start_time + 61000);
        log2.duration = 30000; // 30 seconds in milliseconds
        log2.category = Some("Entertainment".to_string());
        activity_logs::insert(db.pool(), &log2).await.unwrap();
        
        // Add another productive activity (Chrome with work site - 20 seconds)
        let mut log3 = ActivityLog::new("Google Chrome".to_string(), start_time + 91000);
        log3.duration = 20000; // 20 seconds in milliseconds
        log3.category = Some("Productive".to_string());
        activity_logs::insert(db.pool(), &log3).await.unwrap();
        
        // Record a distraction event
        let distraction = distractions::DistractionEvent::new(
            session_id.clone(),
            start_time + 61000,
            "Spotify".to_string()
        );
        distractions::insert(db.pool(), &distraction).await.unwrap();
        
        // Generate summary
        let summary = manager.generate_summary(&session_id).await.unwrap();
        
        // Verify summary
        assert_eq!(summary.session_id, session_id);
        
        // Total duration should be 120 seconds (2 minutes)
        assert_eq!(summary.total_duration, 120, "Total duration should be 120 seconds, got {}", summary.total_duration);
        
        // Distraction count
        assert_eq!(summary.distraction_count, 1, "Should have 1 distraction");
        assert_eq!(summary.unintentional_distraction_count, 1, "Should have 1 unintentional distraction");
        
        // Verify application breakdown
        assert!(summary.application_breakdown.contains_key("Visual Studio Code"), "Should have VS Code in breakdown");
        assert!(summary.application_breakdown.contains_key("Spotify"), "Should have Spotify in breakdown");
        assert!(summary.application_breakdown.contains_key("Google Chrome"), "Should have Chrome in breakdown");
        
        assert_eq!(*summary.application_breakdown.get("Visual Studio Code").unwrap(), 60, "VS Code should have 60 seconds");
        assert_eq!(*summary.application_breakdown.get("Spotify").unwrap(), 30, "Spotify should have 30 seconds");
        assert_eq!(*summary.application_breakdown.get("Google Chrome").unwrap(), 20, "Chrome should have 20 seconds");
        
        // Verify focus time calculation
        // Focus time = total time (120s) - distraction time (30s for Spotify) = 90s
        assert_eq!(summary.focus_time, 90, "Focus time should be 90 seconds (120 - 30), got {}", summary.focus_time);
        
        // Verify productivity score (focus_time / total_duration * 100)
        // Score = (90 / 120) * 100 = 75
        assert_eq!(summary.productivity_score, 75, "Productivity score should be 75%, got {}", summary.productivity_score);
        
        println!("✓ Session summary test passed!");
        println!("  Total duration: {} seconds", summary.total_duration);
        println!("  Focus time: {} seconds", summary.focus_time);
        println!("  Distraction count: {}", summary.distraction_count);
        println!("  Productivity score: {}%", summary.productivity_score);
        println!("  Application breakdown: {:?}", summary.application_breakdown);
    }
}
