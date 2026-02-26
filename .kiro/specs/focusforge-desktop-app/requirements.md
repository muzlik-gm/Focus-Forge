# Requirements Document

## Introduction

FocusForge Desktop Application transforms the existing web-based productivity platform into a unified native desktop application. The system provides seamless integration between the Next.js frontend and a powerful system monitoring backend, delivering real-time focus tracking, distraction detection, and comprehensive activity analytics.

**CRITICAL REQUIREMENT: The application runs as a single unified process** - when you launch the desktop app, both the Next.js frontend and the Rust monitoring backend start together automatically, just like Discord. There are no separate processes to manage, no separate terminal commands to run, and no manual coordination needed. One app, one launch, everything works together.

The application features deep OS integration, browser extension connectivity, and privacy-first local data storage.

## Glossary

- **Desktop_App**: The unified Tauri-based native application that embeds the Next.js frontend and Rust monitoring backend
- **Next_App**: The existing Next.js web application that provides the user interface
- **Monitoring_System**: The Rust-based backend that tracks system activity, application focus, and browser activity
- **Focus_Session**: A user-defined time period with specific productivity goals and application categorizations
- **Application_Category**: Classification of applications as Productive, Neutral, or Distracting
- **Browser_Extension**: Chrome or Firefox extension that tracks website activity and communicates with the Desktop_App
- **Native_Messaging_Host**: The component that enables communication between browser extensions and the Desktop_App
- **System_Tray**: The OS-level tray/notification area where the Desktop_App provides quick access
- **Distraction_Event**: An occurrence where the user switches focus to a non-productive application during a Focus_Session
- **Activity_Log**: Time-stamped record of all application and website usage
- **Local_Database**: SQLite database storing all monitoring data on the user's device
- **Sync_Service**: Optional service that synchronizes local data with the cloud backend
- **Tauri_Command**: IPC mechanism for communication between the Next_App and Monitoring_System

## Requirements

### Requirement 1: Unified Application Launch

**User Story:** As a user, I want to launch FocusForge with a single click and have everything start automatically, so that I don't need to manage multiple processes or terminal windows.

#### Acceptance Criteria

1. WHEN the user launches the Desktop_App executable, THE Desktop_App SHALL start both the Next_App and the Monitoring_System in a single unified process (NOT separate processes)
2. WHEN the Desktop_App starts, THE Desktop_App SHALL display the Next_App interface within 3 seconds
3. WHEN the Desktop_App is running, THE Desktop_App SHALL NOT require any separate terminal commands, separate web servers, or manual process management
4. WHEN a developer runs `npm run tauri dev`, THE command SHALL automatically start BOTH the Next.js dev server AND the Tauri app together in one unified process
5. WHEN the Desktop_App is built for production, THE Next_App SHALL be bundled INSIDE the Tauri executable as a static export (not a separate file or server)
6. WHEN the user closes the Desktop_App window, THE Desktop_App SHALL minimize to the System_Tray rather than exit completely
7. WHEN the user right-clicks the System_Tray icon, THE Desktop_App SHALL display a context menu with options to show/hide window, start focus session, and quit

### Requirement 2: Embedded Next.js Application

**User Story:** As a user, I want the familiar FocusForge web interface embedded in the desktop app, so that I can use all existing features without learning a new interface.

#### Acceptance Criteria

1. THE Desktop_App SHALL serve the Next_App production build locally without requiring external web servers (Next.js static export embedded in Tauri)
2. WHEN the Desktop_App window opens, THE Desktop_App SHALL display the Next_App interface with all existing features functional
3. THE Desktop_App SHALL provide Tauri_Commands for the Next_App to communicate with the Monitoring_System (IPC between frontend and backend)
4. WHEN the Next_App makes API calls to the backend, THE Desktop_App SHALL route requests appropriately between local Monitoring_System (via Tauri commands) and remote cloud services (via HTTP)
5. THE Desktop_App SHALL inject the Tauri client-side API that allows the Next_App to invoke Tauri_Commands from JavaScript/TypeScript
6. THE Next_App SHALL be configured with `output: 'export'` in next.config.js to generate a static build compatible with Tauri
7. THE Tauri configuration SHALL specify `beforeDevCommand` to automatically start the Next.js dev server when running `npm run tauri dev`

### Requirement 3: System-Wide Application Monitoring

**User Story:** As a user, I want the app to track every application I use on my computer, so that I can see accurate analytics of where my time goes.

#### Acceptance Criteria

1. WHEN the Monitoring_System starts, THE Monitoring_System SHALL enumerate all installed applications on the device
2. WHILE the Monitoring_System is running, THE Monitoring_System SHALL detect which application has focus at any moment with less than 1 second latency
3. WHEN an application gains focus, THE Monitoring_System SHALL record a timestamped Activity_Log entry with the application name and process identifier
4. WHEN an application loses focus, THE Monitoring_System SHALL record the duration of focus time for that application
5. THE Monitoring_System SHALL track application usage across all workspaces and virtual desktops
6. THE Monitoring_System SHALL handle application name changes and multi-window applications correctly

