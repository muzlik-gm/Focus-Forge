use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};

/// Application category mapping
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationCategory {
    pub application: String,
    pub category: String,
    pub custom: bool,
}

impl ApplicationCategory {
    /// Create a new application category
    pub fn new(application: String, category: String, custom: bool) -> Self {
        Self {
            application,
            category,
            custom,
        }
    }
}

/// Insert or update an application category
pub async fn upsert(pool: &SqlitePool, category: &ApplicationCategory) -> Result<()> {
    sqlx::query(
        "INSERT INTO application_categories (application, category, custom, updated_at)
         VALUES (?, ?, ?, strftime('%s', 'now'))
         ON CONFLICT(application) DO UPDATE SET
            category = excluded.category,
            custom = excluded.custom,
            updated_at = strftime('%s', 'now')"
    )
    .bind(&category.application)
    .bind(&category.category)
    .bind(category.custom)
    .execute(pool)
    .await
    .context("Failed to upsert application category")?;

    Ok(())
}

/// Get category for an application
pub async fn get_by_application(
    pool: &SqlitePool,
    application: &str,
) -> Result<Option<ApplicationCategory>> {
    let row = sqlx::query(
        "SELECT application, category, custom FROM application_categories WHERE application = ?"
    )
    .bind(application)
    .fetch_optional(pool)
    .await
    .context("Failed to fetch application category")?;

    Ok(row.map(|r| ApplicationCategory {
        application: r.get("application"),
        category: r.get("category"),
        custom: r.get("custom"),
    }))
}

/// Get all application categories
pub async fn get_all(pool: &SqlitePool) -> Result<Vec<ApplicationCategory>> {
    let rows = sqlx::query(
        "SELECT application, category, custom FROM application_categories ORDER BY application ASC"
    )
    .fetch_all(pool)
    .await
    .context("Failed to fetch all application categories")?;

    Ok(rows
        .into_iter()
        .map(|r| ApplicationCategory {
            application: r.get("application"),
            category: r.get("category"),
            custom: r.get("custom"),
        })
        .collect())
}

/// Get all custom categories
pub async fn get_custom(pool: &SqlitePool) -> Result<Vec<ApplicationCategory>> {
    let rows = sqlx::query(
        "SELECT application, category, custom FROM application_categories WHERE custom = TRUE ORDER BY application ASC"
    )
    .fetch_all(pool)
    .await
    .context("Failed to fetch custom application categories")?;

    Ok(rows
        .into_iter()
        .map(|r| ApplicationCategory {
            application: r.get("application"),
            category: r.get("category"),
            custom: r.get("custom"),
        })
        .collect())
}

/// Delete an application category
pub async fn delete(pool: &SqlitePool, application: &str) -> Result<()> {
    sqlx::query("DELETE FROM application_categories WHERE application = ?")
        .bind(application)
        .execute(pool)
        .await
        .context("Failed to delete application category")?;

    Ok(())
}

/// Get category for an application with fallback to Neutral
pub async fn get_category_with_fallback(
    pool: &SqlitePool,
    application: &str,
) -> Result<String> {
    match get_by_application(pool, application).await? {
        Some(cat) => Ok(cat.category),
        None => Ok("Neutral".to_string()),
    }
}

/// Bulk insert default categories
pub async fn insert_defaults(pool: &SqlitePool) -> Result<()> {
    let defaults = get_default_categories();

    for (app, cat) in defaults {
        let category = ApplicationCategory::new(app.to_string(), cat.to_string(), false);
        upsert(pool, &category).await?;
    }

    Ok(())
}

