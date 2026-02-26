use anyhow::{Context, Result};
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use std::path::PathBuf;

// Export CRUD operation modules
pub mod activity_logs;
pub mod categories;
pub mod distractions;
pub mod sessions;
pub mod settings;
pub mod recovery;

/// Database service that manages SQLite connection and operations
/// Uses sqlx for async operations and automatic migrations
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    /// Create a new database instance and run migrations
    /// 
    /// # Arguments
    /// * `db_path` - Path to the SQLite database file
    /// 
    /// # Returns
    /// * `Result<Self>` - Database instance or error
    /// 
    /// # Requirements
    /// Validates: Requirements 9.1, 9.3 (Local-First Data Storage, Database Initialization)
    pub async fn new(db_path: PathBuf) -> Result<Self> {
        log::info!("Initializing database at: {:?}", db_path);

        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            tokio::fs::create_dir_all(parent)
                .await
                .context("Failed to create database directory")?;
        }

        // Create connection pool with reasonable defaults
        let database_url = format!("sqlite:{}?mode=rwc", db_path.display());
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .context("Failed to connect to database")?;

        log::info!("Database connection established");

        // Run migrations
        log::info!("Running database migrations...");
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .context("Failed to run database migrations")?;

        log::info!("Database migrations completed successfully");

        // Initialize default categories if this is the first run
        let category_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM application_categories")
            .fetch_one(&pool)
            .await
            .context("Failed to check category count")?;

        if category_count == 0 {
            log::info!("First run detected - initializing default categories");
            categories::insert_defaults(&pool)
                .await
                .context("Failed to initialize default categories")?;
            log::info!("Default categories initialized successfully");
        }

        Ok(Self { pool })
    }

    /// Create a new database instance with automatic corruption recovery
    /// 
    /// This method performs integrity checks on startup and attempts recovery if needed.
    /// 
    /// # Arguments
    /// * `db_path` - Path to the SQLite database file
    /// 
    /// # Returns
    /// * `Result<(Self, recovery::RecoveryStatus)>` - Database instance and recovery status
    /// 
    /// # Requirements
    /// Validates: Requirements 20.5 (Database Corruption Recovery)
    pub async fn new_with_recovery(db_path: PathBuf) -> Result<(Self, recovery::RecoveryStatus)> {
        log::info!("Initializing database with recovery checks at: {:?}", db_path);

        // Check if database file exists
        let db_exists = db_path.exists();

        // Create initial database connection
        let mut db = Self::new(db_path.clone()).await?;

        // If database already existed, check integrity and recover if needed
        let recovery_status = if db_exists {
            log::info!("Existing database detected, checking integrity...");
            
            // Check integrity
            let is_healthy = recovery::check_integrity(&db.pool).await?;
            
            if !is_healthy {
                log::warn!("Database corruption detected, starting recovery process...");
                
                // Perform recovery
                let status = recovery::recover_database(&db.pool, &db_path).await?;
                
                // If database was recreated, we need to create a new connection
                if status == recovery::RecoveryStatus::Recreated {
                    log::info!("Reconnecting to recreated database...");
                    db = Self::new(db_path.clone()).await?;
                }
                
                status
            } else {
                log::info!("Database integrity check passed");
                
                // Clean up old backups even if database is healthy
                recovery::cleanup_old_backups(&db_path).await?;
                
                recovery::RecoveryStatus::Healthy
            }
        } else {
            log::info!("New database created");
            recovery::RecoveryStatus::Healthy
        };

        Ok((db, recovery_status))
    }

    /// Create a backup of the database before performing risky operations
    /// 
    /// # Arguments
    /// * `db_path` - Path to the SQLite database file
    /// 
    /// # Returns
    /// * `Result<recovery::BackupInfo>` - Information about the created backup
    pub async fn create_backup(db_path: &std::path::Path) -> Result<recovery::BackupInfo> {
        recovery::create_backup(db_path).await
    }

    /// Get a reference to the connection pool
    /// Used by other services that need direct database access
    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }

    /// Close the database connection pool
    pub async fn close(&self) {
        self.pool.close().await;
        log::info!("Database connection closed");
    }

    /// Check database integrity
    /// Returns true if database passes integrity check
    pub async fn check_integrity(&self) -> Result<bool> {
        let result: (String,) = sqlx::query_as("PRAGMA integrity_check")
            .fetch_one(&self.pool)
            .await
            .context("Failed to run integrity check")?;

        Ok(result.0 == "ok")
    }

    /// Vacuum the database to reclaim space and optimize
    pub async fn vacuum(&self) -> Result<()> {
        sqlx::query("VACUUM")
            .execute(&self.pool)
            .await
            .context("Failed to vacuum database")?;

        log::info!("Database vacuumed successfully");
        Ok(())
    }
}