### Requirement 4: Browser Activity Tracking

**User Story:** As a user, I want the app to know which websites I visit, so that I can track web-based distractions and productive research time.

#### Acceptance Criteria

1. THE Desktop_App SHALL provide a Native_Messaging_Host that Browser_Extensions can connect to
2. WHEN a Browser_Extension is installed and connected, THE Browser_Extension SHALL send the current URL and page title to the Desktop_App whenever the active tab changes
3. WHEN the Browser_Extension sends website data, THE Monitoring_System SHALL record a timestamped Activity_Log entry with the URL, page title, and browser name
4. WHEN the user switches between browser tabs, THE Monitoring_System SHALL detect the tab change within 1 second
5. THE Monitoring_System SHALL track time spent on each unique URL
6. WHERE the user has multiple browsers installed, THE Monitoring_System SHALL track activity across all connected browsers

### Requirement 5: Application Categorization System

**User Story:** As a user, I want to categorize applications as productive, neutral, or distracting, so that the app knows what counts as focused work for me.

#### Acceptance Criteria

1. THE Desktop_App SHALL provide default Application_Categories for common applications (IDEs as Productive, social media as Distracting, file managers as Neutral)
2. WHEN the user views an application in the interface, THE Desktop_App SHALL display its current Application_Category
3. WHEN the user changes an application's Application_Category, THE Desktop_App SHALL persist the change to the Local_Database
4. THE Desktop_App SHALL allow users to create custom Application_Category definitions beyond the three defaults
5. WHEN a Focus_Session is active, THE Desktop_App SHALL allow temporary category overrides that apply only to that session

### Requirement 6: Focus Session Management

**User Story:** As a user, I want to start a focus session with specific productivity goals, so that the app can alert me when I get distracted.

#### Acceptance Criteria

1. WHEN the user starts a Focus_Session, THE Desktop_App SHALL prompt the user to select which Application_Categories count as productive for this session
2. WHILE a Focus_Session is active, THE Monitoring_System SHALL continuously monitor the focused application
3. WHEN the user switches to an application not in the productive categories, THE Monitoring_System SHALL create a Distraction_Event
4. WHEN a Distraction_Event occurs, THE Desktop_App SHALL display a non-intrusive notification within 1 second
5. WHEN a Focus_Session ends, THE Desktop_App SHALL generate a summary showing total focus time, distraction count, and time breakdown by application
6. THE Desktop_App SHALL allow users to pause and resume Focus_Sessions without losing tracking data

### Requirement 7: Real-Time Distraction Detection

**User Story:** As a user, I want immediate notifications when I lose focus during a session, so that I can quickly get back on track.

#### Acceptance Criteria

1. WHEN a Distraction_Event occurs during a Focus_Session, THE Desktop_App SHALL display a notification within 1 second
2. THE Desktop_App SHALL provide notification customization options including sound, visual style, and message content
3. WHEN a notification is displayed, THE Desktop_App SHALL include the distraction application name and a quick action to return to the last productive application
4. THE Desktop_App SHALL allow users to mark a Distraction_Event as "intentional break" to exclude it from distraction metrics
5. WHERE the user remains in a distracting application for more than 5 minutes, THE Desktop_App SHALL send a follow-up reminder notification

### Requirement 8: Comprehensive Activity Analytics

**User Story:** As a user, I want detailed analytics showing exactly where my time went, so that I can identify patterns and improve my productivity.

#### Acceptance Criteria

1. THE Desktop_App SHALL provide daily, weekly, and monthly activity reports showing time spent in each application
2. WHEN displaying analytics, THE Desktop_App SHALL visualize data with charts showing application usage distribution by category
3. THE Desktop_App SHALL calculate and display productivity scores based on time spent in productive vs distracting applications
4. THE Desktop_App SHALL identify the user's most distracting applications and websites
5. THE Desktop_App SHALL show focus session success rates and trends over time
6. THE Desktop_App SHALL allow users to export Activity_Log data in CSV and JSON formats

### Requirement 9: Local-First Data Storage

**User Story:** As a user, I want my activity data stored locally on my device by default, so that I maintain privacy and control over my information.

#### Acceptance Criteria

1. THE Desktop_App SHALL store all Activity_Log entries in a Local_Database using SQLite
2. THE Desktop_App SHALL function fully offline without requiring internet connectivity
3. WHEN the Desktop_App starts, THE Desktop_App SHALL initialize the Local_Database if it doesn't exist
4. THE Desktop_App SHALL provide configurable data retention policies allowing users to automatically delete Activity_Log entries older than a specified period
5. THE Desktop_App SHALL encrypt sensitive data in the Local_Database using platform-specific encryption APIs
6. THE Desktop_App SHALL provide a data export feature that allows users to extract all their data from the Local_Database

