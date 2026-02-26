// Focus loss analysis
// Analyzes activity patterns to detect focus loss

use super::{FocusLossEvent, FocusLossType, Severity, ApplicationActivity};
use anyhow::Result;
use chrono::Utc;

pub struct FocusAnalyzer {
    session_id: Option<String>,
    last_activity: Option<ApplicationActivity>,
}

impl FocusAnalyzer {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Self {
            session_id: None,
            last_activity: None,
        }
    }
    
    #[allow(dead_code)]
    pub fn start_session(&mut self, session_id: String) {
        self.session_id = Some(session_id);
        log::info!("Focus analyzer started for session");
    }
    
    #[allow(dead_code)]
    pub fn stop_session(&mut self) {
        self.session_id = None;
        self.last_activity = None;
        log::info!("Focus analyzer stopped");
    }
    
    #[allow(dead_code)]
    pub fn analyze_activity(&mut self, current: ApplicationActivity) -> Result<Option<FocusLossEvent>> {
        if self.session_id.is_none() {
            return Ok(None);
        }
        
        // Check if this is a focus loss event
        if let Some(last) = &self.last_activity {
            // Detect app switch from productive to distracting
            if last.category == super::ActivityCategory::Productive 
                && current.category == super::ActivityCategory::Distracting {
                
                let event = FocusLossEvent {
                    id: uuid::Uuid::new_v4().to_string(),
                    session_id: self.session_id.clone().unwrap(),
                    timestamp: Utc::now(),
                    event_type: FocusLossType::AppSwitch,
                    from_app: Some(last.process_name.clone()),
                    to_app: Some(current.process_name.clone()),
                    from_url: None,
                    to_url: None,
                    severity: Severity::High,
                    auto_detected: true,
                };
                
                self.last_activity = Some(current);
                return Ok(Some(event));
            }
        }
        
        self.last_activity = Some(current);
        Ok(None)
    }
}
