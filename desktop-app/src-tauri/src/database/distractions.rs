use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};

/// Distraction event during a focus session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DistractionEvent {
    pub id: Option<i64>,
    pub session_id: String,
    pub timestamp: i64,
    pub application: String,
    pub marked_intentional: bool,
}

impl DistractionEvent {
    /// Create a new distraction event
    pub fn new(session_id: String, timestamp: i64, application: String) -> Self {
        Self {
            id: None,
            session_id,
            timestamp,
            application,
            marked_intentional: false,
        }
    }
}

/// Insert a new distraction event
pub async fn insert(pool: &SqlitePool, event: &DistractionEvent) -> Result<i64> {
    let result = sqlx::query(
        "INSERT INTO distraction_events (session_id, timestamp, application, marked_intentional)
         VALUES (?, ?, ?, ?)"
    )
    .bind(&event.session_id)
    .bind(event.timestamp)
    .bind(&event.application)
    .bind(event.marked_intentional)
    .execute(pool)
    .await
    .context("Failed to insert distraction event")?;

    Ok(result.last_insert_rowid())
}

/// Get distraction event by ID
pub async fn get_by_id(pool: &SqlitePool, id: i64) -> Result<Option<DistractionEvent>> {
    let row = sqlx::query(
        "SELECT id, session_id, timestamp, application, marked_intentional
         FROM distraction_events WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .context("Failed to fetch distraction event")?;

    Ok(row.map(|r| DistractionEvent {
        id: Some(r.get("id")),
        session_id: r.get("session_id"),
        timestamp: r.get("timestamp"),
        application: r.get("application"),
        marked_intentional: r.get("marked_intentional"),
    }))
}

/// Get all distraction events for a session
pub async fn get_by_session(pool: &SqlitePool, session_id: &str) -> Result<Vec<DistractionEvent>> {
    let rows = sqlx::query(
        "SELECT id, session_id, timestamp, application, marked_intentional
         FROM distraction_events WHERE session_id = ? ORDER BY timestamp ASC"
    )
    .bind(session_id)
    .fetch_all(pool)
    .await
    .context("Failed to fetch distraction events by session")?;

    Ok(rows
        .into_iter()
        .map(|r| DistractionEvent {
            id: Some(r.get("id")),
            session_id: r.get("session_id"),
            timestamp: r.get("timestamp"),
            application: r.get("application"),
            marked_intentional: r.get("marked_intentional"),
        })
        .collect())
}

/// Mark distraction as intentional
pub async fn mark_intentional(pool: &SqlitePool, id: i64, intentional: bool) -> Result<()> {
    sqlx::query("UPDATE distraction_events SET marked_intentional = ? WHERE id = ?")
        .bind(intentional)
        .bind(id)
        .execute(pool)
        .await
        .context("Failed to mark distraction as intentional")?;

    Ok(())
}

/// Get count of distractions for a session
pub async fn count_by_session(pool: &SqlitePool, session_id: &str) -> Result<i64> {
    let row = sqlx::query("SELECT COUNT(*) as count FROM distraction_events WHERE session_id = ?")
        .bind(session_id)
        .fetch_one(pool)
        .await
        .context("Failed to count distractions")?;

    Ok(row.get::<i32, _>("count") as i64)
}

/// Get count of unintentional distractions for a session
pub async fn count_unintentional_by_session(pool: &SqlitePool, session_id: &str) -> Result<i64> {
    let row = sqlx::query(
        "SELECT COUNT(*) as count FROM distraction_events WHERE session_id = ? AND marked_intentional = FALSE"
    )
    .bind(session_id)
    .fetch_one(pool)
    .await
    .context("Failed to count unintentional distractions")?;

    Ok(row.get::<i32, _>("count") as i64)
}

/// Delete all distractions for a session
pub async fn delete_by_session(pool: &SqlitePool, session_id: &str) -> Result<u64> {
    let result = sqlx::query("DELETE FROM distraction_events WHERE session_id = ?")
        .bind(session_id)
        .execute(pool)
        .await
        .context("Failed to delete distraction events")?;

    Ok(result.rows_affected())
}

/// Get all distraction events within a time range
pub async fn get_by_time_range(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<DistractionEvent>> {
    let rows = sqlx::query(
        "SELECT id, session_id, timestamp, application, marked_intentional
         FROM distraction_events
         WHERE timestamp >= ? AND timestamp <= ?
         ORDER BY timestamp ASC"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .context("Failed to fetch distraction events by time range")?;

    Ok(rows
        .into_iter()
        .map(|r| DistractionEvent {
            id: Some(r.get("id")),
            session_id: r.get("session_id"),
            timestamp: r.get("timestamp"),
            application: r.get("application"),
            marked_intentional: r.get("marked_intentional"),
        })
        .collect())
}
