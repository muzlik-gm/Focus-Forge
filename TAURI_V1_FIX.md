# Tauri v1 Detection Fix - CRITICAL

## The Root Cause

The desktop app uses **Tauri v1** (`@tauri-apps/api@^1.5.3`), which exposes `window.__TAURI__`.

However, all the authentication code was checking for `window.__TAURI_INTERNALS__`, which is a **Tauri v2** global that doesn't exist in v1.

## The Problem Flow

1. User opens desktop app (Tauri v1)
2. `AuthContext` checks for `window.__TAURI_INTERNALS__` → **not found**
3. `isDesktop` is set to `false` (thinks it's web)
4. Login/register pages check for `__TAURI_INTERNALS__` → **not found**
5. `tauriInvoke` is never loaded
6. Code falls into NextAuth `signIn()` path
7. NextAuth doesn't work in static export (no API routes)
8. `signIn()` returns without error
9. `router.push('/dashboard')` fires
10. Dashboard sees `isAuthenticated = false` → redirects to `/login`
11. Loop or lands on `/` (home page)

## The Fix

Changed all Tauri detection from:
```typescript
window.__TAURI_INTERNALS__  // Tauri v2 ❌
```

To:
```typescript
window.__TAURI__  // Tauri v1 ✅
```

## Files Fixed

1. **contexts/AuthContext.tsx** ✅ (was already correct)
2. **hooks/useAuth.ts** ✅ (fixed)
3. **AGENTS.md** ✅ (updated documentation)

## Files That Were Already Correct

These files were already using `__TAURI__`:
- `lib/tauri-api.ts`
- `app/desktop-login/page.tsx`

## Testing Instructions

### Step 1: Clear Everything
```javascript
// In DevTools Console (F12)
localStorage.clear()
```

### Step 2: Test Registration
1. Open desktop app
2. Open DevTools (F12) → Console
3. Go to Register page
4. You should see:
   ```
   [AuthContext] Initializing authentication...
   [AuthContext] Environment: Desktop (Tauri)
   [AuthContext] Checking localStorage for auth...
   [AuthContext] No auth found in localStorage
   ```
5. Fill in form and register
6. You should see:
   ```
   [Register] Tauri API loaded successfully
   [Register] Form submitted
   [Register] Using Tauri authentication
   [Register] Tauri registration successful: {...}
   [AuthContext] Found user in localStorage: email@example.com
   [DashboardLayout] Rendering dashboard for user: email@example.com
   ```

### Step 3: Test Wrong Credentials
1. Logout
2. Try to login with wrong password
3. You should see:
   ```
   [Login] Tauri API loaded successfully
   [Login] Form submitted
   [Login] Using Tauri authentication
   [Login] Tauri login error: Invalid email or password
   [Login] Setting error: Invalid email or password
   ```
4. Error message appears in UI
5. Stays on login page (NO redirect)

### Step 4: Test Correct Login
1. Login with correct credentials
2. Should redirect to dashboard
3. Should stay on dashboard

## Expected Console Logs

### On App Start (Not Logged In):
```
[AuthContext] Initializing authentication...
[AuthContext] Environment: Desktop (Tauri)
[AuthContext] Checking localStorage for auth...
[AuthContext] No auth found in localStorage
[AuthContext] Current state: { user: 'none', loading: false, isDesktop: true, isAuthenticated: false }
```

### On Login Page Load:
```
[Login] Tauri API loaded successfully
```

### On Successful Login:
```
[Login] Form submitted
[Login] Starting login process...
[Login] Environment: Desktop
[Login] Using Tauri authentication
[Login] Tauri login successful: {user: {...}, token: '...', expires_at: ...}
[Login] Redirecting to dashboard...
[AuthContext] Found user in localStorage: email@example.com
[AuthContext] Current state: { user: 'email@example.com', loading: false, isDesktop: true, isAuthenticated: true }
[DashboardLayout] Auth state: { user: 'email@example.com', loading: false, isAuthenticated: true }
[DashboardLayout] Rendering dashboard for user: email@example.com
```

### On Failed Login:
```
[Login] Form submitted
[Login] Starting login process...
[Login] Environment: Desktop
[Login] Using Tauri authentication
[Login] Tauri login error: Invalid email or password
[Login] Setting error: Invalid email or password
```

## Key Indicators It's Working

✅ Console shows: `[AuthContext] Environment: Desktop (Tauri)`
✅ Console shows: `[Login] Tauri API loaded successfully`
✅ Console shows: `isDesktop: true` in auth state
✅ Wrong credentials show error message
✅ Correct credentials redirect to dashboard
✅ Dashboard stays loaded (no redirect loop)

## Key Indicators It's NOT Working

❌ Console shows: `[AuthContext] Environment: Web (Browser)`
❌ Console shows: `isDesktop: false` in auth state
❌ No `[Login] Tauri API loaded successfully` message
❌ Redirects to home page on any action
❌ No error messages shown

## Verification Commands

Run in DevTools Console:
```javascript
// Check if Tauri is detected
console.log('Tauri v1:', !!(window as any).__TAURI__)
console.log('Tauri v2:', !!(window as any).__TAURI_INTERNALS__)

// Should show:
// Tauri v1: true
// Tauri v2: false

// Check auth state
console.log('Auth token:', localStorage.getItem('auth_token'))
console.log('User:', localStorage.getItem('user'))
```

## Build Location

New installer with fix:
`desktop-app\src-tauri\target\release\bundle\nsis\FocusForge_0.1.0_x64-setup.exe`

## Summary

The issue was a simple but critical mismatch:
- **Using**: Tauri v1 (`@tauri-apps/api@^1.5.3`)
- **Checking for**: Tauri v2 global (`__TAURI_INTERNALS__`)
- **Should check for**: Tauri v1 global (`__TAURI__`)

This caused the desktop app to think it was running in a web browser, leading to all the authentication issues.

Now with the correct detection, the desktop app will:
1. Properly detect it's running in Tauri
2. Load the Tauri invoke function
3. Call Rust backend commands
4. Store auth in localStorage
5. Update AuthContext correctly
6. Render dashboard properly
7. Show errors when credentials are wrong
