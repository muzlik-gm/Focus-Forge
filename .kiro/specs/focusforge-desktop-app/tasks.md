# Implementation Plan: FocusForge Desktop Application

## Overview

This implementation plan documents the FocusForge desktop application using Tauri. The desktop app uses a **cloud-based architecture** where it connects to a running Next.js server for all authentication and data operations.

**IMPORTANT: This is NOT a standalone desktop app**. The desktop app is a lightweight client that:
- Loads the frontend from the Next.js server
- Makes HTTP requests to the server's API routes
- Uses the same MongoDB database as the web version
- Shares authentication (NextAuth) with the web version

The approach follows an incremental strategy: first establishing the Tauri shell that connects to the server, then building optional desktop-specific features like monitoring, focus session management, and notifications.

## Cloud-Based Architecture

**CRITICAL: Desktop App Connects to Server**
- Desktop app is a Tauri webview that loads from the Next.js server
- Development mode: Requires `npm run dev` running, then `cd desktop-app && npm run tauri dev`
- Production mode: Desktop app connects to production server URL
- TWO separate processes: Next.js server + Desktop app
- Both web and desktop use the same MongoDB database and authentication

**Architecture Diagram:**
```
Desktop App (Tauri) → HTTP Requests → Next.js Server → MongoDB
     ↓                                      ↓
  window.__TAURI__                    API Routes
  defined                             /api/auth/*
                                      /api/tasks/*
                                      etc.
```

## Tasks

- [x] 1. Initialize Tauri project structure with cloud-based architecture (COMPLETED)
  - [x] 1.1 Create Tauri project with Rust backend scaffolding
    - Initialize Tauri project in `desktop-app/` directory
    - Set up Cargo.toml with required dependencies
    - Create main.rs with basic application structure
    - _Requirements: 1.1, 1.2_
    - **STATUS**: ✅ COMPLETED
  
  - [x] 1.2 Configure Next.js for cloud-based architecture (CRITICAL - COMPLETED)
    - **IMPORTANT**: Removed `output: 'export'` from next.config.mjs
    - Added CORS headers to allow desktop app to connect
    - Desktop app now connects to running Next.js server
    - API routes are preserved (not removed by static export)
    - _Requirements: 2.1, 2.2_
    - **STATUS**: ✅ COMPLETED - See `DESKTOP_AUTH_FIX.md` for details
  
  - [x] 1.3 Configure Tauri to connect to Next.js server (CRITICAL - COMPLETED)
    - Update tauri.conf.json:
      - Set `devPath` to "http://localhost:3000" (connects to Next.js dev server)
      - Set `distDir` to "../dist" (minimal redirect HTML for production)
      - Removed `beforeDevCommand` (user must start server manually)
      - Removed `beforeBuildCommand` (no build needed)
    - Desktop app loads from server, not static files
    - _Requirements: 1.1, 1.2, 1.3, 2.1_
    - **STATUS**: ✅ COMPLETED
  
  - [x] 1.4 Implement basic window management and system tray
    - Create main window with proper dimensions
    - Implement system tray with menu (show/hide/quit)
    - Handle window close to minimize to tray instead of exit
    - _Requirements: 1.4_
    - **STATUS**: ✅ COMPLETED
  
  - [x] 1.5 Create initial Tauri commands for frontend-backend communication
    - Set up command handler infrastructure
    - Create test commands to verify IPC works
    - Add TypeScript types for Tauri API in Next.js
    - _Requirements: 2.3, 2.5_
    - **STATUS**: ✅ COMPLETED
  
  - [x] 1.6 Implement cloud-based authentication (CRITICAL - COMPLETED)
    - Both web and desktop use NextAuth + MongoDB
    - Desktop app makes HTTP requests to server API routes
    - Session cookies shared between web and desktop
    - Environment detection via `window.__TAURI__` (Tauri v1)
    - CSRF validation disabled in development mode
    - _Requirements: 1.1, 1.2, 1.3_
    - **STATUS**: ✅ COMPLETED - See `DESKTOP_AUTH_FIX.md` for details
  
  - [x] 1.7 Test cloud-based architecture (COMPLETED)
    - Start Next.js server: `npm run dev`
    - Start desktop app: `cd desktop-app && npm run tauri dev`
    - Verify desktop app loads from server
    - Verify authentication works with web credentials
    - Verify data syncs between web and desktop
    - _Requirements: 1.1, 1.2, 1.3_
    - **STATUS**: ✅ COMPLETED - See `DESKTOP_TESTING_CHECKLIST.md`

