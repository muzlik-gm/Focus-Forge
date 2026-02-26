use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};

/// Activity log entry representing application or website usage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityLog {
    pub id: Option<i64>,
    pub timestamp: i64,
    pub application: String,
    pub process_id: Option<i32>,
    pub category: Option<String>,
    pub duration: i64,
    pub url: Option<String>,
    pub page_title: Option<String>,
    pub browser: Option<String>,
    pub executable_path: Option<String>,
}

impl ActivityLog {
    /// Create a new activity log entry
    pub fn new(application: String, timestamp: i64) -> Self {
        Self {
            id: None,
            timestamp,
            application,
            process_id: None,
            category: None,
            duration: 0,
            url: None,
            page_title: None,
            browser: None,
            executable_path: None,
        }
    }
}

/// Insert a new activity log entry
pub async fn insert(pool: &SqlitePool, log: &ActivityLog) -> Result<i64> {
    let result = sqlx::query(
        "INSERT INTO activity_logs (timestamp, application, process_id, category, duration, url, page_title, browser, executable_path)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(log.timestamp)
    .bind(&log.application)
    .bind(log.process_id)
    .bind(&log.category)
    .bind(log.duration)
    .bind(&log.url)
    .bind(&log.page_title)
    .bind(&log.browser)
    .bind(&log.executable_path)
    .execute(pool)
    .await
    .context("Failed to insert activity log")?;

    Ok(result.last_insert_rowid())
}

/// Get activity log by ID
pub async fn get_by_id(pool: &SqlitePool, id: i64) -> Result<Option<ActivityLog>> {
    let row = sqlx::query(
        "SELECT id, timestamp, application, process_id, category, duration, url, page_title, browser, executable_path
         FROM activity_logs WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .context("Failed to fetch activity log")?;

    Ok(row.map(|r| ActivityLog {
        id: Some(r.get("id")),
        timestamp: r.get("timestamp"),
        application: r.get("application"),
        process_id: r.get("process_id"),
        category: r.get("category"),
        duration: r.get("duration"),
        url: r.get("url"),
        page_title: r.get("page_title"),
        browser: r.get("browser"),
        executable_path: r.get("executable_path"),
    }))
}

/// Update activity log duration
pub async fn update_duration(pool: &SqlitePool, id: i64, duration: i64) -> Result<()> {
    sqlx::query("UPDATE activity_logs SET duration = ? WHERE id = ?")
        .bind(duration)
        .bind(id)
        .execute(pool)
        .await
        .context("Failed to update activity log duration")?;

    Ok(())
}

/// Get activity logs within a time range
pub async fn get_by_time_range(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<ActivityLog>> {
    let rows = sqlx::query(
        "SELECT id, timestamp, application, process_id, category, duration, url, page_title, browser, executable_path
         FROM activity_logs WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .context("Failed to fetch activity logs by time range")?;

    Ok(rows
        .into_iter()
        .map(|r| ActivityLog {
            id: Some(r.get("id")),
            timestamp: r.get("timestamp"),
            application: r.get("application"),
            process_id: r.get("process_id"),
            category: r.get("category"),
            duration: r.get("duration"),
            url: r.get("url"),
            page_title: r.get("page_title"),
            browser: r.get("browser"),
            executable_path: r.get("executable_path"),
        })
        .collect())
}

/// Get activity logs by application
pub async fn get_by_application(
    pool: &SqlitePool,
    application: &str,
    limit: i64,
) -> Result<Vec<ActivityLog>> {
    let rows = sqlx::query(
        "SELECT id, timestamp, application, process_id, category, duration, url, page_title, browser, executable_path
         FROM activity_logs WHERE application = ? ORDER BY timestamp DESC LIMIT ?"
    )
    .bind(application)
    .bind(limit)
    .fetch_all(pool)
    .await
    .context("Failed to fetch activity logs by application")?;

    Ok(rows
        .into_iter()
        .map(|r| ActivityLog {
            id: Some(r.get("id")),
            timestamp: r.get("timestamp"),
            application: r.get("application"),
            process_id: r.get("process_id"),
            category: r.get("category"),
            duration: r.get("duration"),
            url: r.get("url"),
            page_title: r.get("page_title"),
            browser: r.get("browser"),
            executable_path: r.get("executable_path"),
        })
        .collect())
}

/// Delete activity logs older than specified timestamp
pub async fn delete_older_than(pool: &SqlitePool, timestamp: i64) -> Result<u64> {
    let result = sqlx::query("DELETE FROM activity_logs WHERE timestamp < ?")
        .bind(timestamp)
        .execute(pool)
        .await
        .context("Failed to delete old activity logs")?;

    Ok(result.rows_affected())
}

/// Get total time spent per application in a time range
pub async fn get_time_by_application(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<(String, i64)>> {
    let rows = sqlx::query(
        "SELECT application, SUM(duration) as total_duration
         FROM activity_logs
         WHERE timestamp >= ? AND timestamp <= ?
         GROUP BY application
         ORDER BY total_duration DESC"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .context("Failed to fetch time by application")?;

    Ok(rows
        .into_iter()
        .map(|r| {
            let app: String = r.get("application");
            let duration: Option<i64> = r.get("total_duration");
            (app, duration.unwrap_or(0))
        })
        .collect())
}

/// Get activity logs since a specific timestamp (for sync operations)
pub async fn get_logs_since(pool: &SqlitePool, timestamp: i64) -> Result<Vec<ActivityLog>> {
    let rows = sqlx::query(
        "SELECT id, timestamp, application, process_id, category, duration, url, page_title, browser, executable_path
         FROM activity_logs WHERE timestamp > ? ORDER BY timestamp ASC"
    )
    .bind(timestamp)
    .fetch_all(pool)
    .await
    .context("Failed to fetch activity logs since timestamp")?;

    Ok(rows
        .into_iter()
        .map(|r| ActivityLog {
            id: Some(r.get("id")),
            timestamp: r.get("timestamp"),
            application: r.get("application"),
            process_id: r.get("process_id"),
            category: r.get("category"),
            duration: r.get("duration"),
            url: r.get("url"),
            page_title: r.get("page_title"),
            browser: r.get("browser"),
            executable_path: r.get("executable_path"),
        })
        .collect())
}

/// Get total count of activity logs
pub async fn count_all(pool: &SqlitePool) -> Result<i64> {
    let row = sqlx::query("SELECT COUNT(*) as count FROM activity_logs")
        .fetch_one(pool)
        .await
        .context("Failed to count activity logs")?;

    Ok(row.get::<i32, _>("count") as i64)
}

/// Get total time spent per category in a time range
pub async fn get_time_by_category(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<(String, i64)>> {
    let rows = sqlx::query(
        "SELECT COALESCE(category, 'Uncategorized') as cat, SUM(duration) as total_duration
         FROM activity_logs
         WHERE timestamp >= ? AND timestamp <= ?
         GROUP BY category
         ORDER BY total_duration DESC"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .context("Failed to fetch time by category")?;

    Ok(rows
        .into_iter()
        .map(|r| {
            let cat: String = r.get("cat");
            let duration: Option<i64> = r.get("total_duration");
            (cat, duration.unwrap_or(0))
        })
        .collect())
}
