# FocusForge Testing Guide

## ✅ Desktop App - Complete Testing Checklist

### Prerequisites
- Windows 10/11
- FocusForge desktop app installed

### Test 1: Installation & Launch
1. **Install the app**:
   - Run `FocusForge_0.1.0_x64-setup.exe`
   - Follow installation wizard
   - ✅ App installs without errors

2. **Launch the app**:
   - Double-click FocusForge icon
   - ✅ App window opens
   - ✅ Landing page loads
   - ✅ No console errors

### Test 2: Registration (First Time User)
1. **Navigate to register**:
   - Click "Sign up" or go to `/register`
   - ✅ Register page loads

2. **Create account**:
   - Enter name: "Test User"
   - Enter email: "test@example.com"
   - Enter password: "password123"
   - Click "Sign up"
   - ✅ Account created successfully
   - ✅ Redirected to dashboard
   - ✅ No errors in console

3. **Verify data storage**:
   - Close app
   - Check database exists:
     - Windows: `%APPDATA%\com.focusforge.app\focusforge.db`
   - ✅ Database file created

### Test 3: Login (Returning User)
1. **Logout** (if logged in):
   - Navigate to settings
   - Click logout

2. **Login**:
   - Go to `/login`
   - Enter email: "test@example.com"
   - Enter password: "password123"
   - Click "Sign in"
   - ✅ Login successful
   - ✅ Redirected to dashboard
   - ✅ User data loaded

3. **Test wrong password**:
   - Logout
   - Try login with wrong password
   - ✅ Error message shown
   - ✅ Login prevented

### Test 4: Application Monitoring
1. **Navigate to monitoring test page**:
   - Go to `/dev/app-monitor`
   - ✅ Page loads

2. **Start monitoring**:
   - Click "Start Monitoring"
   - ✅ Status changes to "Running"
   - ✅ No errors

3. **Get active application**:
   - Click "Refresh" under Active Application
   - ✅ Shows current focused app
   - ✅ Displays app name, PID, path

4. **List running applications**:
   - Click "Refresh" under Running Applications
   - ✅ Shows list of all open apps
   - ✅ Table displays correctly

5. **Test real-time tracking**:
   - Switch to different applications (browser, notepad, etc.)
   - Click "Refresh" on active app
   - ✅ Active app updates correctly

6. **Stop monitoring**:
   - Click "Stop Monitoring"
   - ✅ Status changes to "Stopped"

### Test 5: Focus Sessions
1. **Navigate to focus page**:
   - Go to `/focus`
   - ✅ Page loads

2. **Start focus session**:
   - Set duration (e.g., 25 minutes)
   - Select productive categories
   - Click "Start Session"
   - ✅ Session starts
   - ✅ Timer begins

3. **Test distraction detection**:
   - Ensure monitoring is running
   - Switch to a non-productive app (e.g., social media)
   - ✅ Distraction detected
   - ✅ Notification appears (if enabled)

4. **Pause/Resume session**:
   - Click "Pause"
   - ✅ Session pauses
   - Click "Resume"
   - ✅ Session resumes

5. **Complete session**:
   - Click "Stop Session"
   - ✅ Session ends
   - ✅ Summary displayed

### Test 6: Notifications
1. **Check notification settings**:
   - Go to `/settings`
   - ✅ Notification settings visible

2. **Test distraction notification**:
   - Start focus session
   - Switch to distracting app
   - ✅ Desktop notification appears
   - ✅ Notification shows app name

### Test 7: System Tray
1. **Check system tray icon**:
   - Look in Windows system tray
   - ✅ FocusForge icon visible

2. **Test tray menu**:
   - Right-click tray icon
   - ✅ Menu appears with options:
     - Show Window
     - Hide Window
     - Start Focus Session
     - Quit

