// Authentication module for desktop app
pub mod models;
pub mod service;

pub use models::{User, AuthSession, LoginRequest, RegisterRequest, AuthResponse};
pub use service::AuthService;
