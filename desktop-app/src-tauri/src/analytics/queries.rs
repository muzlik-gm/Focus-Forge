// ============================================================================
// Analytics Queries Module
// 
// This module implements the core analytics query functions for time range
// analysis, application/category usage calculations, and rankings.
// 
// Requirements: 8.1, 8.4
// ============================================================================

use anyhow::{Context, Result};
use chrono::Datelike;
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};

// ============================================================================
// Data Transfer Objects
// ============================================================================

/// Time range specification for analytics queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TimeRange {
    Today,
    Yesterday,
    ThisWeek,
    LastWeek,
    ThisMonth,
    LastMonth,
    Last7Days,
    Last30Days,
    Custom { start: i64, end: i64 },
}

impl TimeRange {
    /// Convert time range to start and end timestamps
    pub fn to_timestamps(&self) -> (i64, i64) {
        match self {
            TimeRange::Today => super::time_ranges::today(),
            TimeRange::Yesterday => super::time_ranges::yesterday(),
            TimeRange::ThisWeek => super::time_ranges::this_week(),
            TimeRange::LastWeek => super::time_ranges::last_week(),
            TimeRange::ThisMonth => super::time_ranges::this_month(),
            TimeRange::LastMonth => super::time_ranges::last_month(),
            TimeRange::Last7Days => super::time_ranges::last_n_days(7),
            TimeRange::Last30Days => super::time_ranges::last_n_days(30),
            TimeRange::Custom { start, end } => (*start, *end),
        }
    }
}

/// Application usage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationUsage {
    pub application: String,
    pub total_duration: i64,
    pub category: Option<String>,
    pub percentage: f64,
}

/// Category usage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryUsage {
    pub category: String,
    pub total_duration: i64,
    pub percentage: f64,
    pub application_count: i64,
}

/// Daily statistics summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyStats {
    pub date: String,
    pub total_duration: i64,
    pub productive_duration: i64,
    pub neutral_duration: i64,
    pub distracting_duration: i64,
    pub productivity_score: f64,
    pub top_applications: Vec<ApplicationUsage>,
}

/// Weekly statistics summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeeklyStats {
    pub week_start: String,
    pub week_end: String,
    pub total_duration: i64,
    pub productive_duration: i64,
    pub neutral_duration: i64,
    pub distracting_duration: i64,
    pub productivity_score: f64,
    pub daily_breakdown: Vec<DailyStats>,
    pub top_applications: Vec<ApplicationUsage>,
}

/// Monthly statistics summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonthlyStats {
    pub month: String,
    pub year: i32,
    pub total_duration: i64,
    pub productive_duration: i64,
    pub neutral_duration: i64,
    pub distracting_duration: i64,
    pub productivity_score: f64,
    pub weekly_breakdown: Vec<WeeklyStats>,
    pub top_applications: Vec<ApplicationUsage>,
}

// ============================================================================
// Query Functions
// ============================================================================

