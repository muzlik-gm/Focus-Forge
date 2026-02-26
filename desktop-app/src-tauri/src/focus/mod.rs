// Focus session management module
// 
// This module provides focus session tracking with distraction detection.
// A focus session is a user-defined time period where the user wants to
// stay focused on specific productive applications.

pub mod session_manager;

pub use session_manager::{FocusSessionManager, SessionSummary};