### Requirement 10: Optional Cloud Synchronization

**User Story:** As a user, I want the option to sync my data to the cloud, so that I can access my analytics from multiple devices.

#### Acceptance Criteria

1. THE Desktop_App SHALL provide an opt-in Sync_Service that synchronizes Local_Database data with the cloud backend
2. WHEN the Sync_Service is enabled, THE Desktop_App SHALL upload new Activity_Log entries to the cloud backend at configurable intervals
3. WHEN the Sync_Service detects conflicts between local and cloud data, THE Desktop_App SHALL resolve conflicts using a last-write-wins strategy
4. THE Desktop_App SHALL allow users to disable the Sync_Service and delete all cloud-stored data
5. WHEN the device is offline, THE Desktop_App SHALL queue sync operations and retry when connectivity is restored

### Requirement 11: Cross-Platform Support

**User Story:** As a user, I want FocusForge to work on my operating system, so that I can use it regardless of my platform choice.

#### Acceptance Criteria

1. THE Desktop_App SHALL run on Windows 10 and Windows 11 with full feature support
2. THE Desktop_App SHALL run on macOS 11 (Big Sur) and later with full feature support
3. THE Desktop_App SHALL run on Ubuntu 20.04+ and Fedora 35+ with full feature support
4. WHEN running on different platforms, THE Desktop_App SHALL use platform-specific APIs for application monitoring (Windows: Win32 API, macOS: NSWorkspace, Linux: X11/Wayland)
5. THE Desktop_App SHALL provide platform-specific installers (Windows: MSI/EXE, macOS: DMG, Linux: AppImage/DEB/RPM)
6. THE Desktop_App SHALL respect platform-specific UI conventions and design patterns

### Requirement 12: Performance and Resource Efficiency

**User Story:** As a user, I want the app to run efficiently in the background, so that it doesn't slow down my computer or drain my laptop battery.

#### Acceptance Criteria

1. WHILE running in the background, THE Desktop_App SHALL consume less than 5% CPU on average
2. THE Desktop_App SHALL use less than 150MB of RAM during normal operation
3. WHEN the Desktop_App starts, THE Desktop_App SHALL complete initialization within 3 seconds
4. THE Monitoring_System SHALL use efficient polling intervals and event-driven architecture to minimize CPU wake-ups
5. THE Desktop_App SHALL implement battery-aware behavior that reduces monitoring frequency when on battery power
6. THE Desktop_App SHALL not cause perceptible lag or delay in other applications

### Requirement 13: Browser Extension Integration

**User Story:** As a developer, I want browser extensions that communicate with the desktop app, so that website tracking works seamlessly.

#### Acceptance Criteria

1. THE Desktop_App SHALL provide a Native_Messaging_Host manifest for Chrome and Firefox
2. THE Browser_Extension SHALL detect when the Desktop_App is running and display connection status
3. WHEN the Browser_Extension cannot connect to the Desktop_App, THE Browser_Extension SHALL display a helpful error message with troubleshooting steps
4. THE Browser_Extension SHALL send website activity data using a defined JSON protocol over native messaging
5. THE Browser_Extension SHALL respect user privacy by only tracking active tab URLs, not all open tabs
6. THE Browser_Extension SHALL provide a popup interface showing current categorization of the active website

### Requirement 14: System Permissions and Security

**User Story:** As a user, I want clear permission requests and secure data handling, so that I trust the app with my activity data.

#### Acceptance Criteria

1. WHEN the Desktop_App first launches, THE Desktop_App SHALL request necessary OS permissions (accessibility, screen recording on macOS)
2. THE Desktop_App SHALL provide clear explanations for why each permission is needed
3. IF required permissions are denied, THEN THE Desktop_App SHALL display which features are unavailable and how to grant permissions
4. THE Desktop_App SHALL never transmit Activity_Log data to third parties
5. THE Desktop_App SHALL use secure HTTPS connections for all cloud backend communication
6. THE Desktop_App SHALL validate and sanitize all data received from Browser_Extensions to prevent injection attacks

### Requirement 15: User Onboarding and Setup

**User Story:** As a new user, I want a guided setup process, so that I can quickly configure the app and understand its features.

#### Acceptance Criteria

1. WHEN the Desktop_App launches for the first time, THE Desktop_App SHALL display an onboarding flow
2. THE Desktop_App SHALL guide users through granting necessary system permissions
3. THE Desktop_App SHALL prompt users to install Browser_Extensions with direct download links
4. THE Desktop_App SHALL allow users to configure initial Application_Categories during onboarding
5. THE Desktop_App SHALL offer a quick tutorial on starting a Focus_Session
6. THE Desktop_App SHALL allow users to skip onboarding and access it later from settings