- [ ] 2. Database layer (DEPRECATED - Using Cloud MongoDB Instead)
  - [x] 2.1 ~~Create database schema with SQLite~~ (DEPRECATED)
    - **CHANGED**: Desktop app now uses cloud MongoDB via API routes
    - No local SQLite database needed
    - All data stored in shared MongoDB database
    - _Requirements: 9.1_
    - **STATUS**: ⚠️ DEPRECATED - Using cloud MongoDB instead

  - [x] 2.2 ~~Implement Database service~~ (DEPRECATED)
    - **CHANGED**: Desktop app makes HTTP requests to Next.js API routes
    - API routes handle all database operations via Prisma
    - No local database service needed in desktop app
    - _Requirements: 9.1, 9.3_
    - **STATUS**: ⚠️ DEPRECATED - Using API routes instead


- [ ] 3. Create platform abstraction layer for monitoring
  - [x] 3.1 Define PlatformMonitor trait and common types
    - Create ApplicationInfo, FocusEvent data structures
    - Define trait interface for platform-specific implementations
    - Set up conditional compilation for different platforms
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Implement Windows monitoring using Win32 API (START HERE FOR WINDOWS)
    - Use GetForegroundWindow and GetWindowThreadProcessId
    - Implement application enumeration
    - Set up focus event subscription with polling
    - Test on Windows 10/11
    - _Requirements: 3.1, 3.2, 11.1, 11.4_

  - [ ] 3.3 Implement macOS monitoring using NSWorkspace (OPTIONAL - FOR MAC SUPPORT)
    - Use NSWorkspace.shared.frontmostApplication
    - Implement application enumeration
    - Set up focus event subscription via notifications
    - Test on macOS 11+
    - _Requirements: 3.1, 3.2, 11.2, 11.4_

  - [ ] 3.4 Implement Linux monitoring using X11/Wayland (OPTIONAL - FOR LINUX SUPPORT)
    - Use X11 _NET_ACTIVE_WINDOW for X11
    - Implement Wayland support where available
    - Implement application enumeration
    - Test on Ubuntu/Fedora
    - _Requirements: 3.1, 3.2, 11.3, 11.4_

- [ ] 4. Implement core monitoring service
  - [x] 4.1 Create MonitoringService with event loop
    - Implement start/stop functionality
    - Set up focus event handling in background thread
    - Integrate with database for activity logging
    - Expose Tauri commands for frontend control
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 4.2 Implement activity log recording with duration tracking
    - Record focus gain events with timestamp
    - Calculate and update duration on focus loss
    - Handle application name changes and multi-window apps
    - Store logs in SQLite database
    - _Requirements: 3.3, 3.4, 3.6_

  - [x] 4.3 Add multi-workspace and virtual desktop support
    - Detect workspace changes on each platform
    - Ensure tracking continues across workspace switches
    - _Requirements: 3.5_
  
  - [x] 4.4 Test monitoring in unified app
    - Start app with `npm run tauri dev`
    - Verify monitoring starts automatically with app
    - Switch between applications and verify tracking works
    - Check database for activity logs
    - _Requirements: 1.1, 3.2, 3.3_

  - [x] 4.5 Implement application enumeration (COMPLETED)
    - List all running applications with visible windows
    - Expose get_active_window and get_running_apps commands
    - Return structured ApplicationInfo data to frontend
    - Create test page at /dev/app-monitor
    - _Requirements: 3.1, 3.2_

