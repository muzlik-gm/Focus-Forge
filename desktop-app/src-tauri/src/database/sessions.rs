use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};

/// Focus session status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SessionStatus {
    Active,
    Paused,
    Completed,
}

impl SessionStatus {
    pub fn as_str(&self) -> &str {
        match self {
            SessionStatus::Active => "Active",
            SessionStatus::Paused => "Paused",
            SessionStatus::Completed => "Completed",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "Active" => Some(SessionStatus::Active),
            "Paused" => Some(SessionStatus::Paused),
            "Completed" => Some(SessionStatus::Completed),
            _ => None,
        }
    }
}

/// Focus session
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FocusSession {
    pub id: String,
    pub start_time: i64,
    pub end_time: Option<i64>,
    #[serde(
        serialize_with = "serialize_categories",
        deserialize_with = "deserialize_categories"
    )]
    pub productive_categories: String,
    pub goal: Option<String>,
    pub status: String,
}

/// Serialize comma-separated string as array for JSON
fn serialize_categories<S>(categories: &String, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    let vec: Vec<String> = categories
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();
    vec.serialize(serializer)
}

/// Deserialize array from JSON as comma-separated string
fn deserialize_categories<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let vec: Vec<String> = Vec::deserialize(deserializer)?;
    Ok(vec.join(","))
}

impl FocusSession {
    /// Create a new focus session
    pub fn new(id: String, start_time: i64, productive_categories: Vec<String>) -> Self {
        Self {
            id,
            start_time,
            end_time: None,
            productive_categories: productive_categories.join(","),
            goal: None,
            status: SessionStatus::Active.as_str().to_string(),
        }
    }

    /// Get productive categories as a vector
    pub fn get_productive_categories(&self) -> Vec<String> {
        self.productive_categories
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect()
    }
}

/// Insert a new focus session
pub async fn insert(pool: &SqlitePool, session: &FocusSession) -> Result<()> {
    sqlx::query(
        "INSERT INTO focus_sessions (id, start_time, end_time, productive_categories, goal, status)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&session.id)
    .bind(session.start_time)
    .bind(session.end_time)
    .bind(&session.productive_categories)
    .bind(&session.goal)
    .bind(&session.status)
    .execute(pool)
    .await
    .context("Failed to insert focus session")?;

    Ok(())
}

/// Get focus session by ID
pub async fn get_by_id(pool: &SqlitePool, id: &str) -> Result<Option<FocusSession>> {
    let row = sqlx::query(
        "SELECT id, start_time, end_time, productive_categories, goal, status
         FROM focus_sessions WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .context("Failed to fetch focus session")?;

    Ok(row.map(|r| FocusSession {
        id: r.get("id"),
        start_time: r.get("start_time"),
        end_time: r.get("end_time"),
        productive_categories: r.get("productive_categories"),
        goal: r.get("goal"),
        status: r.get("status"),
    }))
}

/// Update session status
pub async fn update_status(pool: &SqlitePool, id: &str, status: SessionStatus) -> Result<()> {
    let status_str = status.as_str();
    sqlx::query(
        "UPDATE focus_sessions SET status = ?, updated_at = strftime('%s', 'now') WHERE id = ?"
    )
    .bind(status_str)
    .bind(id)
    .execute(pool)
    .await
    .context("Failed to update session status")?;

    Ok(())
}

/// Update session end time
pub async fn update_end_time(pool: &SqlitePool, id: &str, end_time: i64) -> Result<()> {
    sqlx::query(
        "UPDATE focus_sessions SET end_time = ?, updated_at = strftime('%s', 'now') WHERE id = ?"
    )
    .bind(end_time)
    .bind(id)
    .execute(pool)
    .await
    .context("Failed to update session end time")?;

    Ok(())
}

/// Get all sessions within a time range
pub async fn get_by_time_range(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<FocusSession>> {
    let rows = sqlx::query(
        "SELECT id, start_time, end_time, productive_categories, goal, status
         FROM focus_sessions
         WHERE start_time >= ? AND start_time <= ?
         ORDER BY start_time DESC"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .context("Failed to fetch sessions by time range")?;

    Ok(rows
        .into_iter()
        .map(|r| FocusSession {
            id: r.get("id"),
            start_time: r.get("start_time"),
            end_time: r.get("end_time"),
            productive_categories: r.get("productive_categories"),
            goal: r.get("goal"),
            status: r.get("status"),
        })
        .collect())
}

/// Get active session
pub async fn get_active(pool: &SqlitePool) -> Result<Option<FocusSession>> {
    let row = sqlx::query(
        "SELECT id, start_time, end_time, productive_categories, goal, status
         FROM focus_sessions
         WHERE status = 'Active'
         ORDER BY start_time DESC
         LIMIT 1"
    )
    .fetch_optional(pool)
    .await
    .context("Failed to fetch active session")?;

    Ok(row.map(|r| FocusSession {
        id: r.get("id"),
        start_time: r.get("start_time"),
        end_time: r.get("end_time"),
        productive_categories: r.get("productive_categories"),
        goal: r.get("goal"),
        status: r.get("status"),
    }))
}

/// Delete a session
pub async fn delete(pool: &SqlitePool, id: &str) -> Result<()> {
    sqlx::query("DELETE FROM focus_sessions WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .context("Failed to delete session")?;

    Ok(())
}

/// Get all sessions with a specific status
pub async fn get_by_status(pool: &SqlitePool, status: SessionStatus) -> Result<Vec<FocusSession>> {
    let status_str = status.as_str();
    let rows = sqlx::query(
        "SELECT id, start_time, end_time, productive_categories, goal, status
         FROM focus_sessions
         WHERE status = ?
         ORDER BY start_time DESC"
    )
    .bind(status_str)
    .fetch_all(pool)
    .await
    .context("Failed to fetch sessions by status")?;

    Ok(rows
        .into_iter()
        .map(|r| FocusSession {
            id: r.get("id"),
            start_time: r.get("start_time"),
            end_time: r.get("end_time"),
            productive_categories: r.get("productive_categories"),
            goal: r.get("goal"),
            status: r.get("status"),
        })
        .collect())
}

/// Get count of sessions by status
pub async fn count_by_status(pool: &SqlitePool, status: SessionStatus) -> Result<i64> {
    let status_str = status.as_str();
    let row = sqlx::query("SELECT COUNT(*) as count FROM focus_sessions WHERE status = ?")
        .bind(status_str)
        .fetch_one(pool)
        .await
        .context("Failed to count sessions by status")?;

    Ok(row.get::<i32, _>("count") as i64)
}
