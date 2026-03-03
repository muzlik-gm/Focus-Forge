use anyhow::{Context, Result};
use sqlx::SqlitePool;
use std::path::{Path, PathBuf};
use chrono::Utc;
use serde::{Serialize, Deserialize};

/// Status of database recovery operation
#[derive(Debug, Clone, PartialEq)]
pub enum RecoveryStatus {
    /// Database is healthy, no recovery needed
    Healthy,
    /// Database was corrupted but successfully recovered using VACUUM
    RecoveredWithVacuum,
    /// Database was unrecoverable and had to be recreated from schema
    Recreated,
    /// Recovery failed
    Failed(String),
}

/// Result of a backup operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupInfo {
    pub path: PathBuf,
    pub timestamp: i64,
    pub size_bytes: u64,
}

/// Check database integrity using SQLite's PRAGMA integrity_check
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// 
/// # Returns
/// * `Result<bool>` - true if database is healthy, false if corrupted
pub async fn check_integrity(pool: &SqlitePool) -> Result<bool> {
    log::info!("Running database integrity check...");
    
    let result: (String,) = sqlx::query_as("PRAGMA integrity_check")
        .fetch_one(pool)
        .await
        .context("Failed to run integrity check")?;

    let is_healthy = result.0 == "ok";
    
    if is_healthy {
        log::info!("Database integrity check passed");
    } else {
        log::error!("Database integrity check failed: {}", result.0);
    }
    
    Ok(is_healthy)
}

/// Create a timestamped backup of the database
/// 
/// # Arguments
/// * `db_path` - Path to the database file
/// 
/// # Returns
/// * `Result<BackupInfo>` - Information about the created backup
pub async fn create_backup(db_path: &Path) -> Result<BackupInfo> {
    log::info!("Creating database backup...");
    
    // Ensure database file exists
    if !db_path.exists() {
        return Err(anyhow::anyhow!("Database file does not exist: {:?}", db_path));
    }
    
    // Create backups directory
    let backup_dir = db_path.parent()
        .context("Failed to get database parent directory")?
        .join("backups");
    
    tokio::fs::create_dir_all(&backup_dir)
        .await
        .context("Failed to create backups directory")?;
    
    // Generate timestamped backup filename
    let timestamp = Utc::now().timestamp();
    let backup_filename = format!("forgrin_backup_{}.db", timestamp);
    let backup_path = backup_dir.join(&backup_filename);
    
    // Copy database file to backup location
    tokio::fs::copy(db_path, &backup_path)
        .await
        .context("Failed to copy database to backup location")?;
    
    // Get backup file size
    let metadata = tokio::fs::metadata(&backup_path)
        .await
        .context("Failed to get backup file metadata")?;
    
    let backup_info = BackupInfo {
        path: backup_path.clone(),
        timestamp,
        size_bytes: metadata.len(),
    };
    
    log::info!(
        "Database backup created: {:?} ({} bytes)",
        backup_path,
        backup_info.size_bytes
    );
    
    Ok(backup_info)
}

/// Clean up old backups, keeping only the last 7 days
/// 
/// # Arguments
/// * `db_path` - Path to the database file (used to find backups directory)
/// 
/// # Returns
/// * `Result<usize>` - Number of backups deleted
pub async fn cleanup_old_backups(db_path: &Path) -> Result<usize> {
    log::info!("Cleaning up old database backups...");
    
    let backup_dir = db_path.parent()
        .context("Failed to get database parent directory")?
        .join("backups");
    
    // If backups directory doesn't exist, nothing to clean up
    if !backup_dir.exists() {
        log::info!("No backups directory found, skipping cleanup");
        return Ok(0);
    }
    
    let cutoff_timestamp = Utc::now().timestamp() - (7 * 24 * 60 * 60); // 7 days ago
    let mut deleted_count = 0;
    
    // Read all files in backups directory
    let mut entries = tokio::fs::read_dir(&backup_dir)
        .await
        .context("Failed to read backups directory")?;
    
    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();
        
        // Only process .db files
        if path.extension().and_then(|s| s.to_str()) != Some("db") {
            continue;
        }
        
        // Extract timestamp from filename (format: forgrinIMESTAMP.db)
        if let Some(filename) = path.file_stem().and_then(|s| s.to_str()) {
            if let Some(timestamp_str) = filename.strip_prefix("forgrinp_") {
                if let Ok(timestamp) = timestamp_str.parse::<i64>() {
                    if timestamp < cutoff_timestamp {
                        // Delete old backup
                        tokio::fs::remove_file(&path)
                            .await
                            .context("Failed to delete old backup")?;
                        
                        log::info!("Deleted old backup: {:?}", path);
                        deleted_count += 1;
                    }
                }
            }
        }
    }
    
    log::info!("Cleaned up {} old backups", deleted_count);
    Ok(deleted_count)
}

