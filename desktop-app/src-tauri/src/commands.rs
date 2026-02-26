// ============================================================================
// Tauri Commands Module
// 
// This module contains all Tauri command handlers that provide IPC
// (Inter-Process Communication) between the Next.js frontend and Rust backend.
// 
// Each command is exposed to the frontend via the `invoke` API and can be
// called from TypeScript using the tauri-api.ts client library.
// 
// Requirements: 2.3, 2.5
// ============================================================================

use crate::AppState;
use tauri::State;
use serde::{Serialize, Deserialize};

// ============================================================================
// Data Transfer Objects (DTOs)
// ============================================================================

/// Application information for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationInfoDto {
    pub name: String,
    pub process_id: u32,
    pub bundle_id: Option<String>,
    pub executable_path: String,
}

impl From<crate::monitoring::ApplicationInfo> for ApplicationInfoDto {
    fn from(info: crate::monitoring::ApplicationInfo) -> Self {
        Self {
            name: info.name,
            process_id: info.process_id,
            bundle_id: info.bundle_id,
            executable_path: info.executable_path,
        }
    }
}

// ============================================================================
// Monitoring Commands
// ============================================================================

/// Start the system monitoring service
/// 
/// This command initializes and starts the background monitoring system that
/// tracks application focus and records activity logs.
/// 
/// Returns: Success message
#[tauri::command]
pub async fn start_monitoring(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: start_monitoring");
    
    state.monitoring_service().start().await
        .map_err(|e| format!("Failed to start monitoring: {}", e))?;
    
    log::info!("Monitoring service started successfully");
    Ok("Monitoring started".to_string())
}

/// Stop the system monitoring service
/// 
/// This command stops the background monitoring system and halts activity tracking.
/// 
/// Returns: Success message
#[tauri::command]
pub async fn stop_monitoring(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: stop_monitoring");
    
    state.monitoring_service().stop().await
        .map_err(|e| format!("Failed to stop monitoring: {}", e))?;
    
    log::info!("Monitoring service stopped successfully");
    Ok("Monitoring stopped".to_string())
}

/// Get monitoring status
/// 
/// Returns whether the monitoring service is currently running.
/// 
/// Returns: true if monitoring is active, false otherwise
#[tauri::command]
pub async fn get_monitoring_status(state: State<'_, AppState>) -> Result<bool, String> {
    log::info!("Command: get_monitoring_status");
    
    let is_running = state.monitoring_service().is_running().await;
    Ok(is_running)
}

/// Get information about the currently active window
/// 
/// This command queries the operating system to determine which application
/// currently has focus.
/// 
/// Returns: Active window information
#[tauri::command]
pub fn get_active_window(state: State<'_, AppState>) -> Result<ApplicationInfoDto, String> {
    log::info!("Command: get_active_window");
    
    state.monitoring_service()
        .get_active_application()
        .map(|info| info.into())
        .map_err(|e| format!("Failed to get active window: {}", e))
}

/// Get list of all running applications
/// 
/// This command enumerates all currently running applications with visible windows.
/// 
/// Returns: Array of application information
#[tauri::command]
pub fn get_running_apps(state: State<'_, AppState>) -> Result<Vec<ApplicationInfoDto>, String> {
    log::info!("Command: get_running_apps");
    
    state.monitoring_service()
        .list_applications()
        .map(|apps| apps.into_iter().map(|app| app.into()).collect())
        .map_err(|e| format!("Failed to list applications: {}", e))
}

// ============================================================================
// System Commands
// ============================================================================

/// Get application version
/// 
/// Returns the current version of the FocusForge desktop application.
/// 
/// Returns: Version string from Cargo.toml
#[tauri::command]
pub fn get_app_version() -> String {
    log::info!("Command: get_app_version");
    env!("CARGO_PKG_VERSION").to_string()
}

/// Ping command for testing IPC connectivity
/// 
/// This is a simple test command to verify that the frontend can successfully
/// communicate with the backend via Tauri's IPC system.
/// 
/// Returns: "pong" message with timestamp
#[tauri::command]
pub fn ping() -> String {
    log::info!("Command: ping");
    format!("pong at {}", chrono::Utc::now().to_rfc3339())
}

/// Echo command for testing IPC with parameters
/// 
/// This test command echoes back the provided message to verify that
/// parameters are correctly passed through the IPC system.
/// 
/// Args:
///   message: The message to echo back
/// 
/// Returns: The same message prefixed with "Echo: "
#[tauri::command]
pub fn echo(message: String) -> String {
    log::info!("Command: echo - message: {}", message);
    format!("Echo: {}", message)
}

// ============================================================================
// Database Commands
// ============================================================================

/// Check database status and integrity
/// 
/// This command verifies that the database is initialized and functioning correctly.
/// 
/// Returns: Database status information
#[tauri::command]
pub async fn check_database_status(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: check_database_status");
    
    let db = state.database();
    
    // Check database integrity
    let is_healthy = db.check_integrity().await
        .map_err(|e| format!("Failed to check database integrity: {}", e))?;
    
    if is_healthy {
        Ok("Database is healthy and operational".to_string())
    } else {
        Err("Database integrity check failed".to_string())
    }
}

// ============================================================================
// Activity Log Commands (Task 2.2)
// ============================================================================

use crate::database::activity_logs::{ActivityLog, self};
use crate::database::categories::{ApplicationCategory, self};
use crate::database::sessions::{FocusSession, SessionStatus, self};
use crate::database::distractions::{DistractionEvent, self};
use crate::database::settings;

/// Create a new activity log entry
#[tauri::command]
pub async fn create_activity_log(
    state: State<'_, AppState>,
    application: String,
    timestamp: i64,
    duration: i64,
) -> Result<i64, String> {
    log::info!("Command: create_activity_log - app: {}", application);
    
    let mut log = ActivityLog::new(application, timestamp);
    log.duration = duration;
    
    let id = activity_logs::insert(state.database().pool(), &log).await
        .map_err(|e| format!("Failed to create activity log: {}", e))?;
    
    Ok(id)
}

