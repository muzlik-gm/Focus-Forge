use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};

/// Application setting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
}

impl Setting {
    pub fn new(key: String, value: String) -> Self {
        Self { key, value }
    }
}

/// Get a setting by key
pub async fn get(pool: &SqlitePool, key: &str) -> Result<Option<String>> {
    let row = sqlx::query("SELECT value FROM settings WHERE key = ?")
        .bind(key)
        .fetch_optional(pool)
        .await
        .context("Failed to fetch setting")?;

    Ok(row.map(|r| r.get("value")))
}

/// Set a setting value
pub async fn set(pool: &SqlitePool, key: &str, value: &str) -> Result<()> {
    sqlx::query(
        "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, strftime('%s', 'now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = strftime('%s', 'now')"
    )
    .bind(key)
    .bind(value)
    .execute(pool)
    .await
    .context("Failed to set setting")?;

    Ok(())
}

/// Get all settings
pub async fn get_all(pool: &SqlitePool) -> Result<Vec<Setting>> {
    let rows = sqlx::query("SELECT key, value FROM settings ORDER BY key ASC")
        .fetch_all(pool)
        .await
        .context("Failed to fetch all settings")?;

    Ok(rows
        .into_iter()
        .map(|r| Setting {
            key: r.get("key"),
            value: r.get("value"),
        })
        .collect())
}

/// Delete a setting
pub async fn delete(pool: &SqlitePool, key: &str) -> Result<()> {
    sqlx::query("DELETE FROM settings WHERE key = ?")
        .bind(key)
        .execute(pool)
        .await
        .context("Failed to delete setting")?;

    Ok(())
}

/// Get a boolean setting
pub async fn get_bool(pool: &SqlitePool, key: &str, default: bool) -> Result<bool> {
    match get(pool, key).await? {
        Some(value) => Ok(value.to_lowercase() == "true"),
        None => Ok(default),
    }
}

/// Get an integer setting
pub async fn get_i64(pool: &SqlitePool, key: &str, default: i64) -> Result<i64> {
    match get(pool, key).await? {
        Some(value) => value.parse::<i64>().context("Failed to parse integer setting"),
        None => Ok(default),
    }
}

/// Set a boolean setting
pub async fn set_bool(pool: &SqlitePool, key: &str, value: bool) -> Result<()> {
    set(pool, key, &value.to_string()).await
}

/// Set an integer setting
pub async fn set_i64(pool: &SqlitePool, key: &str, value: i64) -> Result<()> {
    set(pool, key, &value.to_string()).await
}
