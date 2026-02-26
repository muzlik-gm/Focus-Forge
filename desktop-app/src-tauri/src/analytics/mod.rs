// ============================================================================
// Analytics Module
// 
// This module provides analytics query functions for activity data analysis.
// It implements time range queries, application/category time calculations,
// and usage rankings.
// 
// Requirements: 8.1, 8.4
// ============================================================================

use sqlx::SqlitePool;

pub mod queries;
pub mod session_analytics;

// Re-export commonly used types
pub use queries::{
    ApplicationUsage, CategoryUsage, DailyStats, WeeklyStats, MonthlyStats,
};
pub use session_analytics::{
    SessionSuccessRate, DistractionPattern, SessionTrendPoint, SessionAnalytics,
};

/// Analytics service that provides data analysis functions
pub struct AnalyticsService {
    pool: SqlitePool,
}

impl AnalyticsService {
    /// Create a new analytics service
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    /// Get reference to the database pool
    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }
}

/// Time range helper functions
pub mod time_ranges {
    use chrono::{Datelike, Duration, TimeZone, Utc};

    /// Get start and end timestamps for today (UTC)
    pub fn today() -> (i64, i64) {
        let now = Utc::now();
        let start = now
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_utc()
            .timestamp();
        let end = now.timestamp();
        (start, end)
    }

    /// Get start and end timestamps for yesterday (UTC)
    pub fn yesterday() -> (i64, i64) {
        let now = Utc::now();
        let yesterday = now - Duration::days(1);
        let start = yesterday
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_utc()
            .timestamp();
        let end = yesterday
            .date_naive()
            .and_hms_opt(23, 59, 59)
            .unwrap()
            .and_utc()
            .timestamp();
        (start, end)
    }

    /// Get start and end timestamps for this week (Monday to Sunday, UTC)
    pub fn this_week() -> (i64, i64) {
        let now = Utc::now();
        let weekday = now.weekday().num_days_from_monday();
        let start_of_week = now - Duration::days(weekday as i64);
        let start = start_of_week
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_utc()
            .timestamp();
        let end = now.timestamp();
        (start, end)
    }

    /// Get start and end timestamps for last week (Monday to Sunday, UTC)
    pub fn last_week() -> (i64, i64) {
        let now = Utc::now();
        let weekday = now.weekday().num_days_from_monday();
        let start_of_this_week = now - Duration::days(weekday as i64);
        let start_of_last_week = start_of_this_week - Duration::days(7);
        let start = start_of_last_week
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_utc()
            .timestamp();
        let end = start_of_this_week
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_utc()
            .timestamp()
            - 1;
        (start, end)
    }

    /// Get start and end timestamps for this month (UTC)
    pub fn this_month() -> (i64, i64) {
        let now = Utc::now();
        let start = Utc
            .with_ymd_and_hms(now.year(), now.month(), 1, 0, 0, 0)
            .unwrap()
            .timestamp();
        let end = now.timestamp();
        (start, end)
    }

    /// Get start and end timestamps for last month (UTC)
    pub fn last_month() -> (i64, i64) {
        let now = Utc::now();
        let (year, month) = if now.month() == 1 {
            (now.year() - 1, 12)
        } else {
            (now.year(), now.month() - 1)
        };
        let start = Utc
            .with_ymd_and_hms(year, month, 1, 0, 0, 0)
            .unwrap()
            .timestamp();
        let end = Utc
            .with_ymd_and_hms(now.year(), now.month(), 1, 0, 0, 0)
            .unwrap()
            .timestamp()
            - 1;
        (start, end)
    }

    /// Get start and end timestamps for last N days (UTC)
    pub fn last_n_days(n: i64) -> (i64, i64) {
        let now = Utc::now();
        let start = (now - Duration::days(n))
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_utc()
            .timestamp();
        let end = now.timestamp();
        (start, end)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_time_ranges() {
        // Test that time range functions return valid ranges
        let (start, end) = time_ranges::today();
        assert!(start <= end);
        assert!(end > 0);

        let (start, end) = time_ranges::this_week();
        assert!(start <= end);

        let (start, end) = time_ranges::this_month();
        assert!(start <= end);

        let (start, end) = time_ranges::last_n_days(7);
        assert!(start <= end);
    }
}
