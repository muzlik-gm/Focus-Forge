// Integration tests for analytics module
// These tests verify that analytics query functions work correctly with real database

use focusforge_desktop::analytics;
use focusforge_desktop::database::{activity_logs, categories, Database};
use std::path::PathBuf;

#[tokio::test]
async fn test_analytics_time_by_application() {
    // Create temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_analytics_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Insert test data
    let now = chrono::Utc::now().timestamp();
    let mut log1 = activity_logs::ActivityLog::new("VS Code".to_string(), now);
    log1.duration = 3600; // 1 hour
    activity_logs::insert(pool, &log1).await.unwrap();

    let mut log2 = activity_logs::ActivityLog::new("Chrome".to_string(), now + 100);
    log2.duration = 1800; // 30 minutes
    activity_logs::insert(pool, &log2).await.unwrap();

    let mut log3 = activity_logs::ActivityLog::new("VS Code".to_string(), now + 200);
    log3.duration = 1200; // 20 minutes
    activity_logs::insert(pool, &log3).await.unwrap();

    // Query analytics
    let results = analytics::queries::get_time_by_application(pool, now - 100, now + 300)
        .await
        .unwrap();

    // Verify results
    assert_eq!(results.len(), 2);
    assert_eq!(results[0].application, "VS Code");
    assert_eq!(results[0].total_duration, 4800); // 3600 + 1200
    assert_eq!(results[1].application, "Chrome");
    assert_eq!(results[1].total_duration, 1800);

    // Verify percentages
    let total = 4800 + 1800;
    assert!((results[0].percentage - (4800.0 / total as f64 * 100.0)).abs() < 0.01);

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[tokio::test]
async fn test_analytics_time_by_category() {
    // Create temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_analytics_cat_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Set up categories
    let cat1 = categories::ApplicationCategory::new(
        "VS Code".to_string(),
        "Productive".to_string(),
        false,
    );
    categories::upsert(pool, &cat1).await.unwrap();

    let cat2 = categories::ApplicationCategory::new(
        "YouTube".to_string(),
        "Distracting".to_string(),
        false,
    );
    categories::upsert(pool, &cat2).await.unwrap();

    // Insert test data
    let now = chrono::Utc::now().timestamp();
    let mut log1 = activity_logs::ActivityLog::new("VS Code".to_string(), now);
    log1.duration = 3600;
    activity_logs::insert(pool, &log1).await.unwrap();

    let mut log2 = activity_logs::ActivityLog::new("YouTube".to_string(), now + 100);
    log2.duration = 1800;
    activity_logs::insert(pool, &log2).await.unwrap();

    // Query analytics
    let results = analytics::queries::get_time_by_category(pool, now - 100, now + 300)
        .await
        .unwrap();

    // Verify results
    assert!(results.len() >= 2);
    let productive = results.iter().find(|r| r.category == "Productive").unwrap();
    assert_eq!(productive.total_duration, 3600);
    let distracting = results.iter().find(|r| r.category == "Distracting").unwrap();
    assert_eq!(distracting.total_duration, 1800);

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[tokio::test]
async fn test_analytics_top_applications() {
    // Create temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_analytics_top_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Insert test data with different durations
    let now = chrono::Utc::now().timestamp();
    for i in 0..10 {
        let mut log = activity_logs::ActivityLog::new(format!("App {}", i), now + i * 100);
        log.duration = (10 - i) * 100; // Descending durations
        activity_logs::insert(pool, &log).await.unwrap();
    }

    // Query top 5 applications
    let results = analytics::queries::get_top_applications(pool, now - 100, now + 2000, 5)
        .await
        .unwrap();

    // Verify results
    assert_eq!(results.len(), 5);
    assert_eq!(results[0].application, "App 0");
    assert_eq!(results[0].total_duration, 1000);
    assert_eq!(results[4].application, "App 4");
    assert_eq!(results[4].total_duration, 600);

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[tokio::test]
async fn test_analytics_most_distracting() {
    // Create temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_analytics_dist_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Set up categories
    let cat1 = categories::ApplicationCategory::new(
        "YouTube".to_string(),
        "Distracting".to_string(),
        false,
    );
    categories::upsert(pool, &cat1).await.unwrap();

    let cat2 = categories::ApplicationCategory::new(
        "Facebook".to_string(),
        "Distracting".to_string(),
        false,
    );
    categories::upsert(pool, &cat2).await.unwrap();

    let cat3 = categories::ApplicationCategory::new(
        "VS Code".to_string(),
        "Productive".to_string(),
        false,
    );
    categories::upsert(pool, &cat3).await.unwrap();

    // Insert test data
    let now = chrono::Utc::now().timestamp();
    let mut log1 = activity_logs::ActivityLog::new("YouTube".to_string(), now);
    log1.duration = 3600;
    activity_logs::insert(pool, &log1).await.unwrap();

    let mut log2 = activity_logs::ActivityLog::new("Facebook".to_string(), now + 100);
    log2.duration = 1800;
    activity_logs::insert(pool, &log2).await.unwrap();

    let mut log3 = activity_logs::ActivityLog::new("VS Code".to_string(), now + 200);
    log3.duration = 5000; // Should not appear in distracting list
    activity_logs::insert(pool, &log3).await.unwrap();

    // Query most distracting
    let results = analytics::queries::get_most_distracting_applications(pool, now - 100, now + 300, 10)
        .await
        .unwrap();

    // Verify results - should only include distracting apps
    assert_eq!(results.len(), 2);
    assert_eq!(results[0].application, "YouTube");
    assert_eq!(results[0].total_duration, 3600);
    assert_eq!(results[1].application, "Facebook");
    assert_eq!(results[1].total_duration, 1800);

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[tokio::test]
async fn test_analytics_daily_stats() {
    // Create temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_analytics_daily_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Set up categories
    let cat1 = categories::ApplicationCategory::new(
        "VS Code".to_string(),
        "Productive".to_string(),
        false,
    );
    categories::upsert(pool, &cat1).await.unwrap();

    let cat2 = categories::ApplicationCategory::new(
        "YouTube".to_string(),
        "Distracting".to_string(),
        false,
    );
    categories::upsert(pool, &cat2).await.unwrap();

    // Insert test data
    let now = chrono::Utc::now().timestamp();
    let mut log1 = activity_logs::ActivityLog::new("VS Code".to_string(), now);
    log1.duration = 7200; // 2 hours productive
    activity_logs::insert(pool, &log1).await.unwrap();

    let mut log2 = activity_logs::ActivityLog::new("YouTube".to_string(), now + 100);
    log2.duration = 1800; // 30 minutes distracting
    activity_logs::insert(pool, &log2).await.unwrap();

    // Query daily stats
    let stats = analytics::queries::get_daily_stats(pool, now - 100, now + 300)
        .await
        .unwrap();

    // Verify results
    assert_eq!(stats.productive_duration, 7200);
    assert_eq!(stats.distracting_duration, 1800);
    assert_eq!(stats.total_duration, 9000);
    
    // Productivity score should be 80% (7200 / 9000)
    assert!((stats.productivity_score - 80.0).abs() < 0.1);

    // Should have top applications
    assert!(stats.top_applications.len() > 0);

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[test]
fn test_time_range_helpers() {
    // Test that time range functions return valid ranges
    let (start, end) = analytics::time_ranges::today();
    assert!(start <= end);
    assert!(end > 0);

    let (start, end) = analytics::time_ranges::this_week();
    assert!(start <= end);

    let (start, end) = analytics::time_ranges::this_month();
    assert!(start <= end);

    let (start, end) = analytics::time_ranges::last_n_days(7);
    assert!(start <= end);
    
    // Verify that last_n_days(7) spans approximately 7 days
    // The range includes partial current day, so it can be slightly more than 7 days
    let diff = end - start;
    assert!(diff >= 7 * 86400 - 3600); // At least 7 days minus 1 hour tolerance
    assert!(diff <= 8 * 86400); // At most 8 days (includes current partial day)
}
