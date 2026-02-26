// ============================================================================
// CSV Export Module
// 
// This module implements CSV export for activity logs with date range filtering.
// 
// Requirements: 18.1, 18.3, 18.4
// ============================================================================

use anyhow::{Context, Result};
use csv::Writer;
use serde::Serialize;
use sqlx::SqlitePool;
use std::fs::File;
use std::path::PathBuf;

use super::{ExportMetadata, ExportResult, generate_filename, get_export_directory, get_file_size};
use crate::database::activity_logs::ActivityLog;

/// CSV row for activity log export
#[derive(Debug, Serialize)]
struct ActivityLogCsvRow {
    id: i64,
    timestamp: i64,
    timestamp_iso: String,
    application: String,
    process_id: Option<i32>,
    category: Option<String>,
    duration: i64,
    duration_minutes: f64,
    url: Option<String>,
    page_title: Option<String>,
    browser: Option<String>,
    executable_path: Option<String>,
}

impl From<ActivityLog> for ActivityLogCsvRow {
    fn from(log: ActivityLog) -> Self {
        let timestamp_iso = chrono::DateTime::from_timestamp(log.timestamp, 0)
            .map(|dt| dt.to_rfc3339())
            .unwrap_or_else(|| "Invalid timestamp".to_string());
        
        let duration_minutes = log.duration as f64 / 60.0;
        
        Self {
            id: log.id.unwrap_or(0),
            timestamp: log.timestamp,
            timestamp_iso,
            application: log.application,
            process_id: log.process_id,
            category: log.category,
            duration: log.duration,
            duration_minutes,
            url: log.url,
            page_title: log.page_title,
            browser: log.browser,
            executable_path: log.executable_path,
        }
    }
}

/// Export activity logs to CSV format
/// 
/// Creates a CSV file with all activity logs in the specified date range.
/// The CSV includes headers and human-readable timestamps.
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `start_time` - Start timestamp (Unix epoch seconds)
/// * `end_time` - End timestamp (Unix epoch seconds)
/// * `output_path` - Optional custom output path (uses default export directory if None)
/// 
/// # Returns
/// * `ExportResult` - Export result with file path and metadata
/// 
/// # Requirements
/// Validates: Requirements 18.1, 18.3, 18.4 (CSV export, date range filtering, metadata)
pub async fn export_activity_logs_csv(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
    output_path: Option<PathBuf>,
) -> Result<ExportResult> {
    log::info!("Exporting activity logs to CSV - range: {} to {}", start_time, end_time);
    
    // Get activity logs from database
    let logs = crate::database::activity_logs::get_by_time_range(pool, start_time, end_time)
        .await
        .context("Failed to fetch activity logs")?;
    
    let record_count = logs.len();
    log::info!("Found {} activity logs to export", record_count);
    
    // Determine output path
    let file_path = match output_path {
        Some(path) => path,
        None => {
            let export_dir = get_export_directory()?;
            let filename = generate_filename("activity_logs", "csv");
            export_dir.join(filename)
        }
    };
    
    // Create CSV writer
    let file = File::create(&file_path)
        .context("Failed to create CSV file")?;
    let mut writer = Writer::from_writer(file);
    
    // Write CSV rows
    for log in logs {
        let row: ActivityLogCsvRow = log.into();
        writer.serialize(row)
            .context("Failed to write CSV row")?;
    }
    
    writer.flush()
        .context("Failed to flush CSV writer")?;
    
    log::info!("CSV export completed: {:?}", file_path);
    
    // Create metadata
    let metadata = ExportMetadata::new(start_time, end_time, record_count);
    
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
    async fn test_csv_export() {
        // Create temporary database
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_csv_export_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Insert test data
        let mut log1 = ActivityLog::new("VS Code".to_string(), 1000);
        log1.duration = 3600;
        log1.category = Some("Productive".to_string());
        crate::database::activity_logs::insert(pool, &log1).await.unwrap();

        let mut log2 = ActivityLog::new("Chrome".to_string(), 2000);
        log2.duration = 1800;
        log2.category = Some("Neutral".to_string());
        crate::database::activity_logs::insert(pool, &log2).await.unwrap();

        // Export to CSV
        let output_path = temp_dir.join(format!("test_export_{}.csv", uuid::Uuid::new_v4()));
        let result = export_activity_logs_csv(pool, 0, 10000, Some(output_path.clone()))
            .await
            .unwrap();

        // Verify result
        assert_eq!(result.metadata.record_count, 2);
        assert!(result.file_size > 0);
        assert!(output_path.exists());

        // Verify CSV content
        let content = std::fs::read_to_string(&output_path).unwrap();
        assert!(content.contains("VS Code"));
        assert!(content.contains("Chrome"));
        assert!(content.contains("Productive"));
        assert!(content.contains("Neutral"));

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
        let _ = std::fs::remove_file(&output_path);
    }

    #[tokio::test]
    async fn test_csv_export_with_date_range() {
        // Create temporary database
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_csv_range_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Insert test data with different timestamps
        for i in 0..5 {
            let log = ActivityLog::new(format!("App {}", i), 1000 + i * 1000);
            crate::database::activity_logs::insert(pool, &log).await.unwrap();
        }

        // Export only logs in range 2000-4000
        let output_path = temp_dir.join(format!("test_range_{}.csv", uuid::Uuid::new_v4()));
        let result = export_activity_logs_csv(pool, 2000, 4000, Some(output_path.clone()))
            .await
            .unwrap();

        // Should only export 3 logs (at timestamps 2000, 3000, 4000)
        assert_eq!(result.metadata.record_count, 3);

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
        let _ = std::fs::remove_file(&output_path);
    }
}