/// Attempt to recover a corrupted database using VACUUM
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// 
/// # Returns
/// * `Result<bool>` - true if recovery succeeded, false if database is still corrupted
pub async fn recover_with_vacuum(pool: &SqlitePool) -> Result<bool> {
    log::info!("Attempting database recovery with VACUUM...");
    
    // Try to run VACUUM
    match sqlx::query("VACUUM")
        .execute(pool)
        .await
    {
        Ok(_) => {
            log::info!("VACUUM completed successfully");
            
            // Check if database is now healthy
            let is_healthy = check_integrity(pool).await?;
            
            if is_healthy {
                log::info!("Database successfully recovered with VACUUM");
            } else {
                log::error!("Database still corrupted after VACUUM");
            }
            
            Ok(is_healthy)
        }
        Err(e) => {
            log::error!("VACUUM failed: {}", e);
            Ok(false)
        }
    }
}

/// Recreate database from schema by closing the connection, deleting the file,
/// and creating a new database
/// 
/// # Arguments
/// * `db_path` - Path to the database file
/// 
/// # Returns
/// * `Result<()>` - Success or error
pub async fn recreate_database(db_path: &Path) -> Result<()> {
    log::warn!("Recreating database from schema...");
    
    // Delete the corrupted database file
    if db_path.exists() {
        tokio::fs::remove_file(db_path)
            .await
            .context("Failed to delete corrupted database")?;
        
        log::info!("Deleted corrupted database file");
    }
    
    // The database will be recreated when Database::new() is called again
    log::info!("Database will be recreated on next initialization");
    
    Ok(())
}