- [x] 5. Checkpoint - Basic unified app working
  - Verify unified app launches with one command
  - Verify Next.js UI loads in Tauri window
  - Verify monitoring tracks application focus
  - Verify data is stored in SQLite
  - Ask user if any issues before proceeding

- [ ] 6. Implement application categorization system
  - [x] 6.1 Create default categories for common applications
    - Define default mappings (IDEs → Productive, social media → Distracting, etc.)
    - Implement category lookup with fallback to Neutral
    - Store categories in database
    - _Requirements: 5.1_

  - [x] 6.2 Implement category management Tauri commands
    - Create commands for get/set/list categories
    - Implement custom category creation
    - Add session-scoped category overrides
    - Expose to Next.js frontend via Tauri API
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Implement focus session management
  - [x] 7.1 Create FocusSession data model and manager
    - Define FocusSession structure with productive categories
    - Implement session start/stop/pause/resume
    - Persist sessions to database
    - Expose Tauri commands for session control
    - _Requirements: 6.1, 6.6_

  - [x] 7.2 Implement distraction detection logic
    - Check focused application against productive categories during active session
    - Create DistractionEvent records when distraction detected
    - Track distraction duration
    - _Requirements: 6.2, 6.3_

  - [x] 7.3 Implement session summary generation
    - Calculate total focus time and distraction count
    - Generate application time breakdown
    - Calculate productivity score
    - Return summary to frontend via Tauri command
    - _Requirements: 6.5_

- [ ] 8. Implement notification system
  - [x] 8.1 Create NotificationService with platform-specific APIs
    - Use notify-rust for cross-platform notifications
    - Implement notification settings management
    - Add Do Not Disturb detection
    - _Requirements: 7.1, 7.2, 17.1, 17.2, 17.5_

  - [x] 8.2 Implement distraction notifications with actions
    - Send notification on distraction events
    - Include application name and quick actions
    - Implement follow-up reminders for extended distractions (5+ minutes)
    - _Requirements: 7.1, 7.3, 7.5_

  - [x] 8.3 Add notification history and auto-dismiss
    - Store notification history in memory
    - Implement configurable auto-dismiss timeout
    - Make history accessible from system tray menu
    - _Requirements: 17.3, 17.6_

- [x] 9. Checkpoint - Core features working
  - Verify focus sessions work end-to-end
  - Verify distraction detection triggers notifications
  - Verify all features work in unified app
  - Ask user if any issues before proceeding

- [ ] 10. Implement browser extension and native messaging (OPTIONAL - CAN BE DONE LATER)
  - [ ] 10.1 Create native messaging host in Tauri app
    - Implement stdio-based message protocol
    - Define JSON message schema (TabChange, Ping, GetStatus)
    - Handle messages in separate thread
    - Register native messaging host manifests for Chrome/Firefox
    - _Requirements: 4.1, 13.1, 13.4_

  - [ ] 10.2 Implement browser activity recording
    - Process TabChange messages from extensions
    - Create activity logs with URL and page title
    - Track time per URL
    - Support multiple browsers simultaneously
    - _Requirements: 4.2, 4.3, 4.5, 4.6_

  - [ ] 10.3 Create Chrome browser extension
    - Implement background script with native messaging
    - Track active tab changes
    - Display connection status to desktop app
    - Create popup with website categorization
    - _Requirements: 13.2, 13.3, 13.5, 13.6_

  - [ ] 10.4 Create Firefox browser extension
    - Port Chrome extension to Firefox
    - Use Firefox native messaging API
    - Ensure feature parity with Chrome version
    - _Requirements: 13.2, 13.3, 13.5, 13.6_

