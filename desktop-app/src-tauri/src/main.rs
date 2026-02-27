// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod monitoring;
mod focus;
mod notifications;
mod auth;
mod analytics;
mod export;

use std::sync::Arc;
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, Manager, State};
use tauri::SystemTrayMenuItem;

use database::Database;
use monitoring::MonitoringService;
use focus::FocusSessionManager;
use notifications::NotificationService;
use auth::AuthService;
use analytics::AnalyticsService;

/// Application state that holds all services and shared data
pub struct AppState {
    database: Arc<Database>,
    monitoring_service: Arc<MonitoringService>,
    focus_session_manager: Arc<FocusSessionManager>,
    notification_service: Arc<NotificationService>,
    auth_service: Arc<AuthService>,
    analytics_service: Arc<AnalyticsService>,
}

impl AppState {
    async fn new() -> anyhow::Result<Self> {
        // Initialize database with automatic corruption recovery
        let db_path = database::get_database_path()?;
        let (database, recovery_status) = Database::new_with_recovery(db_path).await?;
        
        // Log recovery status
        match recovery_status {
            database::recovery::RecoveryStatus::Healthy => {
                log::info!("Database initialized successfully - healthy");
            }
            database::recovery::RecoveryStatus::RecoveredWithVacuum => {
                log::warn!("Database was corrupted but successfully recovered using VACUUM");
            }
            database::recovery::RecoveryStatus::Recreated => {
                log::warn!("Database was unrecoverable and has been recreated from schema. Previous data was backed up.");
            }
            database::recovery::RecoveryStatus::Failed(ref err) => {
                log::error!("Database recovery failed: {}", err);
                return Err(anyhow::anyhow!("Database recovery failed: {}", err));
            }
        }
        
        let database = Arc::new(database);

        // Initialize auth service
        let auth_service = Arc::new(AuthService::new(database.pool().clone()));

        // Initialize notification service
        let notification_service = Arc::new(NotificationService::new(Arc::clone(&database)));

        // Initialize monitoring service
        let mut monitoring_service = MonitoringService::new(Arc::clone(&database));

        // Initialize focus session manager
        let focus_session_manager = Arc::new(FocusSessionManager::new(Arc::clone(&database)));

        // Initialize analytics service
        let analytics_service = Arc::new(AnalyticsService::new(database.pool().clone()));

        // Connect focus session manager to monitoring service for automatic distraction detection
        monitoring_service.set_focus_session_manager(Arc::clone(&focus_session_manager));
        
        // Connect notification service to monitoring service for distraction alerts
        monitoring_service.set_notification_service(Arc::clone(&notification_service));

        Ok(Self {
            database,
            monitoring_service: Arc::new(monitoring_service),
            focus_session_manager,
            notification_service,
            auth_service,
            analytics_service,
        })
    }

    pub fn database(&self) -> &Database {
        &self.database
    }

    pub fn monitoring_service(&self) -> &MonitoringService {
        &self.monitoring_service
    }

    pub fn focus_session_manager(&self) -> &FocusSessionManager {
        &self.focus_session_manager
    }

    pub fn notification_service(&self) -> &NotificationService {
        &self.notification_service
    }

    pub fn auth_service(&self) -> &AuthService {
        &self.auth_service
    }

    pub fn analytics_service(&self) -> &AnalyticsService {
        &self.analytics_service
    }
}

// ============================================================================
// Tauri Commands - IPC interface between frontend and backend
// ============================================================================
// Commands are now organized in the commands module (commands.rs)
// This keeps main.rs clean and makes the command structure more maintainable


// ============================================================================
// System Tray Setup
// ============================================================================

fn create_system_tray() -> SystemTray {
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide Window");
    let start_focus = CustomMenuItem::new("start_focus".to_string(), "Start Focus Session");
    let notification_history = CustomMenuItem::new("notification_history".to_string(), "Notification History");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit FocusForge");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(start_focus)
        .add_item(notification_history)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

fn handle_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            // Show and focus window on left click
            if let Some(window) = app.get_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "quit" => {
                    log::info!("Quit requested from system tray");
                    std::process::exit(0);
                }
                "show" => {
                    if let Some(window) = app.get_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "hide" => {
                    if let Some(window) = app.get_window("main") {
                        let _ = window.hide();
                    }
                }
                "start_focus" => {
                    // Show window and navigate to focus session page
                    if let Some(window) = app.get_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        // TODO: Emit event to frontend to navigate to focus page
                    }
                }
                "notification_history" => {
                    // Show window and emit event to display notification history
                    if let Some(window) = app.get_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                        let _ = window.emit("show-notification-history", ());
                        log::info!("Notification history requested from system tray");
                    }
                }
                _ => {}
            }
        }
        _ => {}
    }
}