/// Get time spent per application in a time range
/// 
/// Returns a list of applications with their total duration, sorted by duration descending.
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
pub async fn get_time_by_application(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<ApplicationUsage>> {
    let rows = sqlx::query(
        "SELECT 
            al.application,
            SUM(al.duration) as total_duration,
            ac.category
         FROM activity_logs al
         LEFT JOIN application_categories ac ON al.application = ac.application
         WHERE al.timestamp >= ? AND al.timestamp <= ?
         GROUP BY al.application
         ORDER BY total_duration DESC"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .context("Failed to query time by application")?;

    // Calculate total time for percentage calculation
    let total_time: i64 = rows.iter().map(|r| r.get::<Option<i64>, _>("total_duration").unwrap_or(0)).sum();

    let results = rows
        .into_iter()
        .map(|r| {
            let duration = r.get::<Option<i64>, _>("total_duration").unwrap_or(0);
            let percentage = if total_time > 0 {
                (duration as f64 / total_time as f64) * 100.0
            } else {
                0.0
            };

            ApplicationUsage {
                application: r.get("application"),
                total_duration: duration,
                category: r.get("category"),
                percentage,
            }
        })
        .collect();

    Ok(results)
}

/// Get time spent per category in a time range
/// 
/// Returns a list of categories with their total duration, sorted by duration descending.
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
pub async fn get_time_by_category(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<CategoryUsage>> {
    let rows = sqlx::query(
        "SELECT 
            COALESCE(ac.category, 'Uncategorized') as cat,
            SUM(al.duration) as total_duration,
            COUNT(DISTINCT al.application) as app_count
         FROM activity_logs al
         LEFT JOIN application_categories ac ON al.application = ac.application
         WHERE al.timestamp >= ? AND al.timestamp <= ?
         GROUP BY cat
         ORDER BY total_duration DESC"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .context("Failed to query time by category")?;

    // Calculate total time for percentage calculation
    let total_time: i64 = rows.iter().map(|r| r.get::<Option<i64>, _>("total_duration").unwrap_or(0)).sum();

    let results = rows
        .into_iter()
        .map(|r| {
            let duration = r.get::<Option<i64>, _>("total_duration").unwrap_or(0);
            let percentage = if total_time > 0 {
                (duration as f64 / total_time as f64) * 100.0
            } else {
                0.0
            };

            CategoryUsage {
                category: r.get("cat"),
                total_duration: duration,
                percentage,
                application_count: r.get::<i32, _>("app_count") as i64,
            }
        })
        .collect();

    Ok(results)
}

/// Get top N applications by usage time
/// 
/// Returns the top N applications ranked by total duration in the specified time range.
/// 
/// # Requirements
/// Validates: Requirement 8.4 (Identify most distracting applications and websites)
pub async fn get_top_applications(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
    limit: i64,
) -> Result<Vec<ApplicationUsage>> {
    let rows = sqlx::query(
        "SELECT 
            al.application,
            SUM(al.duration) as total_duration,
            ac.category
         FROM activity_logs al
         LEFT JOIN application_categories ac ON al.application = ac.application
         WHERE al.timestamp >= ? AND al.timestamp <= ?
         GROUP BY al.application
         ORDER BY total_duration DESC
         LIMIT ?"
    )
    .bind(start_time)
    .bind(end_time)
    .bind(limit)
    .fetch_all(pool)
    .await
    .context("Failed to query top applications")?;

    // Calculate total time for percentage calculation
    let total_time: i64 = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(SUM(duration), 0) FROM activity_logs WHERE timestamp >= ? AND timestamp <= ?"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .context("Failed to calculate total time")?;

    let results = rows
        .into_iter()
        .map(|r| {
            let duration = r.get::<Option<i64>, _>("total_duration").unwrap_or(0);
            let percentage = if total_time > 0 {
                (duration as f64 / total_time as f64) * 100.0
            } else {
                0.0
            };

            ApplicationUsage {
                application: r.get("application"),
                total_duration: duration,
                category: r.get("category"),
                percentage,
            }
        })
        .collect();

    Ok(results)
}

/// Get most distracting applications
/// 
/// Returns applications categorized as "Distracting", ranked by total usage time.
/// 
/// # Requirements
/// Validates: Requirement 8.4 (Identify most distracting applications and websites)
pub async fn get_most_distracting_applications(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
    limit: i64,
) -> Result<Vec<ApplicationUsage>> {
    let rows = sqlx::query(
        "SELECT 
            al.application,
            SUM(al.duration) as total_duration,
            ac.category
         FROM activity_logs al
         INNER JOIN application_categories ac ON al.application = ac.application
         WHERE al.timestamp >= ? AND al.timestamp <= ?
           AND ac.category = 'Distracting'
         GROUP BY al.application
         ORDER BY total_duration DESC
         LIMIT ?"
    )
    .bind(start_time)
    .bind(end_time)
    .bind(limit)
    .fetch_all(pool)
    .await
    .context("Failed to query most distracting applications")?;

    // Calculate total distracting time for percentage calculation
    let total_time: i64 = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(SUM(al.duration), 0) 
         FROM activity_logs al
         INNER JOIN application_categories ac ON al.application = ac.application
         WHERE al.timestamp >= ? AND al.timestamp <= ? AND ac.category = 'Distracting'"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .context("Failed to calculate total distracting time")?;

    let results = rows
        .into_iter()
        .map(|r| {
            let duration = r.get::<Option<i64>, _>("total_duration").unwrap_or(0);
            let percentage = if total_time > 0 {
                (duration as f64 / total_time as f64) * 100.0
            } else {
                0.0
            };

            ApplicationUsage {
                application: r.get("application"),
                total_duration: duration,
                category: r.get("category"),
                percentage,
            }
        })
        .collect();

    Ok(results)
}

/// Get daily statistics for a specific date
/// 
/// Returns comprehensive statistics for a single day including category breakdown
/// and top applications.
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
pub async fn get_daily_stats(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<DailyStats> {
    // Get category breakdown
    let category_stats = get_time_by_category(pool, start_time, end_time).await?;

    let productive_duration = category_stats
        .iter()
        .find(|c| c.category == "Productive")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let neutral_duration = category_stats
        .iter()
        .find(|c| c.category == "Neutral")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let distracting_duration = category_stats
        .iter()
        .find(|c| c.category == "Distracting")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let total_duration = productive_duration + neutral_duration + distracting_duration;

    let productivity_score = if total_duration > 0 {
        (productive_duration as f64 / total_duration as f64) * 100.0
    } else {
        0.0
    };

    // Get top 5 applications
    let top_applications = get_top_applications(pool, start_time, end_time, 5).await?;

    // Format date
    let date = chrono::DateTime::from_timestamp(start_time, 0)
        .unwrap_or_default()
        .format("%Y-%m-%d")
        .to_string();

    Ok(DailyStats {
        date,
        total_duration,
        productive_duration,
        neutral_duration,
        distracting_duration,
        productivity_score,
        top_applications,
    })
}

/// Get weekly statistics
/// 
/// Returns comprehensive statistics for a week including daily breakdown.
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
pub async fn get_weekly_stats(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<WeeklyStats> {
    // Get overall category breakdown
    let category_stats = get_time_by_category(pool, start_time, end_time).await?;

    let productive_duration = category_stats
        .iter()
        .find(|c| c.category == "Productive")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let neutral_duration = category_stats
        .iter()
        .find(|c| c.category == "Neutral")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let distracting_duration = category_stats
        .iter()
        .find(|c| c.category == "Distracting")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let total_duration = productive_duration + neutral_duration + distracting_duration;

    let productivity_score = if total_duration > 0 {
        (productive_duration as f64 / total_duration as f64) * 100.0
    } else {
        0.0
    };

    // Get top 10 applications
    let top_applications = get_top_applications(pool, start_time, end_time, 10).await?;

    // Get daily breakdown
    let mut daily_breakdown = Vec::new();
    let mut current_day = start_time;
    let day_seconds = 86400; // 24 hours in seconds

    while current_day < end_time {
        let day_end = (current_day + day_seconds).min(end_time);
        let daily_stats = get_daily_stats(pool, current_day, day_end).await?;
        daily_breakdown.push(daily_stats);
        current_day += day_seconds;
    }

    // Format dates
    let week_start = chrono::DateTime::from_timestamp(start_time, 0)
        .unwrap_or_default()
        .format("%Y-%m-%d")
        .to_string();
    let week_end = chrono::DateTime::from_timestamp(end_time, 0)
        .unwrap_or_default()
        .format("%Y-%m-%d")
        .to_string();

    Ok(WeeklyStats {
        week_start,
        week_end,
        total_duration,
        productive_duration,
        neutral_duration,
        distracting_duration,
        productivity_score,
        daily_breakdown,
        top_applications,
    })
}

/// Get monthly statistics
/// 
/// Returns comprehensive statistics for a month including weekly breakdown.
/// 
/// # Requirements
/// Validates: Requirement 8.1 (Daily, weekly, and monthly activity reports)
pub async fn get_monthly_stats(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<MonthlyStats> {
    // Get overall category breakdown
    let category_stats = get_time_by_category(pool, start_time, end_time).await?;

    let productive_duration = category_stats
        .iter()
        .find(|c| c.category == "Productive")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let neutral_duration = category_stats
        .iter()
        .find(|c| c.category == "Neutral")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let distracting_duration = category_stats
        .iter()
        .find(|c| c.category == "Distracting")
        .map(|c| c.total_duration)
        .unwrap_or(0);

    let total_duration = productive_duration + neutral_duration + distracting_duration;

    let productivity_score = if total_duration > 0 {
        (productive_duration as f64 / total_duration as f64) * 100.0
    } else {
        0.0
    };

    // Get top 15 applications
    let top_applications = get_top_applications(pool, start_time, end_time, 15).await?;

    // Get weekly breakdown
    let mut weekly_breakdown = Vec::new();
    let mut current_week = start_time;
    let week_seconds = 604800; // 7 days in seconds

    while current_week < end_time {
        let week_end = (current_week + week_seconds).min(end_time);
        let weekly_stats = get_weekly_stats(pool, current_week, week_end).await?;
        weekly_breakdown.push(weekly_stats);
        current_week += week_seconds;
    }

    // Extract month and year
    let date = chrono::DateTime::from_timestamp(start_time, 0).unwrap_or_default();
    let month = date.format("%B").to_string();
    let year = date.year();

    Ok(MonthlyStats {
        month,
        year,
        total_duration,
        productive_duration,
        neutral_duration,
        distracting_duration,
        productivity_score,
        weekly_breakdown,
        top_applications,
    })
}

/// Get total activity time in a time range
/// 
/// Returns the sum of all activity durations in the specified time range.
pub async fn get_total_time(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<i64> {
    let total: i64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(duration), 0) FROM activity_logs WHERE timestamp >= ? AND timestamp <= ?"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .context("Failed to calculate total time")?;

    Ok(total)
}