- [ ] 11. Implement analytics and reporting
  - [x] 11.1 Create analytics query functions in Rust
    - Implement time range queries (daily, weekly, monthly)
    - Calculate time spent per application and category
    - Generate application usage rankings
    - Expose via Tauri commands
    - _Requirements: 8.1, 8.4_

  - [x] 11.2 Implement productivity score calculation
    - Calculate productive vs distracting time ratio
    - Generate productivity score (0-100)
    - Track trends over time
    - _Requirements: 8.3_

  - [x] 11.3 Implement focus session analytics
    - Calculate session success rates
    - Track distraction patterns
    - Generate session trend data
    - _Requirements: 8.5_

  - [x] 11.4 Create data export functionality
    - Implement CSV export for activity logs
    - Implement JSON export for all user data
    - Add date range filtering
    - Include metadata in exports
    - Expose via Tauri commands
    - _Requirements: 8.6, 18.1, 18.2, 18.3, 18.4_

- [ ] 12. Implement frontend UI components in Next.js
  - [x] 12.1 Create dashboard with real-time monitoring display
    - Show current application and category (via Tauri commands)
    - Display active focus session status
    - Show today's productivity summary
    - Use existing Next.js components and styling
    - _Requirements: 2.2_

  - [x] 12.2 Create focus session management UI
    - Session start dialog with category selection
    - Active session controls (pause/resume/stop)
    - Session summary display after completion
    - Integrate with Tauri commands for session control
    - _Requirements: 6.1, 6.5_

  - [x] 12.3 Create analytics and reports UI
    - Time range selector (daily/weekly/monthly)
    - Application usage charts (reuse existing chart components)
    - Productivity score visualization
    - Focus session history and trends
    - _Requirements: 8.1, 8.2, 8.5_

  - [x] 12.4 Create application categorization UI
    - Application list with current categories
    - Category editor with custom category support
    - Bulk categorization tools
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 12.5 Create settings UI
    - Notification settings
    - Data retention policies
    - Sync service configuration
    - Keyboard shortcut customization
    - Export/import functionality
    - _Requirements: 7.2, 9.4, 10.1, 16.4, 18.1_

- [ ] 13. Checkpoint - MVP complete
  - Verify unified app works end-to-end
  - Test all core features (monitoring, focus sessions, notifications, analytics)
  - Ask user for feedback before proceeding to optional features

- [ ] 14. Implement cloud synchronization service (OPTIONAL - CAN BE DONE LATER)
  - [ ] 14.1 Create SyncService with API client
    - Implement authentication with cloud backend
    - Create sync state tracking
    - Implement opt-in/opt-out functionality
    - Run sync in background thread
    - _Requirements: 10.1, 10.4_

  - [ ] 14.2 Implement periodic sync with conflict resolution
    - Upload new activity logs at configured intervals
    - Download remote changes from cloud
    - Apply last-write-wins conflict resolution
    - Update sync timestamps
    - _Requirements: 10.2, 10.3_

  - [ ] 14.3 Implement offline queue and retry logic
    - Queue sync operations when offline
    - Detect connectivity changes
    - Retry queued operations with exponential backoff
    - _Requirements: 10.5_

- [ ] 15. Implement keyboard shortcuts and global hotkeys (OPTIONAL - CAN BE DONE LATER)
  - [ ] 15.1 Create keyboard shortcut system
    - Register global hotkeys for show/hide window
    - Register global hotkeys for start/stop focus session
    - Register global hotkey for mark intentional break
    - Implement shortcut customization
    - Store shortcuts in database
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ] 15.2 Add shortcut conflict detection
    - Detect conflicts with system shortcuts
    - Notify user of conflicts
    - Provide alternative suggestions
    - _Requirements: 16.6_

- [ ] 16. Implement security and privacy features (OPTIONAL - CAN BE DONE LATER)
  - [ ] 16.1 Add data encryption for sensitive fields
    - Use platform-specific encryption APIs
    - Encrypt URLs and page titles in database
    - Implement secure key storage
    - _Requirements: 9.5_

  - [ ] 16.2 Implement input validation and sanitization
    - Validate all browser extension messages
    - Sanitize URLs and page titles before storing
    - Prevent SQL injection and XSS attacks
    - _Requirements: 14.6_

  - [ ] 16.3 Add network security measures
    - Enforce HTTPS for all cloud communication
    - Implement certificate validation
    - Block third-party network requests
    - _Requirements: 14.4, 14.5_

