use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppMetadata {
    pub application: String,
    pub description: Option<String>,
    pub category: String, // Added new field for main category
    pub tags: Vec<String>,
}

pub struct CategorizerService {
    client: reqwest::Client,
}

impl CategorizerService {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::builder()
                .user_agent("FocusForge/1.0 (App Categorization Engine)")
                .timeout(std::time::Duration::from_secs(5))
                .build()
                .unwrap_or_default(),
        }
    }

    /// Primary interface to fetch application metadata and identify its nature
    /// Uses Wikidata SPARQL or a specialized free API fallback, but for speed 
    /// and offline support, we map standard tags based on context parsing here.
    ///
    /// Returns a primary category ("Productive", "Neutral", "Distracting") and
    /// fine-grained "type:" tags.
    pub async fn fetch_app_metadata(&self, app_name: &str) -> Result<AppMetadata> {
        let mut tags = Vec::new();
        let mut category = "Neutral".to_string(); // Default category
        let app_lower = app_name.to_lowercase();
        
        let mut description = format!("Auto-categorized metadata for {}", app_name);

        // Core categorization logic mimicking a smart engine fallback
        // Modern AI IDEs
        if app_lower.contains("kiro") || app_lower.contains("cursor") || app_lower.contains("windsurf") 
            || app_lower.contains("antigravity") || app_lower.contains("zed") {
            category = "Productive".to_string();
            tags.push("type:ide".to_string());
            tags.push("type:programming".to_string());
            description = format!("AI-powered IDE: {}", app_name);
        }
        // Traditional IDEs and Code Editors
        else if app_lower.contains("code") || app_lower.contains("studio") || app_lower.contains("idea") 
            || app_lower.contains("builder") || app_lower.contains("ide") || app_lower.contains("vim") 
            || app_lower.contains("emacs") || app_lower.contains("sublime") || app_lower.contains("atom") {
            category = "Productive".to_string();
            tags.push("type:ide".to_string());
            tags.push("type:programming".to_string());
            description = format!("Software Development Kit or IDE for {}", app_name);
        } else if app_lower.contains("chrome") || app_lower.contains("edge") || app_lower.contains("firefox") || app_lower.contains("browser") || app_lower.contains("opera") || app_lower.contains("brave") {
            category = "Neutral".to_string(); // Browsers can be productive or distracting
            tags.push("type:web browser".to_string());
            description = format!("Web Browser ({})", app_name);
        } else if app_lower.contains("discord") {
            category = "Distracting".to_string();
            tags.push("type:social network".to_string());
            tags.push("type:communication".to_string());
        } else if app_lower.contains("slack") || app_lower.contains("teams") || app_lower.contains("skype") {
            category = "Productive".to_string();
            tags.push("type:communication".to_string());
            tags.push("type:collaboration".to_string());
        } else if app_lower.contains("figma") || app_lower.contains("photoshop") || app_lower.contains("blender") || app_lower.contains("illustrator") || app_lower.contains("paint") {
            category = "Productive".to_string();
            tags.push("type:graphics editor".to_string());
            tags.push("type:design".to_string());
            if app_lower.contains("blender") {
                tags.push("type:3d modeling".to_string());
            }
        } else if app_lower.contains("word") || app_lower.contains("docs") || app_lower.contains("pages") || app_lower.contains("writer") {
            category = "Productive".to_string();
            tags.push("type:word processor".to_string());
            tags.push("type:writing".to_string());
        } else if app_lower.contains("steam") || app_lower.contains("game") || app_lower.contains("epic") || app_lower.contains("craft") || app_lower.contains("roblox") {
            category = "Distracting".to_string();
            tags.push("type:game".to_string());
            tags.push("type:entertainment".to_string());
        } else if app_lower.contains("terminal") || app_lower.contains("powershell") || app_lower.contains("cmd") || app_lower.contains("bash") {
            category = "Productive".to_string();
            tags.push("type:terminal".to_string());
            tags.push("type:utility".to_string());
        } else if app_lower.contains("explorer") || app_lower.contains("finder") {
            category = "Neutral".to_string();
            tags.push("type:file manager".to_string());
            tags.push("type:utility".to_string());
        } else {
            // Default for unknown applications
            category = "Neutral".to_string();
            tags.push("type:utility".to_string());
        }

        Ok(AppMetadata {
            application: app_name.to_string(),
            description: Some(description),
            category, // Assign the determined category
            tags,
        })
    }
}
