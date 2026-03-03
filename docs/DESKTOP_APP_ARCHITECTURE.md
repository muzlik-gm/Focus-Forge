# Forgrin Desktop Application Architecture

## Overview
Transform Forgrin into a native desktop application with deep system monitoring capabilities for comprehensive focus tracking and distraction detection.

## Technology Stack

### Desktop Framework
- **Electron** or **Tauri** (recommended for better performance and security)
  - Tauri: Rust-based, smaller bundle size, better security, native performance
  - Electron: More mature ecosystem, easier development

### System Monitoring
- **Windows**: Win32 API, PowerShell, WMI (Windows Management Instrumentation)
- **macOS**: Accessibility API, NSWorkspace, Screen Time API
- **Linux**: X11/Wayland, D-Bus, proc filesystem

## Core Features

### 1. Application Monitoring
```typescript
interface ApplicationActivity {
  processName: string;
  windowTitle: string;
  executablePath: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  category: 'productive' | 'neutral' | 'distracting' | 'unknown';
  isFullscreen: boolean;
}
```

**Implementation:**
- Monitor active window changes
- Track foreground application
- Capture window titles
- Measure time spent per application
- Detect idle time

### 2. Website Monitoring
```typescript
interface WebsiteActivity {
  url: string;
  domain: string;
  title: string;
  browser: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  category: 'productive' | 'neutral' | 'distracting' | 'unknown';
}
```

**Implementation:**
- Browser extension integration (Chrome, Firefox, Edge, Safari)
- Native messaging host for browser communication
- URL pattern matching
- Domain categorization

### 3. Focus Loss Detection
```typescript
interface FocusLossEvent {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: 'app_switch' | 'website_change' | 'idle' | 'notification' | 'manual';
  fromApp?: string;
  toApp?: string;
  fromUrl?: string;
  toUrl?: string;
  severity: 'low' | 'medium' | 'high';
  autoDetected: boolean;
}
```

**Detection Rules:**
- Switch from productive app to distracting app
- Navigate from work-related site to social media
- Idle time exceeding threshold
- Frequent context switching (>3 switches per minute)
- Opening communication apps during focus time

### 4. Application Categorization System
```typescript
interface AppCategory {
  name: string;
  type: 'productive' | 'neutral' | 'distracting';
  patterns: string[]; // Regex patterns for matching
  domains?: string[]; // For web apps
  userDefined: boolean;
}

// Pre-defined categories
const DEFAULT_CATEGORIES = {
  productive: [
    'Visual Studio Code', 'IntelliJ IDEA', 'PyCharm', 'Sublime Text',
    'Terminal', 'iTerm', 'Postman', 'Docker', 'Figma', 'Notion'
  ],
  distracting: [
    'Facebook', 'Twitter', 'Instagram', 'TikTok', 'YouTube',
    'Reddit', 'Netflix', 'Twitch', 'Discord', 'Slack' // configurable
  ],
  neutral: [
    'Finder', 'File Explorer', 'System Preferences', 'Settings'
  ]
};
```

### 5. Focus Session Configuration
```typescript
interface FocusSessionConfig {
  id: string;
  name: string;
  duration: number; // minutes
  allowedApps: string[];
  allowedDomains: string[];
  blockedApps: string[];
  blockedDomains: string[];
  breakReminders: boolean;
  breakInterval: number; // minutes
  strictMode: boolean; // Block distracting apps
  notificationSettings: {
    onFocusLoss: boolean;
    onAppSwitch: boolean;
    onDistractingSite: boolean;
    sound: boolean;
    desktop: boolean;
  };
}
```

## System Architecture

### Desktop Application Structure
```
forgrin-desktop/
├── src/
│   ├── main/                    # Main process (Node.js/Rust)
│   │   ├── index.ts
│   │   ├── monitoring/
│   │   │   ├── app-monitor.ts   # Application monitoring
│   │   │   ├── web-monitor.ts   # Website monitoring
│   │   │   ├── idle-detector.ts # Idle time detection
│   │   │   └── focus-analyzer.ts # Focus loss analysis
│   │   ├── system/
│   │   │   ├── windows.ts       # Windows-specific APIs
│   │   │   ├── macos.ts         # macOS-specific APIs
│   │   │   └── linux.ts         # Linux-specific APIs
│   │   ├── api/
│   │   │   └── sync.ts          # Sync with web backend
│   │   └── notifications/
│   │       └── notifier.ts      # System notifications
│   ├── renderer/                # UI (React/Next.js)
│   │   └── [existing web app]
│   └── preload/                 # Preload scripts
│       └── index.ts
├── browser-extension/           # Browser monitoring
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── native-host.js
└── native/                      # Native modules (if needed)
    ├── windows/
    ├── macos/
    └── linux/
```

### Data Flow
```
1. System Monitor → Detect Activity
2. Activity Analyzer → Categorize & Score
3. Focus Engine → Detect Focus Loss
4. Notification Service → Alert User
5. Data Sync → Upload to Backend
6. Analytics Engine → Generate Insights
```

## Implementation Phases

### Phase 1: Core Desktop App (Week 1-2)
- [ ] Set up Tauri/Electron project
- [ ] Embed existing web app
- [ ] Implement basic window management
- [ ] Add system tray integration
- [ ] Create auto-start functionality

### Phase 2: Application Monitoring (Week 3-4)
- [ ] Implement active window detection (Windows)
- [ ] Implement active window detection (macOS)
- [ ] Implement active window detection (Linux)
- [ ] Track application usage time
- [ ] Store activity data locally (SQLite)
- [ ] Create application categorization UI