- [ ] 17. Implement onboarding and first-run experience
  - [ ] 17.1 Create onboarding flow UI
    - Welcome screen with feature overview
    - Permission request screens with explanations
    - Browser extension installation prompts
    - Initial category configuration
    - Focus session tutorial
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ] 17.2 Implement permission request flows
    - Request accessibility permissions (macOS)
    - Request screen recording permissions (macOS)
    - Handle permission denials with guidance
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 17.3 Add skip and revisit functionality
    - Allow skipping onboarding
    - Make onboarding accessible from settings
    - Track onboarding completion state
    - _Requirements: 15.6_

- [ ] 18. Implement error handling and diagnostics
  - [ ] 18.1 Create comprehensive error logging
    - Log all errors and warnings to file in app data directory
    - Include timestamps and stack traces
    - Implement log rotation (keep last 7 days)
    - _Requirements: 20.2_

  - [x] 18.2 Implement database corruption recovery
    - Detect database corruption on startup
    - Create automatic backups before operations
    - Attempt recovery with VACUUM
    - Recreate database if unrecoverable
    - _Requirements: 20.5_

  - [x] 18.3 Create diagnostic tool UI
    - Check system permissions status
    - Verify browser extension connectivity
    - Test database integrity
    - Display system information
    - Accessible from settings
    - _Requirements: 20.3_

  - [ ] 18.4 Implement user-friendly error messages
    - Create error message templates
    - Provide suggested actions for common errors
    - Include "Report Bug" functionality with log attachment
    - _Requirements: 20.1, 20.4_

- [ ] 19. Implement update system (OPTIONAL - CAN BE DONE LATER)
  - [ ] 19.1 Add update checking on startup
    - Query update server for latest version
    - Compare with current version
    - Cache update check results (check once per day)
    - _Requirements: 19.1_

  - [ ] 19.2 Create update notification and installation UI
    - Display update notification with release notes
    - Implement one-click update installation using Tauri updater
    - Show update progress
    - _Requirements: 19.2, 19.3_

  - [ ] 19.3 Implement data preservation during updates
    - Backup database before update
    - Preserve user settings
    - Verify data integrity after update
    - _Requirements: 19.4_

  - [ ] 19.4 Add automatic update configuration
    - Implement auto-update setting in preferences
    - Download and install updates automatically when enabled
    - Notify user after automatic updates
    - _Requirements: 19.5_

- [ ] 20. Implement performance optimizations (OPTIONAL - CAN BE DONE LATER)
  - [ ] 20.1 Optimize monitoring system for low CPU usage
    - Use event-driven architecture where possible
    - Implement efficient polling intervals (1-2 seconds)
    - Minimize CPU wake-ups
    - Profile and optimize hot paths
    - _Requirements: 12.1, 12.4_

  - [ ] 20.2 Implement battery-aware monitoring
    - Detect power state changes
    - Reduce monitoring frequency on battery (5 seconds)
    - Restore full frequency on AC power (1 second)
    - _Requirements: 12.5_

  - [ ] 20.3 Optimize database queries and indexing
    - Add indexes for common query patterns (timestamp, session_id)
    - Use prepared statements for all queries
    - Implement query result caching for analytics
    - _Requirements: 8.1, 12.2_

- [ ] 21. Create platform-specific installers and packaging (OPTIONAL - FOR DISTRIBUTION)
  - [ ] 21.1 Configure Windows installer (MSI/EXE)
    - Set up Tauri bundler for Windows
    - Include all dependencies
    - Configure auto-start on login option
    - Sign executable with code signing certificate
    - _Requirements: 11.5_

  - [ ] 21.2 Configure macOS installer (DMG)
    - Set up Tauri bundler for macOS
    - Create DMG with app bundle
    - Sign application with developer certificate
    - Notarize for Gatekeeper
    - _Requirements: 11.5_

  - [ ] 21.3 Configure Linux packages (AppImage/DEB/RPM)
    - Set up Tauri bundler for Linux
    - Create AppImage for universal compatibility
    - Build DEB package for Debian/Ubuntu
    - Build RPM package for Fedora/RHEL
    - _Requirements: 11.5_

