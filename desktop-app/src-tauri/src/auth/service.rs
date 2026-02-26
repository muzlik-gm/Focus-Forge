use anyhow::{Context, Result, anyhow};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use sqlx::SqlitePool;
use uuid::Uuid;
use chrono::Utc;

use super::models::{User, UserWithPassword, AuthSession, LoginRequest, RegisterRequest, AuthResponse};

pub struct AuthService {
    pool: SqlitePool,
}

impl AuthService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    /// Register a new user
    pub async fn register(&self, request: RegisterRequest) -> Result<AuthResponse> {
        log::info!("Registration attempt for email: {}", request.email);
        
        // Check if user already exists
        let existing = sqlx::query_as::<_, (String,)>(
            "SELECT id FROM users WHERE email = ?"
        )
        .bind(&request.email)
        .fetch_optional(&self.pool)
        .await?;

        if existing.is_some() {
            log::warn!("Registration failed: User already exists for email: {}", request.email);
            return Err(anyhow!("User with this email already exists"));
        }

        // Hash password
        log::info!("Hashing password...");
        let password_hash = self.hash_password(&request.password)?;
        log::info!("Password hashed successfully");

        // Create user
        let user_id = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();

        log::info!("Creating user in database...");
        sqlx::query(
            "INSERT INTO users (id, email, password_hash, name, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(&user_id)
        .bind(&request.email)
        .bind(&password_hash)
        .bind(&request.name)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await
        .context("Failed to create user")?;

        log::info!("User created successfully: {}", user_id);

        // Create session
        let session = self.create_session(&user_id).await?;
        log::info!("Session created for new user: {}", user_id);

        let user = User {
            id: user_id,
            email: request.email,
            name: request.name,
            created_at: now,
            updated_at: now,
        };

        Ok(AuthResponse {
            user,
            token: session.token,
            expires_at: session.expires_at,
        })
    }

    /// Login user
    pub async fn login(&self, request: LoginRequest) -> Result<AuthResponse> {
        log::info!("Login attempt for email: {}", request.email);
        
        // Get user by email
        let user = sqlx::query_as::<_, (String, String, String, Option<String>, i64, i64)>(
            "SELECT id, email, password_hash, name, created_at, updated_at 
             FROM users WHERE email = ?"
        )
        .bind(&request.email)
        .fetch_optional(&self.pool)
        .await?;

        if user.is_none() {
            log::warn!("Login failed: User not found for email: {}", request.email);
            return Err(anyhow!("Invalid email or password"));
        }

        let user = user.unwrap();
        log::info!("User found: {}", user.1);

        let user_with_password = UserWithPassword {
            id: user.0,
            email: user.1,
            password_hash: user.2,
            name: user.3,
            created_at: user.4,
            updated_at: user.5,
        };

        // Verify password
        log::info!("Verifying password...");
        if !self.verify_password(&request.password, &user_with_password.password_hash)? {
            log::warn!("Login failed: Invalid password for email: {}", request.email);
            return Err(anyhow!("Invalid email or password"));
        }

        log::info!("Password verified successfully");

        // Create session
        let session = self.create_session(&user_with_password.id).await?;
        log::info!("Session created successfully for user: {}", user_with_password.id);

        let user = User {
            id: user_with_password.id,
            email: user_with_password.email,
            name: user_with_password.name,
            created_at: user_with_password.created_at,
            updated_at: user_with_password.updated_at,
        };

        Ok(AuthResponse {
            user,
            token: session.token,
            expires_at: session.expires_at,
        })
    }

    /// Logout user (invalidate session)
    pub async fn logout(&self, token: &str) -> Result<()> {
        sqlx::query("DELETE FROM auth_sessions WHERE token = ?")
            .bind(token)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    /// Verify session token and get user
    pub async fn verify_session(&self, token: &str) -> Result<User> {
        let now = Utc::now().timestamp();

        // Get session and user
        let result = sqlx::query_as::<_, (String, String, Option<String>, i64, i64)>(
            "SELECT u.id, u.email, u.name, u.created_at, u.updated_at
             FROM auth_sessions s
             JOIN users u ON s.user_id = u.id
             WHERE s.token = ? AND s.expires_at > ?"
        )
        .bind(token)
        .bind(now)
        .fetch_optional(&self.pool)
        .await?
        .ok_or_else(|| anyhow!("Invalid or expired session"))?;

        Ok(User {
            id: result.0,
            email: result.1,
            name: result.2,
            created_at: result.3,
            updated_at: result.4,
        })
    }

    /// Create a new session for user
    async fn create_session(&self, user_id: &str) -> Result<AuthSession> {
        let session_id = Uuid::new_v4().to_string();
        let token = Uuid::new_v4().to_string();
        let now = Utc::now().timestamp();
        let expires_at = now + (30 * 24 * 60 * 60); // 30 days

        sqlx::query(
            "INSERT INTO auth_sessions (id, user_id, token, expires_at, created_at)
             VALUES (?, ?, ?, ?, ?)"
        )
        .bind(&session_id)
        .bind(user_id)
        .bind(&token)
        .bind(expires_at)
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(AuthSession {
            id: session_id,
            user_id: user_id.to_string(),
            token,
            expires_at,
            created_at: now,
        })
    }

    /// Hash password using Argon2
    fn hash_password(&self, password: &str) -> Result<String> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| anyhow!("Failed to hash password: {}", e))?
            .to_string();

        Ok(password_hash)
    }

    /// Verify password against hash
    fn verify_password(&self, password: &str, hash: &str) -> Result<bool> {
        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| anyhow!("Failed to parse password hash: {}", e))?;

        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    }

    /// Clean up expired sessions
    pub async fn cleanup_expired_sessions(&self) -> Result<u64> {
        let now = Utc::now().timestamp();
        
        let result = sqlx::query("DELETE FROM auth_sessions WHERE expires_at <= ?")
            .bind(now)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected())
    }
}
