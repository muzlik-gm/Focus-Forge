// Test for default categories functionality (Task 6.1)
// This test verifies that default categories are properly initialized
// and that category lookup with fallback works correctly

use focusforge_desktop::database::{Database, categories};
use std::path::PathBuf;

#[tokio::test]
async fn test_default_categories_initialization() {
    // Create a temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_defaults_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    // Initialize database (should auto-initialize default categories)
    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Verify that default categories were created
    let all_categories = categories::get_all(pool).await.unwrap();
    assert!(all_categories.len() > 0, "Default categories should be initialized");

    // Test some specific default categories
    let vscode_cat = categories::get_by_application(pool, "Visual Studio Code").await.unwrap();
    assert!(vscode_cat.is_some());
    assert_eq!(vscode_cat.unwrap().category, "Productive");

    let chrome_cat = categories::get_by_application(pool, "Chrome").await.unwrap();
    assert!(chrome_cat.is_some());
    assert_eq!(chrome_cat.unwrap().category, "Neutral");

    let youtube_cat = categories::get_by_application(pool, "YouTube").await.unwrap();
    assert!(youtube_cat.is_some());
    assert_eq!(youtube_cat.unwrap().category, "Distracting");

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[tokio::test]
async fn test_category_lookup_with_fallback() {
    // Create a temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_fallback_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Test fallback for unknown application
    let unknown_cat = categories::get_category_with_fallback(pool, "UnknownApp123").await.unwrap();
    assert_eq!(unknown_cat, "Neutral", "Unknown apps should default to Neutral");

    // Test known application
    let vscode_cat = categories::get_category_with_fallback(pool, "Visual Studio Code").await.unwrap();
    assert_eq!(vscode_cat, "Productive");

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[tokio::test]
async fn test_comprehensive_default_categories() {
    // Create a temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_comprehensive_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Test various categories of applications
    let test_cases = vec![
        // IDEs - Productive
        ("IntelliJ IDEA", "Productive"),
        ("PyCharm", "Productive"),
        ("Xcode", "Productive"),
        
        // Development Tools - Productive
        ("Terminal", "Productive"),
        ("Docker", "Productive"),
        ("Postman", "Productive"),
        
        // Design Tools - Productive
        ("Figma", "Productive"),
        ("Adobe Photoshop", "Productive"),
        
        // Office - Productive
        ("Microsoft Word", "Productive"),
        ("Notion", "Productive"),
        
        // Communication - Neutral
        ("Slack", "Neutral"),
        ("Zoom", "Neutral"),
        
        // Browsers - Neutral
        ("Firefox", "Neutral"),
        ("Safari", "Neutral"),
        
        // Social Media - Distracting
        ("Facebook", "Distracting"),
        ("Twitter", "Distracting"),
        ("Instagram", "Distracting"),
        
        // Entertainment - Distracting
        ("Netflix", "Distracting"),
        ("Spotify", "Distracting"),
        
        // Gaming - Distracting
        ("Steam", "Distracting"),
        ("Minecraft", "Distracting"),
    ];

    for (app, expected_category) in test_cases {
        let cat = categories::get_category_with_fallback(pool, app).await.unwrap();
        assert_eq!(
            cat, expected_category,
            "Application '{}' should be categorized as '{}'",
            app, expected_category
        );
    }

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}

#[tokio::test]
async fn test_default_categories_not_custom() {
    // Create a temporary database
    let temp_dir = std::env::temp_dir();
    let db_path = temp_dir.join(format!("test_not_custom_{}.db", uuid::Uuid::new_v4()));
    let _ = tokio::fs::remove_file(&db_path).await;

    let db = Database::new(db_path.clone()).await.unwrap();
    let pool = db.pool();

    // Verify that default categories are marked as not custom
    let vscode_cat = categories::get_by_application(pool, "Visual Studio Code").await.unwrap().unwrap();
    assert_eq!(vscode_cat.custom, false, "Default categories should not be marked as custom");

    // Clean up
    db.close().await;
    let _ = tokio::fs::remove_file(&db_path).await;
}