/// Get activity logs within a time range
#[tauri::command]
pub async fn get_activity_logs(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<ActivityLog>, String> {
    log::info!("Command: get_activity_logs - range: {} to {}", start_time, end_time);
    
    let logs = activity_logs::get_by_time_range(state.database().pool(), start_time, end_time).await
        .map_err(|e| format!("Failed to get activity logs: {}", e))?;
    
    Ok(logs)
}

/// Get time spent per application in a time range
#[tauri::command]
pub async fn get_time_by_application(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<(String, i64)>, String> {
    log::info!("Command: get_time_by_application");
    
    let results = activity_logs::get_time_by_application(state.database().pool(), start_time, end_time).await
        .map_err(|e| format!("Failed to get time by application: {}", e))?;
    
    Ok(results)
}

// ============================================================================
// Category Management Commands (Task 2.2)
// ============================================================================

/// Set application category
#[tauri::command]
pub async fn set_application_category(
    state: State<'_, AppState>,
    application: String,
    category: String,
    custom: bool,
) -> Result<String, String> {
    log::info!("Command: set_application_category - app: {}, cat: {}", application, category);
    
    let cat = ApplicationCategory::new(application, category, custom);
    categories::upsert(state.database().pool(), &cat).await
        .map_err(|e| format!("Failed to set category: {}", e))?;
    
    Ok("Category set successfully".to_string())
}

/// Get application category
#[tauri::command]
pub async fn get_application_category(
    state: State<'_, AppState>,
    application: String,
) -> Result<Option<ApplicationCategory>, String> {
    log::info!("Command: get_application_category - app: {}", application);
    
    let cat = categories::get_by_application(state.database().pool(), &application).await
        .map_err(|e| format!("Failed to get category: {}", e))?;
    
    Ok(cat)
}

/// Get application category with fallback to Neutral
/// 
/// This command looks up the category for an application and returns "Neutral"
/// if no category is found. This is the recommended way to get categories
/// for applications that may not have been categorized yet.
#[tauri::command]
pub async fn get_category_with_fallback(
    state: State<'_, AppState>,
    application: String,
) -> Result<String, String> {
    log::info!("Command: get_category_with_fallback - app: {}", application);
    
    let category = categories::get_category_with_fallback(state.database().pool(), &application).await
        .map_err(|e| format!("Failed to get category: {}", e))?;
    
    Ok(category)
}

/// Get all application categories
#[tauri::command]
pub async fn get_all_categories(state: State<'_, AppState>) -> Result<Vec<ApplicationCategory>, String> {
    log::info!("Command: get_all_categories");
    
    let cats = categories::get_all(state.database().pool()).await
        .map_err(|e| format!("Failed to get categories: {}", e))?;
    
    Ok(cats)
}

/// Get all custom categories (user-defined)
#[tauri::command]
pub async fn get_custom_categories(state: State<'_, AppState>) -> Result<Vec<ApplicationCategory>, String> {
    log::info!("Command: get_custom_categories");
    
    let cats = categories::get_custom(state.database().pool()).await
        .map_err(|e| format!("Failed to get custom categories: {}", e))?;
    
    Ok(cats)
}

/// Delete an application category
#[tauri::command]
pub async fn delete_application_category(
    state: State<'_, AppState>,
    application: String,
) -> Result<String, String> {
    log::info!("Command: delete_application_category - app: {}", application);
    
    categories::delete(state.database().pool(), &application).await
        .map_err(|e| format!("Failed to delete category: {}", e))?;
    
    Ok("Category deleted successfully".to_string())
}

/// Create a custom category for an application
/// 
/// This command creates a user-defined category for an application.
/// Custom categories are marked with custom=true in the database.
#[tauri::command]
pub async fn create_custom_category(
    state: State<'_, AppState>,
    application: String,
    category: String,
) -> Result<String, String> {
    log::info!("Command: create_custom_category - app: {}, cat: {}", application, category);
    
    let cat = ApplicationCategory::new(application, category, true);
    categories::upsert(state.database().pool(), &cat).await
        .map_err(|e| format!("Failed to create custom category: {}", e))?;
    
    Ok("Custom category created successfully".to_string())
}

/// List all unique category names in the database
/// 
/// This returns a list of all distinct category names that have been used,
/// which is useful for displaying available categories in the UI.
#[tauri::command]
pub async fn list_category_names(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    log::info!("Command: list_category_names");
    
    let all_categories = categories::get_all(state.database().pool()).await
        .map_err(|e| format!("Failed to get categories: {}", e))?;
    
    // Extract unique category names
    let mut category_names: Vec<String> = all_categories
        .into_iter()
        .map(|cat| cat.category)
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    
    category_names.sort();
    Ok(category_names)
}

/// Initialize default categories
#[tauri::command]
pub async fn init_default_categories(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: init_default_categories");
    
    categories::insert_defaults(state.database().pool()).await
        .map_err(|e| format!("Failed to initialize default categories: {}", e))?;
    
    Ok("Default categories initialized".to_string())
}

// ============================================================================
// Focus Session Commands (Task 2.2)
// ============================================================================

/// Create a new focus session
#[tauri::command]
pub async fn create_focus_session(
    state: State<'_, AppState>,
    id: String,
    start_time: i64,
    productive_categories: Vec<String>,
    goal: Option<String>,
) -> Result<String, String> {
    log::info!("Command: create_focus_session - id: {}", id);
    
    let mut session = FocusSession::new(id, start_time, productive_categories);
    session.goal = goal;
    
    sessions::insert(state.database().pool(), &session).await
        .map_err(|e| format!("Failed to create session: {}", e))?;
    
    Ok("Session created successfully".to_string())
}

/// Get focus session by ID
#[tauri::command]
pub async fn get_focus_session(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<FocusSession>, String> {
    log::info!("Command: get_focus_session - id: {}", id);
    
    let session = sessions::get_by_id(state.database().pool(), &id).await
        .map_err(|e| format!("Failed to get session: {}", e))?;
    
    Ok(session)
}

/// Get active focus session
#[tauri::command]
pub async fn get_active_session(state: State<'_, AppState>) -> Result<Option<FocusSession>, String> {
    log::info!("Command: get_active_session");
    
    let session = sessions::get_active(state.database().pool()).await
        .map_err(|e| format!("Failed to get active session: {}", e))?;
    
    Ok(session)
}

/// Update session status
#[tauri::command]
pub async fn update_session_status(
    state: State<'_, AppState>,
    id: String,
    status: String,
) -> Result<String, String> {
    log::info!("Command: update_session_status - id: {}, status: {}", id, status);
    
    let status_enum = SessionStatus::from_str(&status)
        .ok_or_else(|| format!("Invalid status: {}", status))?;
    
    sessions::update_status(state.database().pool(), &id, status_enum).await
        .map_err(|e| format!("Failed to update session status: {}", e))?;
    
    Ok("Session status updated".to_string())
}

/// Complete a focus session
#[tauri::command]
pub async fn complete_focus_session(
    state: State<'_, AppState>,
    id: String,
    end_time: i64,
) -> Result<String, String> {
    log::info!("Command: complete_focus_session - id: {}", id);
    
    sessions::update_end_time(state.database().pool(), &id, end_time).await
        .map_err(|e| format!("Failed to update end time: {}", e))?;
    
    sessions::update_status(state.database().pool(), &id, SessionStatus::Completed).await
        .map_err(|e| format!("Failed to update status: {}", e))?;
    
    Ok("Session completed".to_string())
}

// ============================================================================
// Settings Commands (Task 2.2)
// ============================================================================

/// Get a setting value
#[tauri::command]
pub async fn get_setting(
    state: State<'_, AppState>,
    key: String,
) -> Result<Option<String>, String> {
    log::info!("Command: get_setting - key: {}", key);
    
    let value = settings::get(state.database().pool(), &key).await
        .map_err(|e| format!("Failed to get setting: {}", e))?;
    
    Ok(value)
}

/// Set a setting value
#[tauri::command]
pub async fn set_setting(
    state: State<'_, AppState>,
    key: String,
    value: String,
) -> Result<String, String> {
    log::info!("Command: set_setting - key: {}, value: {}", key, value);
    
    settings::set(state.database().pool(), &key, &value).await
        .map_err(|e| format!("Failed to set setting: {}", e))?;
    
    Ok("Setting updated".to_string())
}

/// Get all settings
#[tauri::command]
pub async fn get_all_settings(state: State<'_, AppState>) -> Result<Vec<(String, String)>, String> {
    log::info!("Command: get_all_settings");
    
    let settings_list = settings::get_all(state.database().pool()).await
        .map_err(|e| format!("Failed to get settings: {}", e))?;
    
    Ok(settings_list.into_iter().map(|s| (s.key, s.value)).collect())
}

// ============================================================================
// Distraction Event Commands (Task 2.2)
// ============================================================================

/// Create a new distraction event
#[tauri::command]
pub async fn create_distraction_event(
    state: State<'_, AppState>,
    session_id: String,
    timestamp: i64,
    application: String,
) -> Result<i64, String> {
    log::info!("Command: create_distraction_event - session: {}, app: {}", session_id, application);
    
    let event = DistractionEvent::new(session_id, timestamp, application);
    
    let id = distractions::insert(state.database().pool(), &event).await
        .map_err(|e| format!("Failed to create distraction event: {}", e))?;
    
    Ok(id)
}

/// Get distraction events for a session
#[tauri::command]
pub async fn get_session_distractions(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<Vec<DistractionEvent>, String> {
    log::info!("Command: get_session_distractions - session: {}", session_id);
    
    let events = distractions::get_by_session(state.database().pool(), &session_id).await
        .map_err(|e| format!("Failed to get distraction events: {}", e))?;
    
    Ok(events)
}

/// Mark a distraction as intentional
#[tauri::command]
pub async fn mark_distraction_intentional(
    state: State<'_, AppState>,
    id: i64,
    intentional: bool,
) -> Result<String, String> {
    log::info!("Command: mark_distraction_intentional - id: {}, intentional: {}", id, intentional);
    
    distractions::mark_intentional(state.database().pool(), id, intentional).await
        .map_err(|e| format!("Failed to mark distraction: {}", e))?;
    
    Ok("Distraction marked successfully".to_string())
}

/// Get distraction count for a session
#[tauri::command]
pub async fn get_distraction_count(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<i64, String> {
    log::info!("Command: get_distraction_count - session: {}", session_id);
    
    let count = distractions::count_by_session(state.database().pool(), &session_id).await
        .map_err(|e| format!("Failed to count distractions: {}", e))?;
    
    Ok(count)
}

/// Get unintentional distraction count for a session
#[tauri::command]
pub async fn get_unintentional_distraction_count(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<i64, String> {
    log::info!("Command: get_unintentional_distraction_count - session: {}", session_id);
    
    let count = distractions::count_unintentional_by_session(state.database().pool(), &session_id).await
        .map_err(|e| format!("Failed to count unintentional distractions: {}", e))?;
    
    Ok(count)
}

// ============================================================================
// Future Commands (Placeholders)
// 
// These commands will be implemented in future tasks:
// - Analytics commands (task 11.x)
// - Export commands (task 11.4)
// - Sync commands (task 14.x)
// ============================================================================


// ============================================================================
// Focus Session Manager Commands (Task 7.1)
// ============================================================================

use crate::focus::SessionSummary;

/// Start a new focus session
#[tauri::command]
pub async fn start_focus_session_v2(
    state: State<'_, AppState>,
    productive_categories: Vec<String>,
    goal: Option<String>,
) -> Result<String, String> {
    log::info!("Command: start_focus_session_v2");
    
    let session_id = state.focus_session_manager().start_session(productive_categories, goal).await
        .map_err(|e| format!("Failed to start focus session: {}", e))?;
    
    Ok(session_id)
}

/// Stop the current focus session
#[tauri::command]
pub async fn stop_focus_session_v2(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: stop_focus_session_v2");
    
    state.focus_session_manager().stop_session().await
        .map_err(|e| format!("Failed to stop focus session: {}", e))?;
    
    Ok("Focus session stopped".to_string())
}

/// Pause the current focus session
#[tauri::command]
pub async fn pause_focus_session(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: pause_focus_session");
    
    state.focus_session_manager().pause_session().await
        .map_err(|e| format!("Failed to pause focus session: {}", e))?;
    
    Ok("Focus session paused".to_string())
}

/// Resume the current focus session
#[tauri::command]
pub async fn resume_focus_session(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: resume_focus_session");
    
    state.focus_session_manager().resume_session().await
        .map_err(|e| format!("Failed to resume focus session: {}", e))?;
    
    Ok("Focus session resumed".to_string())
}

/// Get the current active focus session
#[tauri::command]
pub async fn get_current_focus_session(state: State<'_, AppState>) -> Result<Option<crate::database::sessions::FocusSession>, String> {
    log::info!("Command: get_current_focus_session");
    
    let session = state.focus_session_manager().get_current_session().await;
    Ok(session)
}

/// Check if an application is distracting
#[tauri::command]
pub async fn check_if_distracting(
    state: State<'_, AppState>,
    application: String,
) -> Result<bool, String> {
    log::info!("Command: check_if_distracting - app: {}", application);
    
    let is_distracting = state.focus_session_manager().check_distraction(&application).await
        .map_err(|e| format!("Failed to check distraction: {}", e))?;
    
    Ok(is_distracting)
}

/// Record a distraction event
#[tauri::command]
pub async fn record_distraction_event(
    state: State<'_, AppState>,
    application: String,
) -> Result<i64, String> {
    log::info!("Command: record_distraction_event - app: {}", application);
    
    let event_id = state.focus_session_manager().record_distraction(&application).await
        .map_err(|e| format!("Failed to record distraction: {}", e))?;
    
    Ok(event_id)
}

/// Generate summary for a focus session
#[tauri::command]
pub async fn get_session_summary(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<SessionSummary, String> {
    log::info!("Command: get_session_summary - session: {}", session_id);
    
    let summary = state.focus_session_manager().generate_summary(&session_id).await
        .map_err(|e| format!("Failed to generate summary: {}", e))?;
    
    Ok(summary)
}


// ============================================================================
// Authentication Commands
// ============================================================================

/// Register a new user
#[tauri::command]
pub async fn register_user(
    state: State<'_, AppState>,
    email: String,
    password: String,
    name: Option<String>,
) -> Result<crate::auth::AuthResponse, String> {
    log::info!("Command: register_user for email: {}", email);
    
    let request = crate::auth::RegisterRequest {
        email,
        password,
        name,
    };
    
    state.auth_service()
        .register(request)
        .await
        .map_err(|e| format!("Registration failed: {}", e))
}

/// Login user
#[tauri::command]
pub async fn login_user(
    state: State<'_, AppState>,
    email: String,
    password: String,
) -> Result<crate::auth::AuthResponse, String> {
    log::info!("Command: login_user for email: {}", email);
    
    let request = crate::auth::LoginRequest {
        email,
        password,
    };
    
    state.auth_service()
        .login(request)
        .await
        .map_err(|e| format!("Login failed: {}", e))
}

/// Logout user
#[tauri::command]
pub async fn logout_user(
    state: State<'_, AppState>,
    token: String,
) -> Result<String, String> {
    log::info!("Command: logout_user");
    
    state.auth_service()
        .logout(&token)
        .await
        .map_err(|e| format!("Logout failed: {}", e))?;
    
    Ok("Logged out successfully".to_string())
}

/// Verify session token
#[tauri::command]
pub async fn verify_session(
    state: State<'_, AppState>,
    token: String,
) -> Result<crate::auth::User, String> {
    log::info!("Command: verify_session");
    
    state.auth_service()
        .verify_session(&token)
        .await
        .map_err(|e| format!("Session verification failed: {}", e))
}

/// Get current user from session
#[tauri::command]
pub async fn get_current_user(
    state: State<'_, AppState>,
    token: String,
) -> Result<crate::auth::User, String> {
    log::info!("Command: get_current_user");
    
    state.auth_service()
        .verify_session(&token)
        .await
        .map_err(|e| format!("Failed to get current user: {}", e))
}

// ============================================================================
// Session-Scoped Category Override Commands (Task 6.2)
// ============================================================================

/// Set a session-scoped category override
/// 
/// This temporarily overrides the category for an application during the current
/// focus session. The override is cleared when the session ends.
/// 
/// # Requirements
/// Validates: Requirement 5.5 (Session-scoped category overrides)
#[tauri::command]
pub async fn set_session_category_override(
    state: State<'_, AppState>,
    application: String,
    category: String,
) -> Result<String, String> {
    log::info!("Command: set_session_category_override - app: {}, cat: {}", application, category);
    
    state.focus_session_manager()
        .set_session_category_override(application, category)
        .await
        .map_err(|e| format!("Failed to set session category override: {}", e))?;
    
    Ok("Session category override set successfully".to_string())
}

/// Get a session-scoped category override
/// 
/// Returns the override category for an application if one exists for the current session.
#[tauri::command]
pub async fn get_session_category_override(
    state: State<'_, AppState>,
    application: String,
) -> Result<Option<String>, String> {
    log::info!("Command: get_session_category_override - app: {}", application);
    
    let override_cat = state.focus_session_manager()
        .get_session_category_override(&application)
        .await;
    
    Ok(override_cat)
}

/// Get all session-scoped category overrides
/// 
/// Returns a map of all application names to their override categories for the current session.
#[tauri::command]
pub async fn get_all_session_category_overrides(
    state: State<'_, AppState>,
) -> Result<std::collections::HashMap<String, String>, String> {
    log::info!("Command: get_all_session_category_overrides");
    
    let overrides = state.focus_session_manager()
        .get_all_session_category_overrides()
        .await;
    
    Ok(overrides)
}

/// Clear a session-scoped category override
/// 
/// Removes the override for a specific application, reverting to the permanent category.
#[tauri::command]
pub async fn clear_session_category_override(
    state: State<'_, AppState>,
    application: String,
) -> Result<String, String> {
    log::info!("Command: clear_session_category_override - app: {}", application);
    
    state.focus_session_manager()
        .clear_session_category_override(&application)
        .await
        .map_err(|e| format!("Failed to clear session category override: {}", e))?;
    
    Ok("Session category override cleared successfully".to_string())
}

/// Clear all session-scoped category overrides
/// 
/// Removes all overrides for the current session, reverting all applications to their permanent categories.
#[tauri::command]
pub async fn clear_all_session_category_overrides(
    state: State<'_, AppState>,
) -> Result<String, String> {
    log::info!("Command: clear_all_session_category_overrides");
    
    state.focus_session_manager()
        .clear_all_session_category_overrides()
        .await
        .map_err(|e| format!("Failed to clear all session category overrides: {}", e))?;
    
    Ok("All session category overrides cleared successfully".to_string())
}

// ============================================================================
// Notification Commands (Task 8.3)
// ============================================================================

use crate::notifications::NotificationHistoryEntry;

/// Get notification history
/// 
/// Returns a list of recent notifications that have been displayed.
/// History is stored in memory and limited to the most recent 50 notifications.
/// 
/// # Returns
/// * `Vec<NotificationHistoryEntry>` - List of notification history entries
/// 
/// # Requirements
/// Validates: Requirement 17.6 (Notification history accessible from system tray menu)
#[tauri::command]
pub async fn get_notification_history(
    state: State<'_, AppState>,
) -> Result<Vec<NotificationHistoryEntry>, String> {
    log::info!("Command: get_notification_history");
    
    let history = state.notification_service().get_history().await;
    Ok(history)
}

/// Clear notification history
/// 
/// Removes all entries from the notification history.
/// 
/// # Returns
/// * `String` - Success message
#[tauri::command]
pub async fn clear_notification_history(
    state: State<'_, AppState>,
) -> Result<String, String> {
    log::info!("Command: clear_notification_history");
    
    state.notification_service().clear_history().await;
    Ok("Notification history cleared successfully".to_string())
}

/// Get notification settings
/// 
/// Returns the current notification settings including enabled status and timeout duration.
/// 
/// # Returns
/// * `NotificationSettings` - Current notification settings
#[tauri::command]
pub async fn get_notification_settings(
    state: State<'_, AppState>,
) -> Result<NotificationSettings, String> {
    log::info!("Command: get_notification_settings");
    
    let enabled = settings::get_bool(state.database().pool(), "notifications_enabled", true).await
        .map_err(|e| format!("Failed to get notification enabled setting: {}", e))?;
    
    let timeout_ms = settings::get_i64(state.database().pool(), "notification_timeout_ms", 5000).await
        .map_err(|e| format!("Failed to get notification timeout setting: {}", e))?;
    
    Ok(NotificationSettings {
        enabled,
        timeout_ms,
    })
}

/// Set notification settings
/// 
/// Updates the notification settings including enabled status and timeout duration.
/// 
/// # Arguments
/// * `enabled` - Whether notifications are enabled
/// * `timeout_ms` - Auto-dismiss timeout in milliseconds
/// 
/// # Returns
/// * `String` - Success message
/// 
/// # Requirements
/// Validates: Requirement 17.3 (Configurable auto-dismiss timeout)
#[tauri::command]
pub async fn set_notification_settings(
    state: State<'_, AppState>,
    enabled: bool,
    timeout_ms: i64,
) -> Result<String, String> {
    log::info!("Command: set_notification_settings - enabled: {}, timeout: {}ms", enabled, timeout_ms);
    
    settings::set_bool(state.database().pool(), "notifications_enabled", enabled).await
        .map_err(|e| format!("Failed to set notification enabled setting: {}", e))?;
    
    settings::set_i64(state.database().pool(), "notification_timeout_ms", timeout_ms).await
        .map_err(|e| format!("Failed to set notification timeout setting: {}", e))?;
    
    Ok("Notification settings updated successfully".to_string())
}

/// Notification settings DTO
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettings {
    pub enabled: bool,
    pub timeout_ms: i64,
}


// ============================================================================
// Analytics Commands (Task 11.1)
// ============================================================================

use crate::analytics::{ApplicationUsage, CategoryUsage, DailyStats, WeeklyStats, MonthlyStats};

/// Get time spent per application in a time range
/// 
/// Returns a list of applications with their total duration, sorted by duration descending.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// 
/// # Returns
/// * `Vec<ApplicationUsage>` - List of application usage statistics
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
#[tauri::command]
pub async fn get_analytics_time_by_application(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<ApplicationUsage>, String> {
    log::info!("Command: get_analytics_time_by_application - range: {} to {}", start_time, end_time);
    
    crate::analytics::queries::get_time_by_application(state.analytics_service().pool(), start_time, end_time)
        .await
        .map_err(|e| format!("Failed to get time by application: {}", e))
}

/// Get time spent per category in a time range
/// 
/// Returns a list of categories with their total duration, sorted by duration descending.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// 
/// # Returns
/// * `Vec<CategoryUsage>` - List of category usage statistics
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
#[tauri::command]
pub async fn get_analytics_time_by_category(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<CategoryUsage>, String> {
    log::info!("Command: get_analytics_time_by_category - range: {} to {}", start_time, end_time);
    
    crate::analytics::queries::get_time_by_category(state.analytics_service().pool(), start_time, end_time)
        .await
        .map_err(|e| format!("Failed to get time by category: {}", e))
}

/// Get top N applications by usage time
/// 
/// Returns the top N applications ranked by total duration in the specified time range.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// * `limit` - Maximum number of applications to return
/// 
/// # Returns
/// * `Vec<ApplicationUsage>` - List of top application usage statistics
/// 
/// # Requirements
/// Validates: Requirement 8.4 (Identify most distracting applications and websites)
#[tauri::command]
pub async fn get_analytics_top_applications(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
    limit: i64,
) -> Result<Vec<ApplicationUsage>, String> {
    log::info!("Command: get_analytics_top_applications - range: {} to {}, limit: {}", start_time, end_time, limit);
    
    crate::analytics::queries::get_top_applications(state.analytics_service().pool(), start_time, end_time, limit)
        .await
        .map_err(|e| format!("Failed to get top applications: {}", e))
}

/// Get most distracting applications
/// 
/// Returns applications categorized as "Distracting", ranked by total usage time.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// * `limit` - Maximum number of applications to return
/// 
/// # Returns
/// * `Vec<ApplicationUsage>` - List of most distracting application usage statistics
/// 
/// # Requirements
/// Validates: Requirement 8.4 (Identify most distracting applications and websites)
#[tauri::command]
pub async fn get_analytics_most_distracting(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
    limit: i64,
) -> Result<Vec<ApplicationUsage>, String> {
    log::info!("Command: get_analytics_most_distracting - range: {} to {}, limit: {}", start_time, end_time, limit);
    
    crate::analytics::queries::get_most_distracting_applications(state.analytics_service().pool(), start_time, end_time, limit)
        .await
        .map_err(|e| format!("Failed to get most distracting applications: {}", e))
}

/// Get daily statistics for a specific date range
/// 
/// Returns comprehensive statistics for a single day including category breakdown
/// and top applications.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// 
/// # Returns
/// * `DailyStats` - Daily statistics summary
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
#[tauri::command]
pub async fn get_analytics_daily_stats(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<DailyStats, String> {
    log::info!("Command: get_analytics_daily_stats - range: {} to {}", start_time, end_time);
    
    crate::analytics::queries::get_daily_stats(state.analytics_service().pool(), start_time, end_time)
        .await
        .map_err(|e| format!("Failed to get daily stats: {}", e))
}

/// Get weekly statistics
/// 
/// Returns comprehensive statistics for a week including daily breakdown.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// 
/// # Returns
/// * `WeeklyStats` - Weekly statistics summary
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
#[tauri::command]
pub async fn get_analytics_weekly_stats(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<WeeklyStats, String> {
    log::info!("Command: get_analytics_weekly_stats - range: {} to {}", start_time, end_time);
    
    crate::analytics::queries::get_weekly_stats(state.analytics_service().pool(), start_time, end_time)
        .await
        .map_err(|e| format!("Failed to get weekly stats: {}", e))
}

/// Get monthly statistics
/// 
/// Returns comprehensive statistics for a month including weekly breakdown.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// 
/// # Returns
/// * `MonthlyStats` - Monthly statistics summary
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
#[tauri::command]
pub async fn get_analytics_monthly_stats(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<MonthlyStats, String> {
    log::info!("Command: get_analytics_monthly_stats - range: {} to {}", start_time, end_time);
    
    crate::analytics::queries::get_monthly_stats(state.analytics_service().pool(), start_time, end_time)
        .await
        .map_err(|e| format!("Failed to get monthly stats: {}", e))
}

/// Get total activity time in a time range
/// 
/// Returns the sum of all activity durations in the specified time range.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// 
/// # Returns
/// * `i64` - Total time in seconds
#[tauri::command]
pub async fn get_analytics_total_time(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<i64, String> {
    log::info!("Command: get_analytics_total_time - range: {} to {}", start_time, end_time);
    
    crate::analytics::queries::get_total_time(state.analytics_service().pool(), start_time, end_time)
        .await
        .map_err(|e| format!("Failed to get total time: {}", e))
}

/// Get time range helper - today
/// 
/// Returns start and end timestamps for today (UTC).
/// 
/// # Returns
/// * `(i64, i64)` - Tuple of (start_timestamp, end_timestamp)
#[tauri::command]
pub fn get_time_range_today() -> (i64, i64) {
    log::info!("Command: get_time_range_today");
    crate::analytics::time_ranges::today()
}

/// Get time range helper - this week
/// 
/// Returns start and end timestamps for this week (Monday to Sunday, UTC).
/// 
/// # Returns
/// * `(i64, i64)` - Tuple of (start_timestamp, end_timestamp)
#[tauri::command]
pub fn get_time_range_this_week() -> (i64, i64) {
    log::info!("Command: get_time_range_this_week");
    crate::analytics::time_ranges::this_week()
}

/// Get time range helper - this month
/// 
/// Returns start and end timestamps for this month (UTC).
/// 
/// # Returns
/// * `(i64, i64)` - Tuple of (start_timestamp, end_timestamp)
#[tauri::command]
pub fn get_time_range_this_month() -> (i64, i64) {
    log::info!("Command: get_time_range_this_month");
    crate::analytics::time_ranges::this_month()
}

/// Get time range helper - last N days
/// 
/// Returns start and end timestamps for the last N days (UTC).
/// 
/// # Arguments
/// * `days` - Number of days to look back
/// 
/// # Returns
/// * `(i64, i64)` - Tuple of (start_timestamp, end_timestamp)
#[tauri::command]
pub fn get_time_range_last_n_days(days: i64) -> (i64, i64) {
    log::info!("Command: get_time_range_last_n_days - days: {}", days);
    crate::analytics::time_ranges::last_n_days(days)
}

// ============================================================================
// Session Analytics Commands (Task 11.3)
// ============================================================================

use crate::analytics::{SessionSuccessRate, DistractionPattern, SessionTrendPoint, SessionAnalytics};

/// Calculate session success rate
/// 
/// A session is considered successful if it has zero unintentional distractions.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch milliseconds)
/// * `end_time` - End timestamp (Unix epoch milliseconds)
/// 
/// # Returns
/// * `SessionSuccessRate` - Success rate statistics
/// 
/// # Requirements
/// Validates: Requirement 8.5 (Focus session success rates and trends)
#[tauri::command]
pub async fn calculate_session_success_rate(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<SessionSuccessRate, String> {
    log::info!("Command: calculate_session_success_rate - range: {} to {}", start_time, end_time);
    
    crate::analytics::session_analytics::calculate_success_rate(
        state.analytics_service().pool(),
        start_time,
        end_time
    )
    .await
    .map_err(|e| format!("Failed to calculate session success rate: {}", e))
}

/// Track distraction patterns
/// 
/// Analyzes which applications cause the most distractions during focus sessions.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch milliseconds)
/// * `end_time` - End timestamp (Unix epoch milliseconds)
/// * `limit` - Maximum number of patterns to return
/// 
/// # Returns
/// * `Vec<DistractionPattern>` - List of distraction patterns sorted by count
/// 
/// # Requirements
/// Validates: Requirement 8.5 (Focus session success rates and trends)
#[tauri::command]
pub async fn track_distraction_patterns(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
    limit: i64,
) -> Result<Vec<DistractionPattern>, String> {
    log::info!("Command: track_distraction_patterns - range: {} to {}, limit: {}", start_time, end_time, limit);
    
    crate::analytics::session_analytics::track_distraction_patterns(
        state.analytics_service().pool(),
        start_time,
        end_time,
        limit
    )
    .await
    .map_err(|e| format!("Failed to track distraction patterns: {}", e))
}

/// Generate session trend data
/// 
/// Creates daily trend data showing how session performance changes over time.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch milliseconds)
/// * `end_time` - End timestamp (Unix epoch milliseconds)
/// 
/// # Returns
/// * `Vec<SessionTrendPoint>` - List of daily trend points
/// 
/// # Requirements
/// Validates: Requirement 8.5 (Focus session success rates and trends)
#[tauri::command]
pub async fn generate_session_trends(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<SessionTrendPoint>, String> {
    log::info!("Command: generate_session_trends - range: {} to {}", start_time, end_time);
    
    crate::analytics::session_analytics::generate_session_trends(
        state.analytics_service().pool(),
        start_time,
        end_time
    )
    .await
    .map_err(|e| format!("Failed to generate session trends: {}", e))
}

/// Get comprehensive session analytics
/// 
/// Combines success rate, distraction patterns, and trend data into a single report.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch milliseconds)
/// * `end_time` - End timestamp (Unix epoch milliseconds)
/// 
/// # Returns
/// * `SessionAnalytics` - Comprehensive analytics report
/// 
/// # Requirements
/// Validates: Requirement 8.5 (Focus session success rates and trends)
#[tauri::command]
pub async fn get_session_analytics(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
) -> Result<SessionAnalytics, String> {
    log::info!("Command: get_session_analytics - range: {} to {}", start_time, end_time);
    
    crate::analytics::session_analytics::get_session_analytics(
        state.analytics_service().pool(),
        start_time,
        end_time
    )
    .await
    .map_err(|e| format!("Failed to get session analytics: {}", e))
}


// ============================================================================
// Data Export Commands (Task 11.4)
// ============================================================================

use crate::export::ExportResult;

/// Export activity logs to CSV format
/// 
/// Creates a CSV file with all activity logs in the specified date range.
/// The CSV includes headers, human-readable timestamps, and metadata.
/// 
/// # Arguments
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// * `output_path` - Optional custom output path (uses default export directory if None)
/// 
/// # Returns
/// * `ExportResult` - Export result with file path, metadata, and file size
/// 
/// # Requirements
/// Validates: Requirements 8.6, 18.1, 18.3, 18.4 (CSV export, date range filtering, metadata)
#[tauri::command]
pub async fn export_activity_logs_csv(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
    output_path: Option<String>,
) -> Result<ExportResult, String> {
    log::info!("Command: export_activity_logs_csv - range: {} to {}", start_time, end_time);
    
    let path = output_path.map(|p| std::path::PathBuf::from(p));
    
    crate::export::export_activity_logs_csv(
        state.database().pool(),
        start_time,
        end_time,
        path
    )
    .await
    .map_err(|e| format!("Failed to export activity logs to CSV: {}", e))
}

/// Export all user data to JSON format
/// 
/// Creates a comprehensive JSON file with all user data including activity logs,
/// categories, focus sessions, distraction events, and settings.
/// 
/// # Arguments
/// * `start_time` - Start timestamp for activity logs (Unix epoch seconds)
/// * `end_time` - End timestamp for activity logs (Unix epoch seconds)
/// * `output_path` - Optional custom output path (uses default export directory if None)
/// 
/// # Returns
/// * `ExportResult` - Export result with file path, metadata, and file size
/// 
/// # Requirements
/// Validates: Requirements 8.6, 18.2, 18.3, 18.4 (JSON export, date range filtering, metadata)
#[tauri::command]
pub async fn export_all_data_json(
    state: State<'_, AppState>,
    start_time: i64,
    end_time: i64,
    output_path: Option<String>,
) -> Result<ExportResult, String> {
    log::info!("Command: export_all_data_json - range: {} to {}", start_time, end_time);
    
    let path = output_path.map(|p| std::path::PathBuf::from(p));
    
    crate::export::export_all_data_json(
        state.database().pool(),
        start_time,
        end_time,
        path
    )
    .await
    .map_err(|e| format!("Failed to export all data to JSON: {}", e))
}

/// Get the default export directory path
/// 
/// Returns the platform-specific default export directory where exported files are saved.
/// 
/// # Returns
/// * `String` - Path to the export directory
#[tauri::command]
pub fn get_export_directory() -> Result<String, String> {
    log::info!("Command: get_export_directory");
    
    crate::export::get_export_directory()
        .map(|path| path.to_string_lossy().to_string())
        .map_err(|e| format!("Failed to get export directory: {}", e))
}

// ============================================================================
// Database Recovery Commands (Task 18.2)
// ============================================================================

use crate::database::recovery::{RecoveryStatus, BackupInfo};

/// Check database integrity manually
/// 
/// Runs SQLite's PRAGMA integrity_check to verify database health.
/// This can be called from the diagnostic tool UI.
/// 
/// # Returns
/// * `bool` - true if database is healthy, false if corrupted
/// 
/// # Requirements
/// Validates: Requirement 20.5 (Database corruption recovery)
#[tauri::command]
pub async fn check_database_integrity(state: State<'_, AppState>) -> Result<bool, String> {
    log::info!("Command: check_database_integrity");
    
    crate::database::recovery::check_integrity(state.database().pool())
        .await
        .map_err(|e| format!("Failed to check database integrity: {}", e))
}

/// Create a manual backup of the database
/// 
/// Creates a timestamped backup in the backups directory.
/// Useful before performing risky operations or for manual backup purposes.
/// 
/// # Returns
/// * `BackupInfo` - Information about the created backup
/// 
/// # Requirements
/// Validates: Requirement 20.5 (Database corruption recovery)
#[tauri::command]
pub async fn create_database_backup(state: State<'_, AppState>) -> Result<BackupInfo, String> {
    log::info!("Command: create_database_backup");
    
    let db_path = crate::database::get_database_path()
        .map_err(|e| format!("Failed to get database path: {}", e))?;
    
    crate::database::recovery::create_backup(&db_path)
        .await
        .map_err(|e| format!("Failed to create database backup: {}", e))
}

/// Attempt to recover a corrupted database
/// 
/// Performs the full recovery process:
/// 1. Checks integrity
/// 2. Creates backup if corrupted
/// 3. Attempts VACUUM recovery
/// 4. Recreates database if VACUUM fails
/// 
/// # Returns
/// * `String` - Recovery status message
/// 
/// # Requirements
/// Validates: Requirement 20.5 (Database corruption recovery)
#[tauri::command]
pub async fn recover_database(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: recover_database");
    
    let db_path = crate::database::get_database_path()
        .map_err(|e| format!("Failed to get database path: {}", e))?;
    
    let status = crate::database::recovery::recover_database(state.database().pool(), &db_path)
        .await
        .map_err(|e| format!("Failed to recover database: {}", e))?;
    
    let message = match status {
        RecoveryStatus::Healthy => "Database is healthy, no recovery needed".to_string(),
        RecoveryStatus::RecoveredWithVacuum => "Database successfully recovered using VACUUM".to_string(),
        RecoveryStatus::Recreated => "Database was unrecoverable and has been recreated from schema. Previous data was backed up.".to_string(),
        RecoveryStatus::Failed(err) => format!("Database recovery failed: {}", err),
    };
    
    Ok(message)
}

/// Run VACUUM on the database
/// 
/// Rebuilds the database file, repacking it into a minimal amount of disk space.
/// This can help recover from some types of corruption and optimize database performance.
/// 
/// # Returns
/// * `String` - Success message
/// 
/// # Requirements
/// Validates: Requirement 20.5 (Database corruption recovery)
#[tauri::command]
pub async fn vacuum_database(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Command: vacuum_database");
    
    state.database().vacuum()
        .await
        .map_err(|e| format!("Failed to vacuum database: {}", e))?;
    
    Ok("Database vacuumed successfully".to_string())
}

/// Clean up old database backups
/// 
/// Removes backups older than 7 days to free up disk space.
/// 
/// # Returns
/// * `usize` - Number of backups deleted
/// 
/// # Requirements
/// Validates: Requirement 20.5 (Database corruption recovery)
#[tauri::command]
pub async fn cleanup_old_backups(state: State<'_, AppState>) -> Result<usize, String> {
    log::info!("Command: cleanup_old_backups");
    
    let db_path = crate::database::get_database_path()
        .map_err(|e| format!("Failed to get database path: {}", e))?;
    
    crate::database::recovery::cleanup_old_backups(&db_path)
        .await
        .map_err(|e| format!("Failed to cleanup old backups: {}", e))
}

/// Get database recovery status
/// 
/// Returns information about the database health and recovery history.
/// 
/// # Returns
/// * `DatabaseRecoveryInfo` - Recovery status information
#[tauri::command]
pub async fn get_database_recovery_info(state: State<'_, AppState>) -> Result<DatabaseRecoveryInfo, String> {
    log::info!("Command: get_database_recovery_info");
    
    let db_path = crate::database::get_database_path()
        .map_err(|e| format!("Failed to get database path: {}", e))?;
    
    // Check integrity
    let is_healthy = crate::database::recovery::check_integrity(state.database().pool())
        .await
        .map_err(|e| format!("Failed to check integrity: {}", e))?;
    
    // Count backups
    let backup_dir = db_path.parent()
        .ok_or_else(|| "Failed to get database parent directory".to_string())?
        .join("backups");
    
    let backup_count = if backup_dir.exists() {
        tokio::fs::read_dir(&backup_dir)
            .await
            .map_err(|e| format!("Failed to read backups directory: {}", e))?
            .next_entry()
            .await
            .map_err(|e| format!("Failed to count backups: {}", e))?
            .map(|_| 1)
            .unwrap_or(0)
    } else {
        0
    };
    
    // Get database file size
    let db_size = tokio::fs::metadata(&db_path)
        .await
        .map(|m| m.len())
        .unwrap_or(0);
    
    Ok(DatabaseRecoveryInfo {
        is_healthy,
        backup_count,
        database_size_bytes: db_size,
        database_path: db_path.to_string_lossy().to_string(),
    })
}

/// Database recovery information DTO
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseRecoveryInfo {
    pub is_healthy: bool,
    pub backup_count: usize,
    pub database_size_bytes: u64,
    pub database_path: String,
}
