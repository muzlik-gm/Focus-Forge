# Sentinel Security Journal 🛡️

## 2026-02-28 - [CRITICAL] Authentication Bypass via Firebase Email
**Vulnerability:** The NextAuth `CredentialsProvider`'s `authorize` function allowed any user to log in to a Firebase-linked account by simply providing the account's email. It explicitly skipped password verification for users with a `firebaseUid` but provided no alternative proof of identity.
**Learning:** Bridging multiple authentication systems (Firebase + NextAuth) creates "gaps" if the bridge doesn't re-verify the source of truth's proof (ID token).
**Prevention:** Always require a cryptographic proof (like a verified ID token) when skipping standard password checks for third-party linked accounts.

## 2026-02-28 - [HIGH] Insecure Password Storage in LocalStorage
**Vulnerability:** The "Remember Me" feature stored the user's plaintext password in `localStorage`, encoded only in base64. Base64 is not encryption and can be easily reversed.
**Learning:** Convenience features often lead to security regressions if they handle sensitive data like passwords.
**Prevention:** Never store passwords or sensitive tokens in `localStorage` or `cookies` in a way that can be easily retrieved or decoded by client-side scripts.

## 2026-02-28 - [MEDIUM] Sensitive Debug Endpoint Exposure
**Vulnerability:** `app/api/debug/sessions/route.ts` was an active endpoint that returned detailed session information for the current user, including metadata that could be used for further attacks.
**Learning:** Debugging tools often make it into production and become liabilities.
**Prevention:** Remove all "debug" prefixed routes before merging to production, or guard them behind strict admin-only middleware that is disabled by default.

## 2026-02-28 - [MEDIUM] Missing Rate Limiting on Auth Endpoints
**Vulnerability:** Several authentication-related endpoints (`firebase-login`, `oauth-exchange`) were missing rate limiting, making them targets for brute-force or DoS attacks.
**Learning:** Attackers target all entry points, not just the primary login page.
**Prevention:** Apply consistent rate limiting to all endpoints that handle authentication or sensitive user data.

## 2026-02-28 - [MEDIUM] Information Leakage in API Errors
**Vulnerability:** API routes were returning raw error messages from caught exceptions, which could reveal internal database structure or logic details.
**Learning:** Generic catch blocks without error filtering often leak internal state.
**Prevention:** Standardize error responses to use generic codes and messages for the client, while keeping detailed logs on the server.

## 2026-02-28 - [MEDIUM] In-memory Invitation Store
**Vulnerability:** Workspace invitations are stored in a simple in-memory `Map` (`lib/invitations.ts`).
**Learning:** invitations are lost on server restart. In a serverless or multi-instance environment, this makes the invitation system non-functional and inconsistent. It also presents a small DoS risk as memory isn't automatically reclaimed for expired invitations unless manually cleared.
**Prevention:** Always store persistent business objects (like invitations or session tokens) in a database.

## 2026-02-28 - [LOW] Overly Permissive CORS Configuration
**Vulnerability:** `next.config.mjs` allows a wide range of headers and methods for all API routes.
**Learning:** While necessary for the desktop app, the configuration could be more restrictive by only allowing specific headers and origins that are strictly required.
**Prevention:** Use a more granular CORS policy, ideally limiting it to specific routes and validating origins against a strict allowlist.

## 2026-02-28 - [MEDIUM] Insecure Random ID Generation
**Vulnerability:** `generateId` in `lib/utils.ts` used `Math.random()`, which is not cryptographically secure and has a higher collision risk.
**Learning:** Using predictable random number generators for IDs can lead to enumeration or collision attacks.
**Prevention:** Use `crypto.randomUUID()` or `crypto.getRandomValues()` for generating unique identifiers.

## 2026-02-28 - [HIGH] Missing CSRF Protection on Onboarding and Sync
**Vulnerability:** The middleware was missing `/api/onboarding`, `/api/sync`, and `/api/notifications` in its `PROTECTED_API_ROUTES` list, meaning state-changing requests to these endpoints weren't validated for CSRF tokens.
**Learning:** As new routes are added, the global security middleware must be updated accordingly.
**Prevention:** Adopt a "secure by default" approach where all API routes under `/api` (except public ones) are automatically protected unless explicitly excluded.

## 2026-02-28 - [LOW] Redundant and Hardcoded Firebase Admin Config
**Vulnerability:** Firebase Admin was being initialized with hardcoded project IDs and redundant logic across different routes.
**Learning:** Decentralized security configuration leads to inconsistencies and makes rotation of secrets difficult.
**Prevention:** Centralize all third-party SDK initializations and strictly use environment variables for all configuration values.