- [ ] 22. Implement Smart Work Profiles & Dynamic Categorization (Requirement 21)
  - [ ] 22.1 Create WorkProfile data model
    - Define default profiles (Web Dev, Game Dev, Art, Writing, etc.)
    - Map specific application categories to each profile
    - Provide a UI for profile selection before session start
  - [ ] 22.2 Implement AppCategorization Engine
    - Create a Rust service that queries Wikidata SPARQL or alternative REST API for unknown application names
    - Cache categorization results in the SQLite database to avoid API limits
    - Parse API response to map to internal tags (e.g. IDE, Utility, Browse, Game)
  - [ ] 22.3 Implement Idle Detection & Tracking
    - Use platform APIs (e.g., GetLastInputInfo on Windows) to track user idle time
    - Differentiate between active productive time and idle time in FocusSession logging
    - Pause distraction warnings if user is purely idle

- [ ] 23. Final checkpoint - Production ready
  - Verify unified app works perfectly
  - Test on target platforms
  - Verify all core features work
  - Ask user for final approval before release

---

## OPTIONAL: Testing Tasks (Can be done anytime after MVP)

The following testing tasks are optional and can be implemented after the core functionality is working. They provide additional confidence in correctness but are not required for initial development.

- [ ]* T1. Write property tests for core functionality
  - [ ]* T1.1 Unified process startup (Property 1)
  - [ ]* T1.2 System tray minimization (Property 3)
  - [ ]* T1.3 SQLite persistence (Property 32)
  - [ ]* T1.4 Database initialization idempotence (Property 34)
  - [ ]* T1.5 Application enumeration completeness (Property 6)
  - [ ]* T1.6 Focus detection latency (Property 7)
  - [ ]* T1.7 Activity log creation (Property 8)
  - [ ]* T1.8 Duration calculation accuracy (Property 9)
  - [ ]* T1.9 Multi-workspace tracking (Property 10)

- [ ]* T2. Write property tests for categorization and sessions
  - [ ]* T2.1 Category persistence round-trip (Property 16)
  - [ ]* T2.2 Custom category support (Property 17)
  - [ ]* T2.3 Session-scoped category overrides (Property 18)
  - [ ]* T2.4 Continuous session monitoring (Property 19)
  - [ ]* T2.5 Distraction detection accuracy (Property 20)
  - [ ]* T2.6 Session summary completeness (Property 22)
  - [ ]* T2.7 Session pause/resume data integrity (Property 23)

- [ ]* T3. Write property tests for notifications and browser integration
  - [ ]* T3.1 Distraction notification timing (Property 21)
  - [ ]* T3.2 Notification content completeness (Property 24)
  - [ ]* T3.3 Notification auto-dismiss (Property 48)
  - [ ]* T3.4 Browser activity recording (Property 11)
  - [ ]* T3.5 URL duration tracking (Property 12)
  - [ ]* T3.6 Multi-browser support (Property 13)
  - [ ]* T3.7 Native messaging protocol compliance (Property 14)
  - [ ]* T3.8 Privacy-preserving tracking (Property 15)

- [ ]* T4. Write property tests for analytics and sync
  - [ ]* T4.1 Report time range accuracy (Property 27)
  - [ ]* T4.2 Productivity score calculation (Property 29)
  - [ ]* T4.3 Data export round-trip (Property 36)
  - [ ]* T4.4 Export performance (Property 37)
  - [ ]* T4.5 Periodic sync execution (Property 38)
  - [ ]* T4.6 Conflict resolution consistency (Property 39)
  - [ ]* T4.7 Offline sync queue (Property 40)

