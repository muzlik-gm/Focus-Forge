# DesktopFocusSession Component

Desktop-specific focus session management UI that integrates with Tauri commands for native system monitoring and distraction detection.

## Overview

The `DesktopFocusSession` component provides a complete focus session management interface for the desktop app, including:

- **Session Start Dialog**: Configure session with category selection and goal setting
- **Active Session Controls**: Pause, resume, and stop controls with real-time monitoring
- **Session Summary**: Detailed completion summary with productivity metrics
- **Tauri Integration**: Uses Tauri IPC commands for native system monitoring

## Features

### 1. Session Start Dialog

When starting a new focus session, users can configure:

- **Duration**: Set session length in minutes (1-480 minutes)
- **Goal**: Optional text description of what they'll focus on
- **Productive Categories**: Select which application categories count as productive work
  - Categories are loaded from the Tauri backend
  - Multiple categories can be selected
  - Default categories: Productive, Neutral, Distracting

### 2. Active Session Display

During an active session, the UI shows:

- **Timer**: Large, easy-to-read countdown display
- **Current Application**: Real-time display of the active window (polled every 2 seconds)
- **Session Goal**: Reminder of what the user is working on
- **Productive Categories**: Visual display of selected categories
- **Status Indicator**: Shows if session is active or paused

### 3. Session Controls

- **Pause**: Temporarily pause the session (status changes to 'Paused')
- **Resume**: Continue a paused session (status changes to 'Active')
- **Stop**: End the session and generate summary

### 4. Session Summary

After completing a session, displays:

- **Total Time**: Duration of the entire session
- **Focus Time**: Time spent in productive applications
- **Distractions**: Count of switches to non-productive apps
- **Productivity Score**: Percentage of time spent focused (0-100%)
- **Application Breakdown**: Time spent in each application, sorted by duration

## Usage

### In the Focus Page

The component is automatically used when the app detects it's running in the desktop environment:

```tsx
import { DesktopFocusSession } from '@/components/timer/DesktopFocusSession';
import { useAuth } from '@/contexts/AuthContext';

export default function FocusPage() {
  const { isDesktop } = useAuth();

  return (
    <div>
      {isDesktop ? (
        <DesktopFocusSession />
      ) : (
        // Web-based focus timer
      )}
    </div>
  );
}
```

### Standalone Usage

```tsx
import { DesktopFocusSession } from '@/components/timer/DesktopFocusSession';

export default function MyPage() {
  return <DesktopFocusSession />;
}
```

## Tauri Commands Used

The component integrates with the following Tauri commands:

### Monitoring Commands
- `tauriApi.monitoring.start()` - Start system monitoring
- `tauriApi.monitoring.getActiveWindow()` - Get current active window

### Category Commands
- `tauriApi.categories.listCategoryNames()` - Get available categories
- `tauriApi.categories.getCategoryWithFallback(app)` - Get category for an app

### Focus Session Commands
- `tauriApi.focusSessions.create(id, startTime, categories, goal)` - Create new session
- `tauriApi.focusSessions.getCurrent()` - Get active session
- `tauriApi.focusSessions.getById(id)` - Get session by ID
- `tauriApi.focusSessions.pause()` - Pause current session
- `tauriApi.focusSessions.resume()` - Resume current session
- `tauriApi.focusSessions.complete(id, endTime)` - Complete session

### Activity Log Commands
- `tauriApi.activityLogs.getLogs(startTime, endTime)` - Get activity logs for summary

## State Management

The component manages the following state:

- `currentSession`: Active focus session data
- `showStartDialog`: Controls start dialog visibility
- `showSummary`: Controls summary modal visibility
- `sessionSummary`: Calculated session metrics
- `categories`: Available application categories
- `selectedCategories`: User-selected productive categories
- `sessionGoal`: User's session goal text
- `durationMinutes`: Session duration
- `elapsedTime`: Current elapsed time in seconds
- `currentApp`: Currently active application name
- `error`: Error message display
- `loading`: Loading state for async operations

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **Requirement 6.1**: Session start with productive category selection
- **Requirement 6.5**: Session summary with focus time, distraction count, and application breakdown

## Testing

Test the component in isolation at `/dev/focus-session`:

1. Start the Next.js dev server: `npm run dev`
2. Start the desktop app: `cd desktop-app && npm run tauri dev`
3. Navigate to the focus page or `/dev/focus-session`
4. Test session start, pause/resume, and stop functionality

## Dependencies

- `@/lib/tauri-api` - Tauri IPC command wrappers
- `@/components/ui/Modal` - Modal dialog component
- `@/components/ui/Button` - Button component with variants
- `@/types/tauri` - TypeScript types for Tauri data structures
- `lucide-react` - Icon components

## Notes

- The component only works in the desktop environment (Tauri)
- Requires the Rust backend to have focus session commands implemented
- Monitoring must be started for real-time application tracking
- Session data is stored in the local SQLite database via Tauri commands
- The component polls the active window every 2 seconds during active sessions
