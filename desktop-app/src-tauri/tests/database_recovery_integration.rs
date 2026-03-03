// Integration test for database corruption recovery
// 
// This test verifies that the database recovery system works correctly
// when integrated with the full application startup process.

use forgrin_desktop::database::{Database, recovery};
use std::path::PathBuf;

#[tokio::test]
async fn test_database_recovery_on_startup() {
    // Create a temporary database path
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_recovery_startup_{}.db", uuid::Uuid::new_v4()));
    
    // Clean up any existing test database
    let _ = tokio::fs::remove_file(&db_path).await;
    
    // Test 1: First startup with new database
    let (db1, status1) = Database::new_with_recovery(db_path.clone())
        .await
        .expect("Failed to create new database");
    
    assert_eq!(status1, recovery::RecoveryStatus::Healthy);
    assert!(db1.check_integrity().await.unwrap());
    
    db1.close().await;
    
    // Test 2: Second startup with existing healthy database
    let (db2, status2) = Database::new_with_recovery(db_path.clone())
        .await
        .expect("Failed to open existing database");
    
    assert_eq!(status2, recovery::RecoveryStatus::Healthy);
    assert!(db2.check_integrity().await.unwrap());
    
    db2.close().await;
    
    // Clean up
    let _ = tokio::fs::remove_file(&db_path).await;
    let backup_dir = db_path.parent().unwrap().join("backups");
    let _ = tokio::fs::remove_dir_all(&backup_dir).await;
}

#[tokio::test]
async fn test_backup_creation_before_risky_operations() {
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_backup_risky_{}.db", uuid::Uuid::new_v4()));
    
    // Clean up any existing test database
    let _ = tokio::fs::remove_file(&db_path).await;
    
    // Create database
    let (db, _) = Database::new_with_recovery(db_path.clone())
        .await
        .expect("Failed to create database");
    
    // Create a backup before a risky operation
    let backup_info = Database::create_backup(&db_path)
        .await
        .expect("Failed to create backup");
    
    assert!(backup_info.path.exists());
    assert!(backup_info.size_bytes > 0);
    assert!(backup_info.timestamp > 0);
    
    // Verify backup is in the backups directory
    let backup_dir = db_path.parent().unwrap().join("backups");
    assert!(backup_dir.exists());
    
    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
    let _ = tokio::fs::remove_dir_all(&backup_dir).await;
}

#[tokio::test]
async fn test_vacuum_recovery() {
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_vacuum_{}.db", uuid::Uuid::new_v4()));
    
    // Clean up any existing test database
    let _ = tokio::fs::remove_file(&db_path).await;
    
    // Create database
    let (db, _) = Database::new_with_recovery(db_path.clone())
        .await
        .expect("Failed to create database");
    
    // Run VACUUM (should succeed on healthy database)
    db.vacuum().await.expect("VACUUM failed");
    
    // Verify database is still healthy
    assert!(db.check_integrity().await.unwrap());
    
    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[tokio::test]
async fn test_backup_cleanup() {
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_cleanup_{}.db", uuid::Uuid::new_v4()));
    
    // Clean up any existing test database
    let _ = tokio::fs::remove_file(&db_path).await;
    
    // Create database
    let (db, _) = Database::new_with_recovery(db_path.clone())
        .await
        .expect("Failed to create database");
    
    // Create backups directory
    let backup_dir = db_path.parent().unwrap().join("backups");
    tokio::fs::create_dir_all(&backup_dir).await.unwrap();
    
    // Create old backup (8 days ago)
    let old_timestamp = chrono::Utc::now().timestamp() - (8 * 24 * 60 * 60);
    let old_backup_path = backup_dir.join(format!("forgrin_backup_{}.db", old_timestamp));
    tokio::fs::write(&old_backup_path, b"old backup").await.unwrap();
    
    // Create recent backup (1 day ago)
    let recent_timestamp = chrono::Utc::now().timestamp() - (1 * 24 * 60 * 60);
    let recent_backup_path = backup_dir.join(format!("forgrin_backup_{}.db", recent_timestamp));
    tokio::fs::write(&recent_backup_path, b"recent backup").await.unwrap();
    
    // Run cleanup
    let deleted_count = recovery::cleanup_old_backups(&db_path)
        .await
        .expect("Failed to cleanup backups");
    
    assert_eq!(deleted_count, 1);
    assert!(!old_backup_path.exists());
    assert!(recent_backup_path.exists());
    
    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
    let _ = tokio::fs::remove_dir_all(&backup_dir).await;
}

#[tokio::test]
async fn test_recovery_status_logging() {
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_status_logging_{}.db", uuid::Uuid::new_v4()));
    
    // Clean up any existing test database
    let _ = tokio::fs::remove_file(&db_path).await;
    
    // Create database with recovery
    let (db, status) = Database::new_with_recovery(db_path.clone())
        .await
        .expect("Failed to create database");
    
    // Verify status is Healthy for new database
    match status {
        recovery::RecoveryStatus::Healthy => {
            // Expected for new database
        }
        _ => panic!("Expected Healthy status for new database, got: {:?}", status),
    }
    
    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}