- [ ]* T5. Write property tests for performance and security
  - [ ]* T5.1 CPU usage efficiency (Property 41)
  - [ ]* T5.2 Memory usage efficiency (Property 42)
  - [ ]* T5.3 Battery-aware monitoring (Property 43)
  - [ ]* T5.4 Global shortcut functionality (Property 44)
  - [ ]* T5.5 Shortcut customization persistence (Property 45)
  - [ ]* T5.6 Input sanitization (Property 53)
  - [ ]* T5.7 No third-party data transmission (Property 51)
  - [ ]* T5.8 HTTPS enforcement (Property 52)

- [ ]* T6. Write integration and end-to-end tests
  - [ ]* T6.1 Test first launch through onboarding to monitoring
  - [ ]* T6.2 Test focus session lifecycle with distractions
  - [ ]* T6.3 Test browser extension integration end-to-end
  - [ ]* T6.4 Test sync service with conflict scenarios
  - [ ]* T6.5 Test data export and import round-trip

- [ ]* T7. Write platform-specific tests
  - [ ]* T7.1 Test on Windows 10 and Windows 11
  - [ ]* T7.2 Test on macOS 11+ with permission flows
  - [ ]* T7.3 Test on Ubuntu 20.04+ and Fedora 35+
  - [ ]* T7.4 Verify platform-specific features work correctly

- [ ]* T8. Write performance benchmark tests
  - [ ]* T8.1 Measure and verify startup time < 3 seconds
  - [ ]* T8.2 Measure and verify focus detection latency < 1 second
  - [ ]* T8.3 Measure and verify CPU usage < 5%
  - [ ]* T8.4 Measure and verify memory usage < 150MB
  - [ ]* T8.5 Measure and verify export performance < 10 seconds for 30 days

## Notes

- **Tasks marked with `*` are OPTIONAL** and can be skipped for faster MVP development
- **Testing tasks (T1-T8) are all OPTIONAL** and grouped at the end for later implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Focus on getting the unified app working first, then add tests later
- Platform-specific tasks (3.2-3.4, 21.1-21.3) should be developed on their respective platforms
- Browser extensions (10.3-10.4) are optional and can be developed in parallel after native messaging host
- Cloud sync (14), keyboard shortcuts (15), security features (16), and performance optimizations (20) are all optional

## Cloud-Based Architecture - How It Works

**Development Mode:**
```bash
# Terminal 1: Start Next.js server (REQUIRED)
npm run dev

# Terminal 2: Start desktop app
cd desktop-app
npm run tauri dev
```

This setup:
1. Next.js server runs at localhost:3000 with all API routes
2. Desktop app opens and loads from localhost:3000
3. Desktop app makes HTTP requests to API routes
4. Both use the same MongoDB database
5. Authentication shared via NextAuth session cookies

**Production Mode:**
```bash
# 1. Deploy Next.js to cloud (Vercel, AWS, etc.)
# 2. Update NEXT_PUBLIC_API_URL to production URL
# 3. Build desktop app
cd desktop-app
npm run tauri build
```

This creates:
1. Desktop executable that connects to production server
2. Minimal HTML redirect page bundled in executable
3. All data operations go through cloud server
4. Users need internet connection to use the app

**Key Configuration:**
- `next.config.mjs`: NO `output: 'export'` (preserves API routes), includes CORS headers
- `tauri.conf.json`: `devPath: "http://localhost:3000"` and `distDir: "../dist"`
- `.env.local`: `NEXT_PUBLIC_API_URL="http://localhost:3000"` (or production URL)
- `middleware.ts`: CSRF validation disabled in development mode

**Important Files:**
- `DESKTOP_APP_SETUP.md` - Complete setup guide
- `DESKTOP_AUTH_FIX.md` - Technical details of authentication fix
- `QUICK_START_DESKTOP.md` - Quick start guide
- `START_HERE.md` - Getting started
- `DESKTOP_TESTING_CHECKLIST.md` - Testing guide

This ensures the desktop app connects to the cloud server for all operations, sharing the same database and authentication as the web version.