### Phase 3: Website Monitoring (Week 5-6)
- [ ] Build browser extension (Chrome)
- [ ] Build browser extension (Firefox)
- [ ] Implement native messaging host
- [ ] Track website visits and duration
- [ ] Categorize websites
- [ ] Integrate with app monitoring

### Phase 4: Focus Loss Detection (Week 7-8)
- [ ] Implement focus loss algorithms
- [ ] Create notification system
- [ ] Add real-time alerts
- [ ] Build focus loss analytics
- [ ] Implement severity scoring
- [ ] Add user feedback mechanism

### Phase 5: Advanced Features (Week 9-10)
- [ ] Strict mode (app blocking)
- [ ] Break reminders
- [ ] Productivity scoring
- [ ] AI-powered insights
- [ ] Custom rules engine
- [ ] Team features integration

### Phase 6: Polish & Release (Week 11-12)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Privacy controls
- [ ] Auto-update system
- [ ] Installer creation
- [ ] Documentation

## Privacy & Security Considerations

### Data Collection
- **Local-first**: All monitoring data stored locally by default
- **Opt-in sync**: Users choose what to sync to cloud
- **Encryption**: All sensitive data encrypted at rest
- **Anonymization**: Personal data anonymized before analytics

### Permissions Required
- **Windows**: 
  - UIAccess for window monitoring
  - Registry access for installed apps
- **macOS**: 
  - Accessibility permissions
  - Screen Recording (for screenshots, optional)
- **Linux**: 
  - X11/Wayland access
  - D-Bus access

### User Controls
- Pause monitoring anytime
- Exclude specific apps/websites
- Delete history
- Export data
- Disable specific features

## API Endpoints (Backend Updates)

### New Endpoints Needed
```typescript
// Activity tracking
POST /api/desktop/activity/sync
POST /api/desktop/activity/batch

// Focus loss events
POST /api/desktop/focus-loss
GET /api/desktop/focus-loss/patterns

// Application management
GET /api/desktop/apps/categories
POST /api/desktop/apps/categorize
PUT /api/desktop/apps/:id/category

// Configuration
GET /api/desktop/config
PUT /api/desktop/config
```

## Database Schema Updates

```prisma
model DesktopActivity {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String   @db.ObjectId
  user          User     @relation(fields: [userId], references: [id])
  sessionId     String?  @db.ObjectId
  session       FocusSession? @relation(fields: [sessionId], references: [id])
  
  type          String   // 'app' | 'website'
  name          String   // App name or domain
  title         String?  // Window title or page title
  category      String   // 'productive' | 'neutral' | 'distracting'
  
  startTime     DateTime
  endTime       DateTime?
  duration      Int      // seconds
  
  metadata      Json?    // Additional data
  createdAt     DateTime @default(now())
}

model FocusLossEvent {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String   @db.ObjectId
  user          User     @relation(fields: [userId], references: [id])
  sessionId     String   @db.ObjectId
  session       FocusSession @relation(fields: [sessionId], references: [id])
  
  timestamp     DateTime
  type          String   // 'app_switch' | 'website_change' | 'idle'
  severity      String   // 'low' | 'medium' | 'high'
  
  fromApp       String?
  toApp         String?
  fromUrl       String?
  toUrl         String?
  
  autoDetected  Boolean  @default(true)
  acknowledged  Boolean  @default(false)
  
  createdAt     DateTime @default(now())
}

model AppCategory {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String   @db.ObjectId
  user          User     @relation(fields: [userId], references: [id])
  
  name          String
  type          String   // 'productive' | 'neutral' | 'distracting'
  patterns      String[] // Regex patterns
  domains       String[] // For web apps
  userDefined   Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Technical Challenges & Solutions

### Challenge 1: Cross-Platform Compatibility
**Solution**: Abstract platform-specific code behind interfaces, use conditional compilation

### Challenge 2: Performance Impact
**Solution**: 
- Efficient polling intervals (1-5 seconds)
- Background thread for monitoring
- Batch data processing
- Local caching

### Challenge 3: Browser Integration
**Solution**: 
- Browser extensions with native messaging
- Fallback to network traffic analysis (advanced)

### Challenge 4: Privacy Concerns
**Solution**:
- Transparent data collection
- User controls
- Local-first architecture
- Open source monitoring code

### Challenge 5: App Blocking (Strict Mode)
**Solution**:
- Windows: Process termination, window hiding
- macOS: Parental Controls API
- Linux: Process signals, window manager integration

## Competitive Analysis

### Similar Tools
- **RescueTime**: Automatic time tracking, lacks real-time intervention
- **Freedom**: Website/app blocking, no detailed analytics
- **Cold Turkey**: Aggressive blocking, Windows/Mac only
- **Toggl Track**: Manual tracking, no automatic detection
- **ActivityWatch**: Open source, basic tracking

### Forgrin Advantages
- ✅ Real-time focus loss detection
- ✅ AI-powered insights
- ✅ Team collaboration features
- ✅ Beautiful, modern UI
- ✅ Cross-platform support
- ✅ Privacy-focused
- ✅ Integrated with web app

## Next Steps

1. **Prototype** (1 week): Build basic Tauri app with window monitoring
2. **User Testing** (1 week): Test with 10-20 beta users
3. **Iterate** (2 weeks): Refine based on feedback
4. **Launch** (1 week): Release desktop app alongside web app

## Resources Needed

- **Development**: 2 full-stack developers (12 weeks)
- **Design**: UI/UX for desktop-specific features
- **Testing**: QA across Windows, macOS, Linux
- **Infrastructure**: Desktop app distribution (auto-updates)

## Success Metrics

- Desktop app adoption rate: >40% of users
- Focus loss detection accuracy: >85%
- User satisfaction: >4.5/5 stars
- Performance: <50MB RAM, <5% CPU
- Privacy compliance: 100% GDPR compliant
