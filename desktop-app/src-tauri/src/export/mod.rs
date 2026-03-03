// ============================================================================
// Data Export Module
// 
// This module implements data export functionality for activity logs and
// user data in CSV and JSON formats with date range filtering and metadata.
// 
// Requirements: 8.6, 18.1, 18.2, 18.3, 18.4
// ============================================================================

use anyhow::{Context, Result};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

mod csv_export;
mod json_export;

pub use csv_export::export_activity_logs_csv;
pub use json_export::export_all_data_json;

// ============================================================================
// Data Transfer Objects
// ============================================================================

/// Export metadata included in all exports
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportMetadata {
    /// Timestamp when the export was created
    pub export_date: String,
    /// Application version
    pub app_version: String,
    /// Data schema version
    pub schema_version: String,
    /// Start of the date range (Unix timestamp)
    pub start_time: i64,
    /// End of the date range (Unix timestamp)
    pub end_time: i64,
    /// Total number of records exported
    pub record_count: usize,
}

impl ExportMetadata {
    /// Create new export metadata
    pub fn new(start_time: i64, end_time: i64, record_count: usize) -> Self {
        Self {
            export_date: Utc::now().to_rfc3339(),
            app_version: env!("CARGO_PKG_VERSION").to_string(),
            schema_version: "1.0.0".to_string(),
            start_time,
            end_time,
            record_count,
        }
    }
}

/// Export format options
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ExportFormat {
    Csv,
    Json,
}

/// Export result containing file path and metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportResult {
    /// Path to the exported file
    pub file_path: String,
    /// Export metadata
    pub metadata: ExportMetadata,
    /// File size in bytes
    pub file_size: u64,
}

// ============================================================================
// Helper Functions
// ============================================================================

/// Get the default export directory
/// 
/// Platform-specific locations:
/// - Windows: %USERPROFILE%\Documents\Forgrin\Exports
/// - macOS: ~/Documents/Forgrin/Exports
/// - Linux: ~/Documents/Forgrin/Exports
pub fn get_export_directory() -> Result<PathBuf> {
    let documents_dir = dirs::document_dir()
        .context("Failed to get documents directory")?;
    
    let export_dir = documents_dir
        .join("Forgrin")
        .join("Exports");
    
    // Create directory if it doesn't exist
    std::fs::create_dir_all(&export_dir)
        .context("Failed to create export directory")?;
    
    Ok(export_dir)
}

/// Generate a filename with timestamp
pub fn generate_filename(prefix: &str, extension: &str) -> String {
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
    format!("{}_{}.{}", prefix, timestamp, extension)
}

/// Get file size in bytes
pub fn get_file_size(path: &PathBuf) -> Result<u64> {
    let metadata = std::fs::metadata(path)
        .context("Failed to get file metadata")?;
    Ok(metadata.len())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_export_metadata_creation() {
        let metadata = ExportMetadata::new(1000, 2000, 100);
        
        assert_eq!(metadata.start_time, 1000);
        assert_eq!(metadata.end_time, 2000);
        assert_eq!(metadata.record_count, 100);
        assert_eq!(metadata.app_version, env!("CARGO_PKG_VERSION"));
        assert_eq!(metadata.schema_version, "1.0.0");
    }

    #[test]
    fn test_generate_filename() {
        let filename = generate_filename("activity_logs", "csv");
        assert!(filename.starts_with("activity_logs_"));
        assert!(filename.ends_with(".csv"));
    }

    #[test]
    fn test_export_directory_creation() {
        let export_dir = get_export_directory();
        assert!(export_dir.is_ok());
        
        let dir = export_dir.unwrap();
        assert!(dir.exists());
        assert!(dir.is_dir());
    }
}