### Requirement 16: Keyboard Shortcuts and Quick Actions

**User Story:** As a power user, I want keyboard shortcuts for common actions, so that I can control the app without using the mouse.

#### Acceptance Criteria

1. THE Desktop_App SHALL provide a global keyboard shortcut to show/hide the main window
2. THE Desktop_App SHALL provide a global keyboard shortcut to start/stop a Focus_Session
3. THE Desktop_App SHALL provide a global keyboard shortcut to mark the current activity as an intentional break
4. THE Desktop_App SHALL allow users to customize all keyboard shortcuts
5. WHEN a keyboard shortcut is triggered, THE Desktop_App SHALL respond within 500 milliseconds
6. THE Desktop_App SHALL prevent keyboard shortcut conflicts with other applications

### Requirement 17: Notification System

**User Story:** As a user, I want customizable notifications that don't disrupt my flow, so that I stay informed without being annoyed.

#### Acceptance Criteria

1. THE Desktop_App SHALL use native OS notification APIs for all alerts
2. THE Desktop_App SHALL provide notification settings including enable/disable, sound, and display duration
3. WHEN a notification is displayed, THE Desktop_App SHALL automatically dismiss it after a configurable timeout
4. THE Desktop_App SHALL support notification actions (e.g., "Return to work", "Take a break", "Dismiss")
5. THE Desktop_App SHALL respect OS-level Do Not Disturb settings
6. THE Desktop_App SHALL provide a notification history accessible from the System_Tray menu

### Requirement 18: Data Export and Portability

**User Story:** As a user, I want to export my data in standard formats, so that I can analyze it with other tools or migrate to another service.

#### Acceptance Criteria

1. THE Desktop_App SHALL provide an export feature that generates CSV files of Activity_Log data
2. THE Desktop_App SHALL provide an export feature that generates JSON files of all user data including settings and categories
3. WHEN exporting data, THE Desktop_App SHALL allow users to select date ranges for the export
4. THE Desktop_App SHALL include metadata in exports (export date, app version, data schema version)
5. THE Desktop_App SHALL complete exports of 30 days of data within 10 seconds

### Requirement 19: Application Updates

**User Story:** As a user, I want automatic update notifications, so that I always have the latest features and security fixes.

#### Acceptance Criteria

1. WHEN the Desktop_App starts, THE Desktop_App SHALL check for available updates from the update server
2. WHEN an update is available, THE Desktop_App SHALL display a notification with release notes
3. THE Desktop_App SHALL allow users to download and install updates with a single click
4. WHEN an update is being installed, THE Desktop_App SHALL preserve all Local_Database data and user settings
5. THE Desktop_App SHALL provide an option to enable automatic updates without user confirmation

### Requirement 20: Error Handling and Diagnostics

**User Story:** As a user, I want helpful error messages and diagnostic tools, so that I can troubleshoot issues or report bugs effectively.

#### Acceptance Criteria

1. WHEN an error occurs, THE Desktop_App SHALL display a user-friendly error message with suggested actions
2. THE Desktop_App SHALL log all errors and warnings to a local log file
3. THE Desktop_App SHALL provide a diagnostic tool that checks system permissions, browser extension connectivity, and database integrity
4. THE Desktop_App SHALL include a "Report Bug" feature that collects relevant diagnostic information (with user consent)
5. IF the Local_Database becomes corrupted, THEN THE Desktop_App SHALL attempt automatic recovery and notify the user of the outcome

### Requirement 21: Smart Work Profiles & Dynamic Categorization

**User Story:** As a user, I want to select a specific type of work (e.g., Game Dev, Web Dev, Art) and have the app automatically discover installed/running applications, mapping them to my productive profile using global free APIs, while intelligently understanding when I am idle.

#### Acceptance Criteria

1. THE Desktop_App SHALL provide a UI to select a "Work Profile" (e.g., Game Dev, Web Dev, Content Creation, Art, Writing) before starting a Focus Session.
2. WHEN a Work Profile is selected, THE Desktop_App and Monitoring_System SHALL utilize an automatic categorization engine to map currently running applications to their appropriate categories.
3. THE Categorization Engine SHALL attempt to identify the nature of unrecognized applications using a global free API endpoint (such as Wikidata SPARQL or a public directory lookup) and caching the result locally.
4. THE Monitoring_System SHALL track "idle" states within applications (e.g., no mouse/keyboard input for X minutes) and differentiate "active productive time" from "idle time" in the Activity Logs.
5. THE Desktop_App SHALL allow the user to review the automatically assigned application categories and override them manually if the global API's classification is incorrect.