3. **Test minimize to tray**:
   - Click X to close window
   - ✅ App minimizes to tray (doesn't quit)
   - ✅ App still running in background

4. **Test restore from tray**:
   - Click tray icon or "Show Window"
   - ✅ Window restores

### Test 8: Offline Functionality
1. **Disconnect internet**:
   - Turn off WiFi/unplug ethernet
   - ✅ App continues working

2. **Test all features offline**:
   - Login/Register: ✅ Works
   - Monitoring: ✅ Works
   - Focus sessions: ✅ Works
   - Notifications: ✅ Works
   - Settings: ✅ Works

3. **Reconnect internet**:
   - Turn on WiFi
   - ✅ App continues working normally

### Test 9: Data Persistence
1. **Create some data**:
   - Start monitoring
   - Run a focus session
   - Switch between apps

2. **Close app completely**:
   - Right-click tray icon
   - Click "Quit"
   - ✅ App closes

3. **Reopen app**:
   - Launch FocusForge again
   - Login
   - ✅ Previous data still there
   - ✅ Activity logs preserved
   - ✅ Session history visible

### Test 10: Multiple Sessions
1. **Test session isolation**:
   - Logout
   - Register new user
   - ✅ New user has separate data
   - ✅ Previous user data not visible

2. **Switch between users**:
   - Logout
   - Login as first user
   - ✅ First user's data restored

### Test 11: Performance
1. **Check CPU usage**:
   - Open Task Manager
   - Find FocusForge process
   - ✅ CPU usage < 5% when idle
   - ✅ CPU usage < 10% when monitoring

2. **Check memory usage**:
   - ✅ Memory usage < 200 MB

3. **Check startup time**:
   - Close and reopen app
   - ✅ App starts in < 5 seconds

### Test 12: Error Handling
1. **Test invalid login**:
   - Try login with non-existent email
   - ✅ Error message shown
   - ✅ App doesn't crash

2. **Test empty fields**:
   - Try submit forms with empty fields
   - ✅ Validation errors shown

3. **Test database corruption** (advanced):
   - Close app
   - Delete database file
   - Reopen app
   - ✅ New database created
   - ✅ App works normally

---

## 🌐 Web Version - Testing Checklist

### Prerequisites
- Backend server running (`npm run dev`)
- PostgreSQL database configured

### Test 1: Server Startup
```bash
npm run dev
```
- ✅ Server starts on port 3000
- ✅ No errors in console
- ✅ Database connection successful

### Test 2: Web Registration
1. Open http://localhost:3000/register
2. Enter credentials
3. Click "Sign up"
- ✅ Account created in PostgreSQL
- ✅ Redirected to onboarding

### Test 3: Web Login
1. Go to http://localhost:3000/login
2. Enter credentials
3. Click "Sign in"
- ✅ Login successful
- ✅ Session cookie set
- ✅ Redirected to dashboard

### Test 4: Web Features
- ✅ Dashboard loads
- ✅ Settings work
- ✅ Profile updates save
- ✅ Logout works

---

## 🔍 Common Issues & Solutions

### Issue: "invoke is not a function"
**Solution**: Fixed! The app now properly imports Tauri API dynamically.

### Issue: App won't start
**Solution**: 
1. Check if another instance is running
2. Delete database and restart
3. Reinstall the app

### Issue: Monitoring not working
**Solution**:
1. Ensure app has permissions
2. Restart monitoring service
3. Check Task Manager for process

### Issue: Login fails
**Solution**:
1. Check credentials are correct
2. Verify database file exists
3. Try registering new account

### Issue: Notifications not showing
**Solution**:
1. Check Windows notification settings
2. Enable notifications in app settings
3. Restart app

---

## ✅ Final Verification

After completing all tests, verify:

- [x] Desktop app works completely offline
- [x] Login/register works in desktop app
- [x] All features work without backend server
- [x] Data persists across app restarts
- [x] System tray integration works
- [x] Notifications appear
- [x] Monitoring tracks applications
- [x] Focus sessions work end-to-end
- [x] Performance is acceptable
- [x] No crashes or errors

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Version: 0.1.0

Installation: ✅ / ❌
Registration: ✅ / ❌
Login: ✅ / ❌
Monitoring: ✅ / ❌
Focus Sessions: ✅ / ❌
Notifications: ✅ / ❌
System Tray: ✅ / ❌
Offline Mode: ✅ / ❌
Data Persistence: ✅ / ❌
Performance: ✅ / ❌

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Success Criteria

The desktop app is considered **production-ready** when:

1. ✅ All tests pass
2. ✅ No critical bugs
3. ✅ Works completely offline
4. ✅ Performance is acceptable
5. ✅ Data persists correctly
6. ✅ User experience is smooth

**Current Status**: ✅ READY FOR TESTING

The desktop app has been built with all fixes and is ready for comprehensive testing!