/// Perform complete database recovery process
/// 
/// This function:
/// 1. Checks database integrity
/// 2. Creates a backup if corruption is detected
/// 3. Attempts recovery with VACUUM
/// 4. Recreates database if VACUUM fails
/// 5. Cleans up old backups
/// 
/// # Arguments
/// * `pool` - Database connection pool (will be closed if recreation is needed)
/// * `db_path` - Path to the database file
/// 
/// # Returns
/// * `Result<RecoveryStatus>` - Status of the recovery operation
pub async fn recover_database(pool: &SqlitePool, db_path: &Path) -> Result<RecoveryStatus> {
    log::info!("Starting database recovery process...");
    
    // Step 1: Check integrity
    let is_healthy = check_integrity(pool).await?;
    
    if is_healthy {
        log::info!("Database is healthy, no recovery needed");
        
        // Still clean up old backups
        cleanup_old_backups(db_path).await?;
        
        return Ok(RecoveryStatus::Healthy);
    }
    
    // Step 2: Create backup before attempting recovery
    log::warn!("Database corruption detected, creating backup...");
    match create_backup(db_path).await {
        Ok(backup_info) => {
            log::info!("Backup created successfully: {:?}", backup_info.path);
        }
        Err(e) => {
            log::error!("Failed to create backup: {}", e);
            // Continue with recovery even if backup fails
        }
    }
    
    // Step 3: Attempt recovery with VACUUM
    log::info!("Attempting recovery with VACUUM...");
    let vacuum_success = recover_with_vacuum(pool).await?;
    
    if vacuum_success {
        log::info!("Database successfully recovered with VACUUM");
        cleanup_old_backups(db_path).await?;
        return Ok(RecoveryStatus::RecoveredWithVacuum);
    }
    
    // Step 4: VACUUM failed, need to recreate database
    log::warn!("VACUUM recovery failed, recreating database from schema...");
    
    // Close the connection pool before deleting the file
    pool.close().await;
    
    match recreate_database(db_path).await {
        Ok(_) => {
            log::info!("Database recreated successfully");
            cleanup_old_backups(db_path).await?;
            Ok(RecoveryStatus::Recreated)
        }
        Err(e) => {
            log::error!("Failed to recreate database: {}", e);
            Ok(RecoveryStatus::Failed(e.to_string()))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::Database;

    #[tokio::test]
    async fn test_check_integrity_healthy() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_integrity_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        let is_healthy = check_integrity(pool).await.unwrap();
        assert!(is_healthy);

        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    #[tokio::test]
    async fn test_create_backup() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_backup_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        // Create a database
        let db = Database::new(db_path.clone()).await.unwrap();
        db.close().await;

        // Create backup
        let backup_info = create_backup(&db_path).await.unwrap();
        
        assert!(backup_info.path.exists());
        assert!(backup_info.size_bytes > 0);
        assert!(backup_info.timestamp > 0);

        // Clean up
        let _ = tokio::fs::remove_file(&db_path).await;
        let _ = tokio::fs::remove_file(&backup_info.path).await;
    }

    #[tokio::test]
    async fn test_cleanup_old_backups() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_cleanup_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        // Create a database
        let db = Database::new(db_path.clone()).await.unwrap();
        db.close().await;

        // Create backups directory
        let backup_dir = db_path.parent().unwrap().join("backups");
        tokio::fs::create_dir_all(&backup_dir).await.unwrap();

        // Create old backup (8 days ago)
        let old_timestamp = Utc::now().timestamp() - (8 * 24 * 60 * 60);
        let old_backup_path = backup_dir.join(format!("forgrinckup_{}.db", old_timestamp));
        tokio::fs::write(&old_backup_path, b"old backup").await.unwrap();

        // Create recent backup (1 day ago)
        let recent_timestamp = Utc::now().timestamp() - (1 * 24 * 60 * 60);
        let recent_backup_path = backup_dir.join(format!("forgrinckup_{}.db", recent_timestamp));
        tokio::fs::write(&recent_backup_path, b"recent backup").await.unwrap();

        // Run cleanup
        let deleted_count = cleanup_old_backups(&db_path).await.unwrap();
        
        assert_eq!(deleted_count, 1);
        assert!(!old_backup_path.exists());
        assert!(recent_backup_path.exists());

        // Clean up
        let _ = tokio::fs::remove_file(&db_path).await;
        let _ = tokio::fs::remove_dir_all(&backup_dir).await;
    }

    #[tokio::test]
    async fn test_recover_with_vacuum() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_vacuum_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // On a healthy database, VACUUM should succeed
        let success = recover_with_vacuum(pool).await.unwrap();
        assert!(success);

        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    #[tokio::test]
    async fn test_recreate_database() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_recreate_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        // Create a database
        let db = Database::new(db_path.clone()).await.unwrap();
        db.close().await;

        assert!(db_path.exists());

        // Recreate it
        recreate_database(&db_path).await.unwrap();
        
        assert!(!db_path.exists());

        // Create new database to verify it works
        let new_db = Database::new(db_path.clone()).await.unwrap();
        let is_healthy = check_integrity(new_db.pool()).await.unwrap();
        assert!(is_healthy);

        new_db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    #[tokio::test]
    async fn test_recover_database_healthy() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_recover_healthy_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        let status = recover_database(pool, &db_path).await.unwrap();
        assert_eq!(status, RecoveryStatus::Healthy);

        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }
}