/// Get comprehensive default category mappings
fn get_default_categories() -> Vec<(&'static str, &'static str)> {
    vec![
        // IDEs and Code Editors - Productive
        ("Visual Studio Code", "Productive"),
        ("VSCode", "Productive"),
        ("Code", "Productive"),
        ("IntelliJ IDEA", "Productive"),
        ("PyCharm", "Productive"),
        ("WebStorm", "Productive"),
        ("Android Studio", "Productive"),
        ("Xcode", "Productive"),
        ("Visual Studio", "Productive"),
        ("Sublime Text", "Productive"),
        ("Atom", "Productive"),
        ("Vim", "Productive"),
        ("Emacs", "Productive"),
        ("Neovim", "Productive"),
        ("Eclipse", "Productive"),
        ("NetBeans", "Productive"),
        ("Rider", "Productive"),
        ("CLion", "Productive"),
        ("GoLand", "Productive"),
        ("RubyMine", "Productive"),
        ("PhpStorm", "Productive"),
        ("DataGrip", "Productive"),
        
        // Development Tools - Productive
        ("Terminal", "Productive"),
        ("iTerm", "Productive"),
        ("iTerm2", "Productive"),
        ("Windows Terminal", "Productive"),
        ("PowerShell", "Productive"),
        ("Command Prompt", "Productive"),
        ("Git", "Productive"),
        ("GitHub Desktop", "Productive"),
        ("GitKraken", "Productive"),
        ("Sourcetree", "Productive"),
        ("Docker", "Productive"),
        ("Docker Desktop", "Productive"),
        ("Postman", "Productive"),
        ("Insomnia", "Productive"),
        ("DBeaver", "Productive"),
        ("TablePlus", "Productive"),
        ("pgAdmin", "Productive"),
        ("MySQL Workbench", "Productive"),
        ("MongoDB Compass", "Productive"),
        ("Redis Desktop Manager", "Productive"),
        
        // Design and Creative Tools - Productive
        ("Figma", "Productive"),
        ("Sketch", "Productive"),
        ("Adobe Photoshop", "Productive"),
        ("Adobe Illustrator", "Productive"),
        ("Adobe XD", "Productive"),
        ("Affinity Designer", "Productive"),
        ("Affinity Photo", "Productive"),
        ("GIMP", "Productive"),
        ("Inkscape", "Productive"),
        ("Blender", "Productive"),
        ("Canva", "Productive"),
        
        // Productivity and Office - Productive
        ("Microsoft Word", "Productive"),
        ("Microsoft Excel", "Productive"),
        ("Microsoft PowerPoint", "Productive"),
        ("Microsoft Outlook", "Productive"),
        ("Microsoft OneNote", "Productive"),
        ("Notion", "Productive"),
        ("Obsidian", "Productive"),
        ("Evernote", "Productive"),
        ("Bear", "Productive"),
        ("Roam Research", "Productive"),
        ("Logseq", "Productive"),
        ("Google Docs", "Productive"),
        ("Google Sheets", "Productive"),
        ("Google Slides", "Productive"),
        ("LibreOffice Writer", "Productive"),
        ("LibreOffice Calc", "Productive"),
        ("LibreOffice Impress", "Productive"),
        ("Pages", "Productive"),
        ("Numbers", "Productive"),
        ("Keynote", "Productive"),
        ("Trello", "Productive"),
        ("Asana", "Productive"),
        ("Monday.com", "Productive"),
        ("Jira", "Productive"),
        ("Linear", "Productive"),
        ("ClickUp", "Productive"),
        ("Todoist", "Productive"),
        ("Things", "Productive"),
        ("OmniFocus", "Productive"),
        
        // Communication Tools - Neutral
        ("Slack", "Neutral"),
        ("Microsoft Teams", "Neutral"),
        ("Discord", "Neutral"),
        ("Zoom", "Neutral"),
        ("Google Meet", "Neutral"),
        ("Skype", "Neutral"),
        ("WhatsApp", "Neutral"),
        ("Telegram", "Neutral"),
        ("Signal", "Neutral"),
        ("Messages", "Neutral"),
        ("Mail", "Neutral"),
        ("Thunderbird", "Neutral"),
        ("Spark", "Neutral"),
        ("Airmail", "Neutral"),
        
        // Browsers - Neutral
        ("Chrome", "Neutral"),
        ("Google Chrome", "Neutral"),
        ("Firefox", "Neutral"),
        ("Mozilla Firefox", "Neutral"),
        ("Safari", "Neutral"),
        ("Microsoft Edge", "Neutral"),
        ("Edge", "Neutral"),
        ("Opera", "Neutral"),
        ("Brave", "Neutral"),
        ("Arc", "Neutral"),
        ("Vivaldi", "Neutral"),
        
        // File Management and System - Neutral
        ("Finder", "Neutral"),
        ("File Explorer", "Neutral"),
        ("Explorer", "Neutral"),
        ("Nautilus", "Neutral"),
        ("Dolphin", "Neutral"),
        ("Thunar", "Neutral"),
        ("7-Zip", "Neutral"),
        ("WinRAR", "Neutral"),
        ("The Unarchiver", "Neutral"),
        ("Dropbox", "Neutral"),
        ("Google Drive", "Neutral"),
        ("OneDrive", "Neutral"),
        ("iCloud Drive", "Neutral"),
        ("Box", "Neutral"),
        
        // System Utilities - Neutral
        ("System Preferences", "Neutral"),
        ("System Settings", "Neutral"),
        ("Settings", "Neutral"),
        ("Control Panel", "Neutral"),
        ("Task Manager", "Neutral"),
        ("Activity Monitor", "Neutral"),
        ("Calculator", "Neutral"),
        ("Calendar", "Neutral"),
        ("Clock", "Neutral"),
        ("Notes", "Neutral"),
        ("Notepad", "Neutral"),
        ("TextEdit", "Neutral"),
        
        // Social Media - Distracting
        ("Facebook", "Distracting"),
        ("Twitter", "Distracting"),
        ("X", "Distracting"),
        ("Instagram", "Distracting"),
        ("TikTok", "Distracting"),
        ("Snapchat", "Distracting"),
        ("LinkedIn", "Distracting"),
        ("Reddit", "Distracting"),
        ("Pinterest", "Distracting"),
        ("Tumblr", "Distracting"),
        ("Mastodon", "Distracting"),
        ("Threads", "Distracting"),
        ("BeReal", "Distracting"),
        
        // Entertainment and Media - Distracting
        ("YouTube", "Distracting"),
        ("Netflix", "Distracting"),
        ("Spotify", "Distracting"),
        ("Apple Music", "Distracting"),
        ("iTunes", "Distracting"),
        ("Music", "Distracting"),
        ("VLC", "Distracting"),
        ("QuickTime Player", "Distracting"),
        ("Windows Media Player", "Distracting"),
        ("Plex", "Distracting"),
        ("Kodi", "Distracting"),
        ("Twitch", "Distracting"),
        ("Disney+", "Distracting"),
        ("Hulu", "Distracting"),
        ("Prime Video", "Distracting"),
        ("HBO Max", "Distracting"),
        ("Apple TV", "Distracting"),
        
        // Gaming - Distracting
        ("Steam", "Distracting"),
        ("Epic Games", "Distracting"),
        ("Battle.net", "Distracting"),
        ("Origin", "Distracting"),
        ("Uplay", "Distracting"),
        ("GOG Galaxy", "Distracting"),
        ("Xbox", "Distracting"),
        ("PlayStation", "Distracting"),
        ("Minecraft", "Distracting"),
        ("Roblox", "Distracting"),
        ("League of Legends", "Distracting"),
        ("Fortnite", "Distracting"),
        ("Valorant", "Distracting"),
        ("Counter-Strike", "Distracting"),
        ("Dota 2", "Distracting"),
        ("World of Warcraft", "Distracting"),
        ("Overwatch", "Distracting"),
        ("Apex Legends", "Distracting"),
        
        // Shopping and E-commerce - Distracting
        ("Amazon", "Distracting"),
        ("eBay", "Distracting"),
        ("Etsy", "Distracting"),
        ("AliExpress", "Distracting"),
        ("Walmart", "Distracting"),
        ("Target", "Distracting"),
        
        // News and Reading - Distracting
        ("News", "Distracting"),
        ("Apple News", "Distracting"),
        ("Feedly", "Distracting"),
        ("Flipboard", "Distracting"),
        ("Medium", "Distracting"),
        ("Pocket", "Distracting"),
        ("Instapaper", "Distracting"),
    ]
}