/// Get the default database path in the app data directory
/// 
/// Platform-specific locations:
/// - Windows: %APPDATA%/com.focusforge.desktop/focusforge.db
/// - macOS: ~/Library/Application Support/com.focusforge.desktop/focusforge.db
/// - Linux: ~/.local/share/com.focusforge.desktop/focusforge.db
pub fn get_database_path() -> Result<PathBuf> {
    // Get the app data directory using platform-specific paths
    let app_data_dir = if cfg!(target_os = "windows") {
        std::env::var("APPDATA")
            .map(PathBuf::from)
            .context("Failed to get APPDATA directory")?
            .join("com.focusforge.desktop")
    } else if cfg!(target_os = "macos") {
        dirs::home_dir()
            .context("Failed to get home directory")?
            .join("Library")
            .join("Application Support")
            .join("com.focusforge.desktop")
    } else {
        // Linux and other Unix-like systems
        dirs::home_dir()
            .context("Failed to get home directory")?
            .join(".local")
            .join("share")
            .join("com.focusforge.desktop")
    };

    let db_path = app_data_dir.join("focusforge.db");
    log::info!("Database path: {:?}", db_path);

    Ok(db_path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_database_initialization() {
        // Use in-memory database for testing
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join("test_focusforge.db");

        // Clean up any existing test database
        let _ = tokio::fs::remove_file(&db_path).await;

        // Create database
        let db = Database::new(db_path.clone()).await.unwrap();

        // Verify integrity
        assert!(db.check_integrity().await.unwrap());

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    #[tokio::test]
    async fn test_database_idempotence() {
        // Test that opening an existing database doesn't cause errors
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join("test_focusforge_idempotent.db");

        // Clean up any existing test database
        let _ = tokio::fs::remove_file(&db_path).await;

        // Create database first time
        let db1 = Database::new(db_path.clone()).await.unwrap();
        db1.close().await;

        // Open existing database second time
        let db2 = Database::new(db_path.clone()).await.unwrap();
        assert!(db2.check_integrity().await.unwrap());

        // Clean up
        db2.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    // ========================================================================
    // Activity Log CRUD Tests
    // ========================================================================

    #[tokio::test]
    async fn test_activity_log_crud() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_activity_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Create
        let mut log = activity_logs::ActivityLog::new("VS Code".to_string(), 1000);
        log.duration = 3600;
        log.category = Some("Productive".to_string());
        
        let id = activity_logs::insert(pool, &log).await.unwrap();
        assert!(id > 0);

        // Read
        let retrieved = activity_logs::get_by_id(pool, id).await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().application, "VS Code");

        // Update
        activity_logs::update_duration(pool, id, 7200).await.unwrap();
        let updated = activity_logs::get_by_id(pool, id).await.unwrap().unwrap();
        assert_eq!(updated.duration, 7200);

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    #[tokio::test]
    async fn test_activity_log_time_range() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_time_range_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Insert logs at different times
        for i in 0..5 {
            let log = activity_logs::ActivityLog::new(format!("App {}", i), 1000 + i * 1000);
            activity_logs::insert(pool, &log).await.unwrap();
        }

        // Query specific range
        let logs = activity_logs::get_by_time_range(pool, 2000, 4000).await.unwrap();
        assert_eq!(logs.len(), 3); // Should get logs at 2000, 3000, 4000

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    // ========================================================================
    // Category CRUD Tests
    // ========================================================================

    #[tokio::test]
    async fn test_category_crud() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_category_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Create
        let cat = categories::ApplicationCategory::new(
            "Chrome".to_string(),
            "Neutral".to_string(),
            false
        );
        categories::upsert(pool, &cat).await.unwrap();

        // Read
        let retrieved = categories::get_by_application(pool, "Chrome").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().category, "Neutral");

        // Update (upsert with same app name)
        let updated_cat = categories::ApplicationCategory::new(
            "Chrome".to_string(),
            "Productive".to_string(),
            true
        );
        categories::upsert(pool, &updated_cat).await.unwrap();

        let retrieved = categories::get_by_application(pool, "Chrome").await.unwrap().unwrap();
        assert_eq!(retrieved.category, "Productive");
        assert_eq!(retrieved.custom, true);

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    // ========================================================================
    // Focus Session CRUD Tests
    // ========================================================================

    #[tokio::test]
    async fn test_session_crud() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_session_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Create
        let session = sessions::FocusSession::new(
            "test-session".to_string(),
            1000,
            vec!["Productive".to_string()]
        );
        sessions::insert(pool, &session).await.unwrap();

        // Read
        let retrieved = sessions::get_by_id(pool, "test-session").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().status, "Active");

        // Update status
        sessions::update_status(pool, "test-session", sessions::SessionStatus::Completed).await.unwrap();
        let updated = sessions::get_by_id(pool, "test-session").await.unwrap().unwrap();
        assert_eq!(updated.status, "Completed");

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    // ========================================================================
    // Distraction Event CRUD Tests
    // ========================================================================

    #[tokio::test]
    async fn test_distraction_crud() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_distraction_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Create session first
        let session = sessions::FocusSession::new(
            "session-1".to_string(),
            1000,
            vec!["Productive".to_string()]
        );
        sessions::insert(pool, &session).await.unwrap();

        // Create distraction
        let event = distractions::DistractionEvent::new(
            "session-1".to_string(),
            2000,
            "YouTube".to_string()
        );
        let id = distractions::insert(pool, &event).await.unwrap();
        assert!(id > 0);

        // Read
        let retrieved = distractions::get_by_id(pool, id).await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().application, "YouTube");

        // Update (mark intentional)
        distractions::mark_intentional(pool, id, true).await.unwrap();
        let updated = distractions::get_by_id(pool, id).await.unwrap().unwrap();
        assert_eq!(updated.marked_intentional, true);

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }

    // ========================================================================
    // Settings CRUD Tests
    // ========================================================================

    #[tokio::test]
    async fn test_settings_crud() {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_settings_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;

        let db = Database::new(db_path.clone()).await.unwrap();
        let pool = db.pool();

        // Create/Set
        settings::set(pool, "test_key", "test_value").await.unwrap();

        // Read
        let value = settings::get(pool, "test_key").await.unwrap();
        assert!(value.is_some());
        assert_eq!(value.unwrap(), "test_value");

        // Update
        settings::set(pool, "test_key", "new_value").await.unwrap();
        let updated = settings::get(pool, "test_key").await.unwrap().unwrap();
        assert_eq!(updated, "new_value");

        // Test typed getters
        settings::set(pool, "bool_key", "true").await.unwrap();
        let bool_val = settings::get_bool(pool, "bool_key", false).await.unwrap();
        assert_eq!(bool_val, true);

        settings::set(pool, "int_key", "42").await.unwrap();
        let int_val = settings::get_i64(pool, "int_key", 0).await.unwrap();
        assert_eq!(int_val, 42);

        // Clean up
        db.close().await;
        let _ = tokio::fs::remove_file(&db_path).await;
    }
}
