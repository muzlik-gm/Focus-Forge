// ============================================================================
// Focus Session Analytics Module
// 
// This module provides analytics for focus sessions including success rates,
// distraction patterns, and session trends.
// 
// Requirements: 8.5
// ============================================================================

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::{SqlitePool, Row};

// ============================================================================
// Data Transfer Objects
// ============================================================================

/// Session success rate statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionSuccessRate {
    pub total_sessions: i64,
    pub successful_sessions: i64,
    pub success_rate: f64,
    pub average_distractions: f64,
}

/// Distraction pattern statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DistractionPattern {
    pub application: String,
    pub distraction_count: i64,
    pub total_duration: i64,
    pub average_duration: f64,
    pub sessions_affected: i64,
}

/// Session trend data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionTrendPoint {
    pub date: String,
    pub session_count: i64,
    pub success_rate: f64,
    pub average_focus_time: f64,
    pub average_distractions: f64,
    pub productivity_score: f64,
}

/// Comprehensive session analytics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionAnalytics {
    pub success_rate: SessionSuccessRate,
    pub distraction_patterns: Vec<DistractionPattern>,
    pub trend_data: Vec<SessionTrendPoint>,
}

// ============================================================================
// Query Functions
// ============================================================================

/// Calculate session success rate
/// 
/// A session is considered successful if it has zero unintentional distractions.
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `start_time` - Start of time range (milliseconds)
/// * `end_time` - End of time range (milliseconds)
/// 
/// # Returns
/// * `Result<SessionSuccessRate>` - Success rate statistics
/// 
/// # Requirements
/// Validates: Requirement 8.5 (Focus session success rates and trends)
pub async fn calculate_success_rate(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<SessionSuccessRate> {
    // Get total number of completed sessions in time range
    let total_sessions: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM focus_sessions 
         WHERE start_time >= ? AND start_time <= ? 
         AND status = 'Completed'"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .context("Failed to count total sessions")?;

    // Get number of successful sessions (zero unintentional distractions)
    let successful_sessions: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM focus_sessions fs
         WHERE fs.start_time >= ? AND fs.start_time <= ?
         AND fs.status = 'Completed'
         AND NOT EXISTS (
             SELECT 1 FROM distraction_events de
             WHERE de.session_id = fs.id
             AND de.marked_intentional = 0
         )"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .context("Failed to count successful sessions")?;

    // Calculate success rate
    let success_rate = if total_sessions > 0 {
        (successful_sessions as f64 / total_sessions as f64) * 100.0
    } else {
        0.0
    };

    // Calculate average distractions per session
    let total_distractions: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM distraction_events de
         INNER JOIN focus_sessions fs ON de.session_id = fs.id
         WHERE fs.start_time >= ? AND fs.start_time <= ?
         AND fs.status = 'Completed'
         AND de.marked_intentional = 0"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_one(pool)
    .await
    .context("Failed to count total distractions")?;

    let average_distractions = if total_sessions > 0 {
        total_distractions as f64 / total_sessions as f64
    } else {
        0.0
    };

    Ok(SessionSuccessRate {
        total_sessions,
        successful_sessions,
        success_rate,
        average_distractions,
    })
}

/// Track distraction patterns
/// 
/// Analyzes which applications cause the most distractions during focus sessions.
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `start_time` - Start of time range (milliseconds)
/// * `end_time` - End of time range (milliseconds)
/// * `limit` - Maximum number of patterns to return
/// 
/// # Returns
/// * `Result<Vec<DistractionPattern>>` - List of distraction patterns sorted by count
/// 
/// # Requirements
/// Validates: Requirement 8.5 (Focus session success rates and trends)
pub async fn track_distraction_patterns(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
    limit: i64,
) -> Result<Vec<DistractionPattern>> {
    let rows = sqlx::query(
        "SELECT 
            de.application,
            COUNT(*) as distraction_count,
            COUNT(DISTINCT de.session_id) as sessions_affected,
            COALESCE(SUM(al.duration), 0) as total_duration_ms
         FROM distraction_events de
         INNER JOIN focus_sessions fs ON de.session_id = fs.id
         LEFT JOIN activity_logs al ON 
             al.application = de.application 
             AND al.timestamp >= fs.start_time 
             AND al.timestamp <= COALESCE(fs.end_time, ?)
         WHERE fs.start_time >= ? AND fs.start_time <= ?
         AND fs.status = 'Completed'
         AND de.marked_intentional = 0
         GROUP BY de.application
         ORDER BY distraction_count DESC
         LIMIT ?"
    )
    .bind(end_time)
    .bind(start_time)
    .bind(end_time)
    .bind(limit)
    .fetch_all(pool)
    .await
    .context("Failed to query distraction patterns")?;

    let patterns = rows
        .into_iter()
        .map(|row| {
            let distraction_count: i64 = row.get("distraction_count");
            let total_duration_ms: i64 = row.get("total_duration_ms");
            let total_duration = total_duration_ms / 1000; // Convert to seconds
            
            let average_duration = if distraction_count > 0 {
                total_duration as f64 / distraction_count as f64
            } else {
                0.0
            };

            DistractionPattern {
                application: row.get("application"),
                distraction_count,
                total_duration,
                average_duration,
                sessions_affected: row.get("sessions_affected"),
            }
        })
        .collect();

    Ok(patterns)
}

/// Generate session trend data
/// 
/// Creates daily trend data showing how session performance changes over time.
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `start_time` - Start of time range (milliseconds)
/// * `end_time` - End of time range (milliseconds)
/// 
/// # Returns
/// * `Result<Vec<SessionTrendPoint>>` - List of daily trend points
/// 
/// # Requirements
/// Validates: Requirement 8.5 (Focus session success rates and trends)
pub async fn generate_session_trends(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<Vec<SessionTrendPoint>> {
    use chrono::{DateTime, Utc, Datelike};
    
    let mut trends = Vec::new();
    let day_ms = 86400000; // 24 hours in milliseconds
    
    let mut current_day = start_time;
    
    while current_day < end_time {
        let day_end = (current_day + day_ms).min(end_time);
        
        // Get session count for this day
        let session_count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM focus_sessions 
             WHERE start_time >= ? AND start_time < ? 
             AND status = 'Completed'"
        )
        .bind(current_day)
        .bind(day_end)
        .fetch_one(pool)
        .await
        .context("Failed to count sessions for day")?;
        
        if session_count > 0 {
            // Calculate success rate for this day
            let success_rate_data = calculate_success_rate(pool, current_day, day_end).await?;
            
            // Calculate average focus time
            let total_focus_time: i64 = sqlx::query_scalar(
                "SELECT COALESCE(SUM((COALESCE(end_time, ?) - start_time) / 1000), 0)
                 FROM focus_sessions
                 WHERE start_time >= ? AND start_time < ?
                 AND status = 'Completed'"
            )
            .bind(day_end)
            .bind(current_day)
            .bind(day_end)
            .fetch_one(pool)
            .await
            .context("Failed to calculate total focus time")?;
            
            let average_focus_time = if session_count > 0 {
                total_focus_time as f64 / session_count as f64
            } else {
                0.0
            };
            
            // Calculate productivity score for the day
            let productivity_score = calculate_daily_productivity_score(
                pool,
                current_day,
                day_end
            ).await?;
            
            // Format date
            let date = DateTime::from_timestamp(current_day / 1000, 0)
                .unwrap_or_default()
                .format("%Y-%m-%d")
                .to_string();
            
            trends.push(SessionTrendPoint {
                date,
                session_count,
                success_rate: success_rate_data.success_rate,
                average_focus_time,
                average_distractions: success_rate_data.average_distractions,
                productivity_score,
            });
        }
        
        current_day = day_end;
    }
    
    Ok(trends)
}

/// Calculate productivity score for a day
/// 
/// Helper function to calculate the average productivity score across all sessions in a day.
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `start_time` - Start of day (milliseconds)
/// * `end_time` - End of day (milliseconds)
/// 
/// # Returns
/// * `Result<f64>` - Average productivity score (0-100)
async fn calculate_daily_productivity_score(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<f64> {
    // Get all sessions for the day
    let sessions: Vec<(String, i64, Option<i64>, String)> = sqlx::query_as(
        "SELECT id, start_time, end_time, productive_categories 
         FROM focus_sessions 
         WHERE start_time >= ? AND start_time < ? 
         AND status = 'Completed'"
    )
    .bind(start_time)
    .bind(end_time)
    .fetch_all(pool)
    .await
    .context("Failed to fetch sessions for productivity calculation")?;
    
    if sessions.is_empty() {
        return Ok(0.0);
    }
    
    let session_count = sessions.len();
    let mut total_score = 0.0;
    
    for (_session_id, session_start, session_end, productive_categories_str) in &sessions {
        let session_end_time = session_end.unwrap_or(end_time);
        let total_duration = (session_end_time - session_start) / 1000; // Convert to seconds
        
        if total_duration <= 0 {
            continue;
        }
        
        // Parse productive categories
        let productive_categories: Vec<String> = productive_categories_str
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();
        
        // Calculate focus time for this session
        let activity_times: Vec<(String, i64, Option<String>)> = sqlx::query_as(
            "SELECT al.application, al.duration, ac.category
             FROM activity_logs al
             LEFT JOIN application_categories ac ON al.application = ac.application
             WHERE al.timestamp >= ? AND al.timestamp <= ?"
        )
        .bind(*session_start)
        .bind(session_end_time)
        .fetch_all(pool)
        .await
        .context("Failed to fetch activity logs for session")?;
        
        let mut focus_time = 0i64;
        let mut distraction_time = 0i64;
        
        for (_, duration_ms, category_opt) in activity_times {
            let duration = duration_ms / 1000; // Convert to seconds
            let category = category_opt.unwrap_or_else(|| "Neutral".to_string());
            
            if productive_categories.contains(&category) {
                focus_time += duration;
            } else {
                distraction_time += duration;
            }
        }
        
        // Calculate productivity score for this session
        let session_score = if total_duration > 0 {
            (focus_time as f64 / total_duration as f64) * 100.0
        } else {
            0.0
        };
        
        total_score += session_score;
    }
    
    // Return average score
    Ok(total_score / session_count as f64)
}

/// Get comprehensive session analytics
/// 
/// Combines success rate, distraction patterns, and trend data into a single report.
/// 
/// # Arguments
/// * `pool` - Database connection pool
/// * `start_time` - Start of time range (milliseconds)
/// * `end_time` - End of time range (milliseconds)
/// 
/// # Returns
/// * `Result<SessionAnalytics>` - Comprehensive analytics report
/// 
/// # Requirements
/// Validates: Requirement 8.5 (Focus session success rates and trends)
pub async fn get_session_analytics(
    pool: &SqlitePool,
    start_time: i64,
    end_time: i64,
) -> Result<SessionAnalytics> {
    let success_rate = calculate_success_rate(pool, start_time, end_time).await?;
    let distraction_patterns = track_distraction_patterns(pool, start_time, end_time, 10).await?;
    let trend_data = generate_session_trends(pool, start_time, end_time).await?;
    
    Ok(SessionAnalytics {
        success_rate,
        distraction_patterns,
        trend_data,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::Database;
    use crate::database::sessions::{self, FocusSession, SessionStatus};
    use crate::database::distractions::{self, DistractionEvent};
    use crate::database::activity_logs::{self, ActivityLog};
    use crate::database::categories::{self, ApplicationCategory};
    use std::sync::Arc;
    use chrono::Utc;
    
    async fn create_test_database() -> Arc<Database> {
        let temp_dir = std::env::temp_dir();
        let db_path = temp_dir.join(format!("test_session_analytics_{}.db", uuid::Uuid::new_v4()));
        let _ = tokio::fs::remove_file(&db_path).await;
        
        let db = Database::new(db_path).await.unwrap();
        
        // Initialize default categories
        categories::insert_defaults(db.pool()).await.unwrap();
        
        Arc::new(db)
    }
    
    #[tokio::test]
    async fn test_calculate_success_rate() {
        let db = create_test_database().await;
        let pool = db.pool();
        
        let now = Utc::now().timestamp_millis();
        let hour_ago = now - 3600000;
        
        // Create 3 completed sessions
        for i in 0..3 {
            let session_id = format!("session_{}", i);
            let mut session = FocusSession::new(
                session_id.clone(),
                hour_ago + (i * 600000),
                vec!["Productive".to_string()]
            );
            session.end_time = Some(hour_ago + (i * 600000) + 300000);
            session.status = SessionStatus::Completed.as_str().to_string();
            sessions::insert(pool, &session).await.unwrap();
            
            // Add distractions to first two sessions only
            if i < 2 {
                let distraction = DistractionEvent::new(
                    session_id.clone(),
                    hour_ago + (i * 600000) + 100000,
                    "Spotify".to_string()
                );
                distractions::insert(pool, &distraction).await.unwrap();
            }
        }
        
        // Calculate success rate
        let result = calculate_success_rate(pool, hour_ago, now).await.unwrap();
        
        assert_eq!(result.total_sessions, 3);
        assert_eq!(result.successful_sessions, 1); // Only the third session has no distractions
        assert!((result.success_rate - 33.33).abs() < 0.1);
        assert!((result.average_distractions - 0.67).abs() < 0.1);
    }
    
    #[tokio::test]
    async fn test_track_distraction_patterns() {
        let db = create_test_database().await;
        let pool = db.pool();
        
        let now = Utc::now().timestamp_millis();
        let hour_ago = now - 3600000;
        
        // Create a session
        let session_id = "test_session".to_string();
        let mut session = FocusSession::new(
            session_id.clone(),
            hour_ago,
            vec!["Productive".to_string()]
        );
        session.end_time = Some(now);
        session.status = SessionStatus::Completed.as_str().to_string();
        sessions::insert(pool, &session).await.unwrap();
        
        // Add multiple distractions
        for i in 0..3 {
            let distraction = DistractionEvent::new(
                session_id.clone(),
                hour_ago + (i * 300000),
                "Spotify".to_string()
            );
            distractions::insert(pool, &distraction).await.unwrap();
        }
        
        for i in 0..2 {
            let distraction = DistractionEvent::new(
                session_id.clone(),
                hour_ago + (i * 400000),
                "Twitter".to_string()
            );
            distractions::insert(pool, &distraction).await.unwrap();
        }
        
        // Track patterns
        let patterns = track_distraction_patterns(pool, hour_ago, now, 10).await.unwrap();
        
        assert_eq!(patterns.len(), 2);
        assert_eq!(patterns[0].application, "Spotify");
        assert_eq!(patterns[0].distraction_count, 3);
        assert_eq!(patterns[1].application, "Twitter");
        assert_eq!(patterns[1].distraction_count, 2);
    }
}
