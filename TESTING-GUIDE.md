# Testing Guide - Session Tracking Fixes

## What Was Fixed

### 1. Time Display Fix
- Fixed `formatTime()` to properly floor seconds before calculating hours/minutes/seconds
- This ensures accurate time display in the session summary modal

### 2. 60-Second Distraction Threshold
- Distractions are now only counted when you spend 60+ seconds on a non-productive app
- Brief app switches (< 60s) are tracked but don't count as distractions
- Enhanced logging shows which apps triggered distractions and which were ignored

### 3. Dashboard Refresh
- Added refresh button to dashboard to force reload latest data
- Added logging to track data flow from API to UI
- Dashboard now shows real-time distraction counts

### 4. Enhanced Logging
- Added comprehensive logging throughout the session tracking pipeline:
  - `[SessionSummary]` - Session summary calculation with distraction details
  - `[StopSession]` - Session completion and sync process
  - `[SyncPush]` - MongoDB sync with payload details
  - `[Dashboard]` - Dashboard data loading
  - `[Analytics]` - Analytics calculation from database

## How to Test

### Step 1: Start Fresh Session
1. Open desktop app
2. Start a new focus session (25 minutes recommended)
3. Select "Web Dev" or "Custom" profile with "Productive" category

### Step 2: Simulate Distractions
During the session, test the 60-second threshold:

**Test Case A: Brief Switch (Should NOT count)**
- Switch to a non-productive app (e.g., Spotify, Discord)
- Stay for 30-45 seconds
- Switch back to productive app
- Expected: NOT counted as distraction

**Test Case B: Extended Distraction (Should count)**
- Switch to a non-productive app
- Stay for 65+ seconds
- Switch back to productive app
- Expected: Counted as 1 distraction

**Test Case C: Multiple Brief Switches (Should NOT count)**
- Switch to non-productive app for 20 seconds
- Back to productive app
- Switch to different non-productive app for 30 seconds
- Back to productive app
- Expected: 0 distractions (both under 60s)

### Step 3: Complete Session
1. Let timer run to 0 (auto-stops) OR click "Stop" button
2. Session summary modal appears

### Step 4: Verify Session Summary
Check the modal displays:
- **Total Time**: Actual session duration (e.g., "25:00" for 25 minutes)
- **Focus Time**: Time spent on productive apps
- **Distractions**: Count of 60+ second non-productive app usage
- **Productivity Score**: Percentage of focus time
- **Time by Application**: Breakdown showing all apps used
- **Productivity Insights**: 💡 Personalized feedback with emojis

### Step 5: Check Browser Console
Open DevTools Console and look for logs:

```
[SessionSummary] Total logs: X
[SessionSummary] App: "Kiro", Duration: 1200s
[SessionSummary]   RESULT: Kiro is PRODUCTIVE
[SessionSummary] App: "Spotify", Duration: 45s
[SessionSummary]   ✓ Brief switch ignored: Spotify (45s < 60s threshold)
[SessionSummary] App: "Discord", Duration: 75s
[SessionSummary]   ⚠️ DISTRACTION COUNTED: Discord (75s >= 60s threshold)
[SessionSummary] Total distractions (60+ seconds each): 1
```

### Step 6: Verify Dashboard
1. Navigate to Dashboard page
2. Click "Refresh" button
3. Check stats cards show:
   - **Focus time**: Converted to hours (e.g., 25 minutes = 0.4h)
   - **Distractions**: Matches session summary count
   - **Tasks completed**: Your completed tasks today
   - **Streak**: Days with at least one completed session

### Step 7: Check MongoDB Sync
1. Open browser console
2. Look for `[SyncPush]` logs showing:
   - Session synced to cloud
   - Duration in minutes
   - Distraction count
   - Completed status

3. Verify at `/api/debug/sessions`:
```json
{
  "id": "...",
  "durationMinutes": 25,
  "distractionCount": 1,
  "completed": true
}
```

## Expected Results

### Session Summary Modal
```
Session Complete!
Great Work!

Total Time: 25:00
Focus Time: 23:45
Distractions: 1
Productivity: 95%

Time by Application:
Kiro          23:45
Discord       1:15

💡 Productivity Insights:
🎯 Excellent focus! You maintained deep work throughout the session.
💡 One brief distraction - that's normal. Keep it minimal!
⏱️ Perfect Pomodoro length! Take a 5-minute break.
```

### Dashboard Display
```
TODAY
0.4h          Focus time
1             Tasks completed  
1             Day streak
1             Distractions
```

## Troubleshooting

### Issue: Dashboard shows 0 distractions
**Solution**: Click the "Refresh" button on dashboard

### Issue: Session summary shows wrong time
**Solution**: Check browser console for `[SessionSummary]` logs to see actual duration calculation

### Issue: All app switches count as distractions
**Solution**: Check that apps are properly categorized. Run from Desktop Monitor page to verify categories.

### Issue: No activity logs found
**Solution**: 
1. Ensure monitoring is running (Desktop Monitor page)
2. Check Rust backend logs for timestamp conversion issues
3. Verify session start/end times are in milliseconds

## Key Improvements

### Smart Distraction Detection
- 60-second threshold prevents false positives from quick app switches
- Only sustained non-productive app usage counts as distraction
- Helps users focus on real productivity issues

### Productivity Insights
Five types of personalized feedback:
1. **Success** (🎯, ✨, 🔥) - Excellent performance
2. **Warning** (⚡, 🚫, ⚠️) - Areas to improve
3. **Tips** (💡, ⏱️, 🧘) - Actionable recommendations
4. **App-specific** (🎨) - Single-tasking recognition
5. **Context switching** (🔄) - Multi-app warnings

### Better Time Tracking
- Accurate duration calculation from activity logs
- Minimum 1 minute for completed sessions
- Proper conversion between seconds/minutes/hours

## Next Steps

After testing, if you see any issues:
1. Share the browser console logs (especially `[SessionSummary]` and `[SyncPush]`)
2. Share the `/api/debug/sessions` output
3. Describe what you expected vs what you saw

The system is now designed to help you be more productive with smart distraction detection and actionable insights!
