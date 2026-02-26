# Authentication Fixes - Testing Guide

## What Was Fixed

### 1. Browser Error: `TypeError: window.__TAURI_IPC__ is not a function`
**Problem**: The Tauri API import was failing in the browser and throwing errors.

**Solution**: 
- Added proper environment detection by checking for `window.__TAURI_INTERNALS__` before attempting to import Tauri API
- Added console logging to show which authentication mode is being used
- Graceful fallback to web authentication when Tauri is not available

**Files Changed**:
- `app/login/page.tsx`
- `app/register/page.tsx`

### 2. Desktop Login Error: "Invalid email or password"
**Problem**: Login was failing even with correct credentials, likely due to:
- User not registered yet
- Database migration issues
- Password verification problems

**Solution**:
- Added comprehensive logging to Rust auth service to track:
  - Registration attempts
  - User lookup
  - Password hashing
  - Password verification
  - Session creation
- Added console logging to frontend for debugging
- Improved error messages

**Files Changed**:
- `desktop-app/src-tauri/src/auth/service.rs`
- `app/login/page.tsx`
- `app/register/page.tsx`

### 3. Build Script OneDrive Sync Issues
**Problem**: Build script was failing due to OneDrive locking folders during rename operations.

**Solution**:
- Changed from `fs.renameSync()` to `fs.cpSync()` + `fs.rmSync()` to avoid OneDrive sync conflicts
- More reliable backup/restore process

**Files Changed**:
- `scripts/build-desktop.js`

## Testing Instructions

### Test 1: Browser (Web Version)
1. Open browser and navigate to `http://localhost:3000/login`
2. Open browser console (F12)
3. You should see: `"Web environment detected - using NextAuth"`
4. Try to login - should use NextAuth (requires backend server running)
5. **Expected**: No Tauri-related errors in console

### Test 2: Desktop App (Registration)
1. Run the desktop app: `desktop-app\src-tauri\target\release\FocusForge.exe`
2. Navigate to Register page
3. Open DevTools (Right-click → Inspect or F12)
4. Fill in registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
5. Click "Create account"
6. **Check Console Logs**:
   - Should see: `"Tauri environment detected - using desktop authentication"`
   - Should see: `"Attempting desktop registration for: test@example.com"`
   - Should see: `"Registration successful: {user object}"`
7. **Check Rust Logs** (if running from terminal):
   - Should see: `"Registration attempt for email: test@example.com"`
   - Should see: `"Hashing password..."`
   - Should see: `"Password hashed successfully"`
   - Should see: `"Creating user in database..."`
   - Should see: `"User created successfully: {uuid}"`
   - Should see: `"Session created for new user: {uuid}"`
8. **Expected**: Redirect to dashboard

### Test 3: Desktop App (Login)
1. After successful registration, logout or restart app
2. Navigate to Login page
3. Open DevTools
4. Fill in login form:
   - Email: test@example.com
   - Password: password123
5. Click "Sign in"
6. **Check Console Logs**:
   - Should see: `"Tauri environment detected - using desktop authentication"`
   - Should see: `"Attempting desktop login for: test@example.com"`
   - Should see: `"Login successful: {user object}"`
7. **Check Rust Logs**:
   - Should see: `"Login attempt for email: test@example.com"`
   - Should see: `"User found: test@example.com"`
   - Should see: `"Verifying password..."`
   - Should see: `"Password verified successfully"`
   - Should see: `"Session created successfully for user: {uuid}"`
8. **Expected**: Redirect to dashboard

### Test 4: Database Verification
1. Locate the database file:
   - Windows: `%APPDATA%\com.focusforge.desktop\focusforge.db`
2. Open with SQLite browser or run query:
   ```sql
   SELECT id, email, name, created_at FROM users;
   SELECT id, user_id, expires_at FROM auth_sessions;
   ```
3. **Expected**: 
   - User record exists with hashed password
   - Active session exists with valid token

## Debugging Tips

### If Registration Fails:
1. Check Rust logs for specific error messages
2. Verify database file exists and is writable
3. Check if migrations ran successfully
4. Look for password hashing errors

### If Login Fails:
1. Check if user exists in database
2. Verify password hash is stored correctly
3. Check password verification logs
4. Ensure session creation succeeds

### If Browser Shows Tauri Errors:
1. Clear browser cache
2. Verify `window.__TAURI_INTERNALS__` check is working
3. Check console for environment detection logs

## Success Criteria

✅ Browser version works without Tauri errors
✅ Desktop registration creates user in SQLite database
✅ Desktop login verifies password and creates session
✅ Both versions work independently without conflicts
✅ Proper logging shows authentication flow
✅ Build completes successfully without OneDrive errors

## Database Location

The desktop app stores its SQLite database at:
- **Windows**: `%APPDATA%\com.focusforge.desktop\focusforge.db`
- **macOS**: `~/Library/Application Support/com.focusforge.desktop/focusforge.db`
- **Linux**: `~/.local/share/com.focusforge.desktop/focusforge.db`

## Next Steps After Testing

1. If registration works but login fails:
   - Check password verification logic
   - Verify Argon2 hash format is correct
   - Test with different passwords

2. If both fail:
   - Check database migrations
   - Verify SQLite connection
   - Check file permissions

3. If browser still shows errors:
   - Verify Next.js build includes the fixes
   - Clear browser cache completely
   - Test in incognito mode
