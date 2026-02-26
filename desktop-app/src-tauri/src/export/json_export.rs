// ============================================================================
// JSON Export Module
// 
// This module implements JSON export for all user data including activity logs,
// categories, focus sessions, and settings.
// 
// Requirements: 18.2, 18.3, 18.4
// ============================================================================

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

use super::{ExportMetadata, ExportResult, generate_filename, get_export_directory, get_file_size};
use crate::database::activity_logs::ActivityLog;
use crate::database::categories::ApplicationCategory;
use crate::database::sessions::FocusSession;
use crate::database::distractions::DistractionEvent;

/// Complete user data export structure
#[derive(Debug, Serialize, Deserialize)]
pub struct UserDataExport {
    /// Export metadata
    pub metadata: ExportMetadata,
    /// Activity logs
    pub activity_logs: Vec<ActivityLog>,
    /// Application categories
    pub categories: Vec<ApplicationCategory>,
    /// Focus sessions
    pub focus_sessions: Vec<FocusSession>,
    /// Distraction events
    pub distraction_events: Vec<DistractionEvent>,
    /// Settings (key-value pairs)
    pub settings: Vec<(String, String)>,
}

/// Export all user data to JSON format
/// 
/// Creates a comprehensive JSON file with all user data including activity logs,
/// categories, focus sessions, distraction events, and settings.
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `start_time` - Start timestamp for activity logs (Unix epoch seconds)
/// * `end_time` - End timestamp for activity logs (Unix epoch seconds)
/// * `output_path` - Optional custom output path (uses default export directory if None)
/// 
/// # Returns
/// * `ExportResult` - Export result with file path and metadata
/// 
/// # Requirements
/// Validates: Requirements 18.2, 18.3, 18.4 (JSON export, date range filtering, metadata)
pub async fn export_all_data_json(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
    output_path: Option<PathBuf>,
) -> Result<ExportResult> {
    log::info!("Exporting all user data to JSON - range: {} to {}", start_time, end_time);
    
    // Fetch all data from database
    log::info!("Fetching activity logs...");
    let activity_logs = crate::database::activity_logs::get_by_time_range(pool, start_time, end_time)
        .await
        .context("Failed to fetch activity logs")?;
    
    log::info!("Fetching categories...");
    let categories = crate::database::categories::get_all(pool)
        .await
        .context("Failed to fetch categories")?;
    
    log::info!("Fetching focus sessions...");
    let focus_sessions = crate::database::sessions::get_by_time_range(pool, start_time, end_time)
        .await
        .context("Failed to fetch focus sessions")?;
    
    log::info!("Fetching distraction events...");
    let distraction_events = crate::database::distractions::get_by_time_range(pool, start_time, end_time)
        .await
        .context("Failed to fetch distraction events")?;
    
    log::info!("Fetching settings...");
    let settings: Vec<(String, String)> = crate::database::settings::get_all(pool)
        .await
        .context("Failed to fetch settings")?
        .into_iter()
        .map(|s| (s.key, s.value))
        .collect();
    
    let total_records = activity_logs.len() 
        + categories.len() 
        + focus_sessions.len() 
        + distraction_events.len() 
        + settings.len();
    
    log::info!("Total records to export: {}", total_records);
    
    // Create metadata
    let metadata = ExportMetadata::new(start_time, end_time, total_records);
    
    // Create export structure
    let export_data = UserDataExport {
        metadata: metadata.clone(),
        activity_logs,
        categories,
        focus_sessions,
        distraction_events,
        settings,
    };
    
    // Determine output path
    let file_path = match output_path {
        Some(path) => path,
        None => {
            let export_dir = get_export_directory()?;
            let filename = generate_filename("focusforge_data", "json");
            export_dir.join(filename)
        }
    };
    
    // Write JSON to file with pretty formatting
    let json_string = serde_json::to_string_pretty(&export_data)
        .context("Failed to serialize data to JSON")?;
    
    let mut file = File::create(&file_path)
        .context("Failed to create JSON file")?;
    
    file.write_all(json_string.as_bytes())
        .context("Failed to write JSON to file")?;
    
    file.flush()
        .context("Failed to flush file")?;
    
    log::info!("JSON export completed: {:?}", file_path);
    
    // Get file size
    let file_size = get_file_size(&file_path)?;
    
    Ok(ExportResult {
        file_path: file_path.to_string_lossy().to_string(),
        metadata,
        file_size,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::Database;

    #[tokio::test]
    async fn test_json_export() {
        // Create temporary database
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_json_export_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Insert test data
        let mut log = ActivityLog::new("VS Code".to_string(), 1000);
        log.duration = 3600;
        log.category = Some("Productive".to_string());
        crate::database::activity_logs::insert(pool, &log).await.unwrap();

        let category = ApplicationCategory::new("Chrome".to_string(), "Neutral".to_string(), false);
        crate::database::categories::upsert(pool, &category).await.unwrap();

        let session = FocusSession::new("test-session".to_string(), 1000, vec!["Productive".to_string()]);
        crate::database::sessions::insert(pool, &session).await.unwrap();

        crate::database::settings::set(pool, "test_key", "test_value").await.unwrap();

        // Export to JSON
        let output_path = temp_dir.join(format!("test_export_{}.json", uuid::Uuid::new_v4()));
        let result = export_all_data_json(pool, 0, 10000, Some(output_path.clone()))
            .await
            .unwrap();

        // Verify result
        assert!(result.metadata.record_count >= 4); // At least 1 log, 1 category, 1 session, 1 setting
        assert!(result.file_size > 0);
        assert!(output_path.exists());

        // Verify JSON content
        let content = std::fs::read_to_string(&output_path).unwrap();
        assert!(content.contains("VS Code"));
        assert!(content.contains("Chrome"));
        assert!(content.contains("test-session"));
        assert!(content.contains("test_key"));
        assert!(content.contains("metadata"));

        // Verify JSON is valid and can be deserialized
        let parsed: UserDataExport = serde_json::from_str(&content).unwrap();
        assert_eq!(parsed.activity_logs.len(), 1);
        assert!(parsed.categories.len() > 0); // Includes defaults + our test category
        assert_eq!(parsed.focus_sessions.len(), 1);

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
        let _ = std::fs::remove_file(&output_path);
    }

    #[tokio::test]
    async fn test_json_export_with_date_range() {
        // Create temporary database
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_json_range_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Insert test data with different timestamps
        for i in 0..5 {
            let log = ActivityLog::new(format!("App {}", i), 1000 + i * 1000);
            crate::database::activity_logs::insert(pool, &log).await.unwrap();
        }

        // Export only logs in range 2000-4000
        let output_path = temp_dir.join(format!("test_range_{}.json", uuid::Uuid::new_v4()));
        let result = export_all_data_json(pool, 2000, 4000, Some(output_path.clone()))
            .await
            .unwrap();

        // Verify JSON content
        let content = std::fs::read_to_string(&output_path).unwrap();
        let parsed: UserDataExport = serde_json::from_str(&content).unwrap();
        
        // Should only export 3 logs (at timestamps 2000, 3000, 4000)
        assert_eq!(parsed.activity_logs.len(), 3);
        assert_eq!(parsed.metadata.start_time, 2000);
        assert_eq!(parsed.metadata.end_time, 4000);

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
        let _ = std::fs::remove_file(&output_path);
    }
}