// ============================================================================
// Main Application Entry Point
// ============================================================================

fn main() {
    // Initialize logging system
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();

    log::info!("Starting FocusForge Desktop Application v{}", env!("CARGO_PKG_VERSION"));

    // Create system tray
    let system_tray = create_system_tray();

    // Build and run the Tauri application
    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(handle_system_tray_event)
        .on_window_event(|event| {
            // Handle window close to minimize to tray instead of exit (Requirement 1.6)
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                event.window().hide().unwrap();
                api.prevent_close();
                log::info!("Window close prevented - minimized to system tray");
            }
        })
        .setup(|app| {
            // Initialize application state with database
            let runtime = tokio::runtime::Runtime::new()
                .expect("Failed to create tokio runtime");
            
            let app_state = runtime.block_on(async {
                let state = AppState::new().await
                    .expect("Failed to initialize application state");
                
                // Initialize default categories on first run
                if let Err(e) = database::categories::insert_defaults(state.database().pool()).await {
                    log::warn!("Failed to initialize default categories (may already exist): {}", e);
                } else {
                    log::info!("Default categories initialized successfully");
                }
                
                state
            });

            app.manage(app_state);
            log::info!("Application state initialized successfully");
            log::info!("Monitoring can be started from the frontend using start_monitoring command");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_monitoring,
            commands::stop_monitoring,
            commands::get_monitoring_status,
            commands::get_active_window,
            commands::get_running_apps,
            commands::get_app_version,
            commands::ping,
            commands::echo,
            commands::check_database_status,
            // Activity log commands
            commands::create_activity_log,
            commands::get_activity_logs,
            commands::get_time_by_application,
            // Category commands
            commands::set_application_category,
            commands::get_application_category,
            commands::get_category_with_fallback,
            commands::get_all_categories,
            commands::get_custom_categories,
            commands::delete_application_category,
            commands::create_custom_category,
            commands::list_category_names,
            commands::init_default_categories,
            // Focus session commands
            commands::create_focus_session,
            commands::get_focus_session,
            commands::get_active_session,
            commands::update_session_status,
            commands::complete_focus_session,
            // Distraction event commands
            commands::create_distraction_event,
            commands::get_session_distractions,
            commands::mark_distraction_intentional,
            commands::get_distraction_count,
            commands::get_unintentional_distraction_count,
            // Settings commands
            commands::get_setting,
            commands::set_setting,
            commands::get_all_settings,
            // Focus session manager commands
            commands::start_focus_session_v2,
            commands::stop_focus_session_v2,
            commands::pause_focus_session,
            commands::resume_focus_session,
            commands::get_current_focus_session,
            commands::check_if_distracting,
            commands::record_distraction_event,
            commands::get_session_summary,
            // Session-scoped category override commands
            commands::set_session_category_override,
            commands::get_session_category_override,
            commands::get_all_session_category_overrides,
            commands::clear_session_category_override,
            commands::clear_all_session_category_overrides,
            // Notification commands
            commands::get_notification_history,
            commands::clear_notification_history,
            commands::get_notification_settings,
            commands::set_notification_settings,
            // Authentication commands
            commands::register_user,
            commands::login_user,
            commands::logout_user,
            commands::verify_session,
            commands::get_current_user,
            // Analytics commands
            commands::get_analytics_time_by_application,
            commands::get_analytics_time_by_category,
            commands::get_analytics_top_applications,
            commands::get_analytics_most_distracting,
            commands::get_analytics_daily_stats,
            commands::get_analytics_weekly_stats,
            commands::get_analytics_monthly_stats,
            commands::get_analytics_total_time,
            commands::get_time_range_today,
            commands::get_time_range_this_week,
            commands::get_time_range_this_month,
            commands::get_time_range_last_n_days,
            // Session analytics commands
            commands::calculate_session_success_rate,
            commands::track_distraction_patterns,
            commands::generate_session_trends,
            commands::get_session_analytics,
            // Data export commands
            commands::export_activity_logs_csv,
            commands::export_all_data_json,
            commands::get_export_directory,
            // Database recovery commands
            commands::check_database_integrity,
            commands::create_database_backup,
            commands::recover_database,
            commands::vacuum_database,
            commands::cleanup_old_backups,
            commands::get_database_recovery_info,
            commands::test_categorization,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    log::info!("FocusForge Desktop Application shutdown complete");
}
