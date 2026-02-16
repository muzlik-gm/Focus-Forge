# Design Document: FocusForge

## Overview

FocusForge is a full-stack SaaS web application built with Next.js 14 (App Router), TypeScript, and PostgreSQL. The system architecture follows a modern server-side rendering approach with strategic client-side interactivity for real-time features like the focus timer and drag-and-drop task management.

The application is structured around five core domains:
1. **Authentication & User Management** - NextAuth-based authentication with session management
2. **Focus Session Engine** - Timer mechanism with pause/resume and distraction logging
3. **Task Management System** - Kanban board with drag-and-drop and filtering
4. **Analytics Engine** - Data aggregation and visualization of productivity metrics
5. **Team Collaboration** - Workspace management with real-time status updates

The design prioritizes:
- **Performance**: Server Components by default, Client Components only when necessary
- **Type Safety**: End-to-end TypeScript with Prisma for database type safety
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and ARIA labels
- **Scalability**: Stateless API design with database-backed sessions
- **Security**: CSRF protection, rate limiting, input validation, and secure session handling

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │  Dashboard   │  │  Deep Work   │      │
│  │     Page     │  │     Page     │  │     Page     │ ...  │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Components (RSC)                  │   │
│  │  - Data fetching  - Initial rendering  - SEO         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             Client Components (Islands)               │   │
│  │  - Timer  - Drag-drop  - Modals  - Animations       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │  Tasks   │  │ Sessions │  │Analytics │    │
│  │   API    │  │   API    │  │   API    │  │   API    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services: Auth, Timer, Tasks, Analytics, Team       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Validation: Zod schemas for input validation        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                      Data Access Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma ORM Client                        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    PostgreSQL Database                       │
│  Tables: User, Workspace, Task, FocusSession,               │
│          WeeklyReview, Subscription, ApiKey                 │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Rationale

**Frontend Framework: Next.js 14 (App Router)**
- Server Components reduce JavaScript bundle size
- Built-in routing with file-system based structure
- Streaming and Suspense for progressive loading
- Image optimization out of the box
- Edge-ready deployment on Vercel

**Styling: Tailwind CSS + Shadcn UI**
- Utility-first approach for rapid development
- Consistent design system through configuration
- Shadcn provides accessible, customizable components
- Dark mode support via Tailwind's dark: variant

**Animation: Framer Motion**
- Declarative animation API
- Spring physics for natural motion
- Layout animations for smooth transitions
- Gesture support for drag interactions

**Database: PostgreSQL + Prisma**
- Relational data model fits the domain well
- Prisma provides type-safe database access
- Migration system for schema evolution
- Connection pooling for scalability

**Authentication: NextAuth.js**
- Industry-standard OAuth flows
- Session management with secure cookies
- Extensible with custom providers
- CSRF protection built-in

**Payments: Stripe**
- Hosted checkout for PCI compliance
- Webhook system for subscription events
- Customer portal for self-service billing
- Support for multiple subscription tiers

## Components and Interfaces

### Core Domain Models

#### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  subscriptionTier: 'FREE' | 'PRO' | 'TEAM';
  workspaceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Workspace Model
```typescript
interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members: User[];
}
```

#### Task Model
```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes: number | null;
  tags: string[];
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
```

#### FocusSession Model
```typescript
interface FocusSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number;
  pausedMinutes: number;
  distractionCount: number;
  distractions: Distraction[];
  notes: string | null;
  completed: boolean;
  createdAt: Date;
}

interface Distraction {
  timestamp: Date;
  note: string | null;
}
```

#### WeeklyReview Model
```typescript
interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: Date;
  totalFocusMinutes: number;
  tasksCompleted: number;
  averageDistractions: number;
  reflection: string | null;
  aiSummary: string | null;
  createdAt: Date;
}
```

### API Endpoints

#### Authentication API
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
interface RegisterResponse {
  user: { id: string; email: string; name: string };
}

// POST /api/auth/login (handled by NextAuth)
// POST /api/auth/logout (handled by NextAuth)
```

#### Tasks API
```typescript
// GET /api/tasks
interface GetTasksRequest {
  status?: 'BACKLOG' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags?: string[];
}
interface GetTasksResponse {
  tasks: Task[];
}

// POST /api/tasks
interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  tags?: string[];
}
interface CreateTaskResponse {
  task: Task;
}

// PATCH /api/tasks/[id]
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'BACKLOG' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  tags?: string[];
  order?: number;
}
interface UpdateTaskResponse {
  task: Task;
}

// DELETE /api/tasks/[id]
interface DeleteTaskResponse {
  success: boolean;
}
```

#### Focus Sessions API
```typescript
// POST /api/sessions/start
interface StartSessionRequest {
  durationMinutes: number;
}
interface StartSessionResponse {
  session: FocusSession;
}

// POST /api/sessions/[id]/pause
interface PauseSessionResponse {
  session: FocusSession;
}

// POST /api/sessions/[id]/resume
interface ResumeSessionResponse {
  session: FocusSession;
}

// POST /api/sessions/[id]/stop
interface StopSessionRequest {
  notes?: string;
}
interface StopSessionResponse {
  session: FocusSession;
}

// POST /api/sessions/[id]/distraction
interface LogDistractionRequest {
  note?: string;
}
interface LogDistractionResponse {
  session: FocusSession;
}

// GET /api/sessions
interface GetSessionsRequest {
  startDate?: string;
  endDate?: string;
  limit?: number;
}
interface GetSessionsResponse {
  sessions: FocusSession[];
}
```

#### Analytics API
```typescript
// GET /api/analytics/dashboard
interface DashboardAnalyticsResponse {
  todayFocusMinutes: number;
  todayTasksCompleted: number;
  activeStreakDays: number;
  todayDistractions: number;
  weeklyFocusData: { date: string; minutes: number }[];
}

// GET /api/analytics/weekly
interface WeeklyAnalyticsRequest {
  weekStartDate: string;
}
interface WeeklyAnalyticsResponse {
  totalFocusMinutes: number;
  dailyBreakdown: { date: string; minutes: number }[];
  distractionHeatmap: { day: string; hour: number; count: number }[];
  focusByTimeOfDay: { hour: number; minutes: number }[];
}

// GET /api/analytics/monthly
interface MonthlyAnalyticsRequest {
  month: string; // YYYY-MM
}
interface MonthlyAnalyticsResponse {
  currentMonth: { date: string; minutes: number }[];
  previousMonth: { date: string; minutes: number }[];
  totalCurrentMonth: number;
  totalPreviousMonth: number;
}
```

#### Team API
```typescript
// GET /api/team/members
interface GetTeamMembersResponse {
  members: {
    id: string;
    name: string;
    email: string;
    status: 'AVAILABLE' | 'IN_FOCUS' | 'OFFLINE';
    currentSessionId: string | null;
  }[];
}

// GET /api/team/leaderboard
interface GetLeaderboardRequest {
  weekStartDate: string;
}
interface GetLeaderboardResponse {
  leaderboard: {
    userId: string;
    name: string;
    focusMinutes: number;
    rank: number;
    trend: 'UP' | 'DOWN' | 'SAME';
  }[];
}

// POST /api/team/invite
interface InviteTeamMemberRequest {
  email: string;
}
interface InviteTeamMemberResponse {
  invitationId: string;
  invitationLink: string;
}
```

### Component Architecture

#### Page Components (Server Components)
```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await getServerSession();
  const analytics = await getDashboardAnalytics(session.user.id);
  const tasks = await getTodayTasks(session.user.id);
  
  return (
    <DashboardLayout>
      <MetricsGrid analytics={analytics} />
      <TodayTasksList tasks={tasks} />
      <WeeklyFocusChart data={analytics.weeklyFocusData} />
    </DashboardLayout>
  );
}
```

#### Interactive Components (Client Components)
```typescript
// components/timer/FocusTimer.tsx
'use client';

interface FocusTimerProps {
  sessionId: string;
  initialDuration: number;
}

export function FocusTimer({ sessionId, initialDuration }: FocusTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isPaused, setIsPaused] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  
  // Timer logic with useEffect
  // Pause/Resume handlers
  // Distraction logging
  
  return (
    <div className="timer-container">
      <TimerDisplay time={timeRemaining} />
      <TimerControls 
        isPaused={isPaused}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
      />
      <DistractionLogger 
        count={distractionCount}
        onLog={handleLogDistraction}
      />
    </div>
  );
}
```

#### Shared UI Components
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// components/ui/Card.tsx
interface CardProps {
  variant: 'standard' | 'stats' | 'task' | 'session';
  children: React.ReactNode;
  className?: string;
}

// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

### State Management Strategy

**Server State (Database-backed)**
- User data, tasks, sessions, analytics
- Fetched via Server Components or API routes
- Cached with Next.js cache and revalidation

**Client State (React hooks)**
- Timer state (current time, paused status)
- UI state (modals open/closed, filters selected)
- Form state (input values, validation errors)

**Optimistic Updates**
- Task status changes update UI immediately
- Background API call syncs with database
- Rollback on error with toast notification

**Real-time Updates**
- Team member status via polling (every 30s)
- Alternative: WebSocket for true real-time (future enhancement)

## Data Models

### Database Schema (Prisma)

```prisma
model User {
  id                String          @id @default(cuid())
  email             String          @unique
  name              String
  passwordHash      String
  subscriptionTier  SubscriptionTier @default(FREE)
  workspaceId       String?
  workspace         Workspace?      @relation(fields: [workspaceId], references: [id])
  tasks             Task[]
  focusSessions     FocusSession[]
  weeklyReviews     WeeklyReview[]
  apiKeys           ApiKey[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([email])
  @@index([workspaceId])
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  ownerId   String
  members   User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([ownerId])
}

model Task {
  id               String       @id @default(cuid())
  title            String
  description      String?
  status           TaskStatus   @default(BACKLOG)
  priority         TaskPriority @default(MEDIUM)
  estimatedMinutes Int?
  tags             String[]
  order            Int          @default(0)
  userId           String
  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  completedAt      DateTime?
  
  @@index([userId, status])
  @@index([userId, createdAt])
}

model FocusSession {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startTime        DateTime @default(now())
  endTime          DateTime?
  durationMinutes  Int
  pausedMinutes    Int      @default(0)
  distractionCount Int      @default(0)
  distractions     Json     @default("[]")
  notes            String?
  completed        Boolean  @default(false)
  createdAt        DateTime @default(now())
  
  @@index([userId, startTime])
  @@index([userId, completed])
}

model WeeklyReview {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  weekStartDate       DateTime
  totalFocusMinutes   Int
  tasksCompleted      Int
  averageDistractions Float
  reflection          String?
  aiSummary           String?
  createdAt           DateTime @default(now())
  
  @@unique([userId, weekStartDate])
  @@index([userId, weekStartDate])
}

model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  keyHash   String   @unique
  lastUsed  DateTime?
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([keyHash])
}

enum SubscriptionTier {
  FREE
  PRO
  TEAM
}

enum TaskStatus {
  BACKLOG
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Data Relationships

- **User → Workspace**: Many-to-One (a user belongs to one workspace)
- **Workspace → Users**: One-to-Many (a workspace has many members)
- **User → Tasks**: One-to-Many (a user has many tasks)
- **User → FocusSessions**: One-to-Many (a user has many sessions)
- **User → WeeklyReviews**: One-to-Many (a user has many reviews)
- **User → ApiKeys**: One-to-Many (a user can have multiple API keys)

### Data Access Patterns

**Dashboard Page**
1. Fetch today's focus sessions → Calculate total minutes
2. Fetch today's completed tasks → Count
3. Fetch all sessions → Calculate streak
4. Fetch last 7 days sessions → Build weekly graph

**Analytics Page**
1. Fetch sessions for date range → Aggregate by day
2. Fetch sessions with distractions → Build heatmap
3. Fetch sessions → Group by hour of day

**Tasks Page**
1. Fetch all user tasks → Filter by status/priority/tags
2. Order by `order` field within each status column

**Team Page**
1. Fetch workspace members
2. Fetch active sessions → Determine member status
3. Fetch week's sessions → Calculate leaderboard

### Caching Strategy

**Static Data (ISR - Incremental Static Regeneration)**
- Landing page (revalidate: 3600s)
- Pricing page (revalidate: 3600s)

**Dynamic Data (Server Components with cache)**
- Dashboard analytics (revalidate: 60s)
- Task lists (revalidate: 30s)
- Team leaderboard (revalidate: 300s)

**Real-time Data (Client-side polling)**
- Active timer state (no cache)
- Team member status (poll every 30s)

**Mutation Revalidation**
- After task update → revalidate `/api/tasks`
- After session complete → revalidate `/api/analytics/dashboard`
- After team invite → revalidate `/api/team/members`


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and Security Properties

**Property 1: Password Encryption**
*For any* valid user registration with a password, the stored password in the database should be a bcrypt hash, not the plaintext password.
**Validates: Requirements 1.1, 13.1**

**Property 2: Session Creation on Login**
*For any* valid login attempt with correct credentials, the system should create a session token and return it in a secure HTTP-only cookie.
**Validates: Requirements 1.2, 13.2**

**Property 3: Session Invalidation on Logout**
*For any* authenticated user who logs out, subsequent requests with the same session token should be rejected as unauthorized.
**Validates: Requirements 1.4**

**Property 4: CSRF Protection**
*For any* authenticated POST/PUT/DELETE request without a valid CSRF token, the system should reject the request with a 403 error.
**Validates: Requirements 1.5**

**Property 5: Rate Limiting**
*For any* sequence of authentication attempts from the same IP address, if the count exceeds the rate limit threshold within the time window, subsequent attempts should be rejected with a 429 error.
**Validates: Requirements 1.6**

**Property 6: Input Sanitization**
*For any* user input containing potential injection patterns (SQL, XSS), the system should either reject the input or sanitize it before processing.
**Validates: Requirements 13.3**

### Focus Session Properties

**Property 7: Timer Countdown**
*For any* focus session started with duration D minutes, after T seconds of elapsed time, the remaining time should equal (D * 60 - T) seconds, accounting for pause periods.
**Validates: Requirements 3.1**

**Property 8: Pause-Resume Round Trip**
*For any* active focus session, pausing then immediately resuming should preserve the elapsed time and remaining time within a 1-second tolerance.
**Validates: Requirements 3.3, 3.4**

**Property 9: Session Persistence Round Trip**
*For any* focus session that is stopped and saved, retrieving the session from the database should return the same duration, distraction count, notes, and distraction log.
**Validates: Requirements 3.5, 3.6, 3.8**

**Property 10: Distraction Logging**
*For any* active focus session, logging a distraction should increment the distraction count by 1 and add an entry to the distraction log with the current timestamp.
**Validates: Requirements 3.7**

### Task Management Properties

**Property 11: Task Creation Completeness**
*For any* task created with title T, description D, priority P, and estimated time E, the saved task should contain all these fields with matching values.
**Validates: Requirements 4.1**

**Property 12: Task Status Update**
*For any* task dragged from column C1 to column C2, the task's status should update to match C2's status (BACKLOG, IN_PROGRESS, or DONE).
**Validates: Requirements 4.2**

**Property 13: Task Filter Correctness**
*For any* filter applied (priority or tag), all returned tasks should match the filter criteria, and no matching tasks should be excluded.
**Validates: Requirements 4.3, 4.4**

**Property 14: Task Update Round Trip**
*For any* task updated with new values, retrieving the task from the database should return the updated values, not the original values.
**Validates: Requirements 4.6**

**Property 15: Task Deletion**
*For any* task that is deleted, subsequent attempts to retrieve that task by ID should return a 404 error or null result.
**Validates: Requirements 4.7**

**Property 16: Task Title Validation**
*For any* task creation or update attempt with an empty or whitespace-only title, the system should reject the operation with a validation error.
**Validates: Requirements 4.8**

### Analytics Properties

**Property 17: Dashboard Metrics Accuracy**
*For any* user's dashboard, the displayed metrics (today's focus minutes, tasks completed, distraction count) should exactly match the aggregated values from the underlying session and task data for today's date.
**Validates: Requirements 2.7**

**Property 18: Analytics Calculation Correctness**
*For any* date range selected in analytics, the calculated total focus minutes should equal the sum of all session durations within that date range.
**Validates: Requirements 5.6**

**Property 19: Analytics Reactivity**
*For any* user who completes a new focus session, the analytics metrics should update to include the new session data when recalculated.
**Validates: Requirements 5.7**

**Property 20: Weekly Metrics Date Range**
*For any* weekly review, the calculated metrics should only include focus sessions and tasks with timestamps between the Monday 00:00:00 and Sunday 23:59:59 of that week.
**Validates: Requirements 7.6**

**Property 21: Streak Calculation**
*For any* user, the active streak should equal the number of consecutive days (ending with today) where at least one focus session was completed, resetting to 0 if any day is missed.
**Validates: Requirements 40**

### Team Collaboration Properties

**Property 22: Invitation Link Security**
*For any* workspace invitation created, the invitation link should contain a cryptographically secure random token that is unique and not guessable.
**Validates: Requirements 6.3**

**Property 23: Invitation Acceptance**
*For any* valid invitation link that is accepted, the invited user should be added to the workspace with member role and should be able to access workspace data.
**Validates: Requirements 6.4**

**Property 24: Team Data Privacy**
*For any* team analytics view, the aggregated metrics should not expose individual session notes or private task details of other team members.
**Validates: Requirements 6.5**

**Property 25: Role-Based Access Control**
*For any* team feature restricted to workspace owners (invite, remove members), non-owner members attempting to access these features should receive a 403 Forbidden error.
**Validates: Requirements 6.6, 27**

### Data Persistence Properties

**Property 26: General Persistence Round Trip**
*For any* data entity (user, task, session, review) that is created or updated, retrieving it from the database should return the same values that were written.
**Validates: Requirements 11.1**

**Property 27: Foreign Key Integrity**
*For any* attempt to create a record with a foreign key reference to a non-existent entity (e.g., task with invalid userId), the database should reject the operation with a foreign key constraint error.
**Validates: Requirements 11.3**

**Property 28: Schema Validation**
*For any* data that violates the schema definition (e.g., missing required field, wrong type), the system should reject the operation before attempting database insertion.
**Validates: Requirements 11.4**

**Property 29: Cascade Deletion**
*For any* user account that is deleted, all associated records (tasks, sessions, reviews, API keys) should also be deleted from the database.
**Validates: Requirements 11.5**

### Settings and Configuration Properties

**Property 30: Settings Persistence and Validation**
*For any* settings update with valid values, the changes should be saved to the database and retrievable; for invalid values, the system should reject the update with a validation error.
**Validates: Requirements 8.1, 8.7**

**Property 31: Workspace Settings Propagation**
*For any* workspace setting updated by the owner, all workspace members should see the updated setting value when they query workspace settings.
**Validates: Requirements 8.2**

**Property 32: Notification Preferences**
*For any* user with notification preferences configured, notifications sent to that user should respect the preferences (e.g., if email notifications are disabled, no emails should be sent).
**Validates: Requirements 8.3**

### Subscription and Billing Properties

**Property 33: Feature Access Enforcement**
*For any* feature restricted to Pro or Team tiers, users with Free tier attempting to access the feature should receive an upgrade prompt or 403 error, not access to the feature.
**Validates: Requirements 9.6, 36**

**Property 34: Webhook Event Processing**
*For any* valid Stripe webhook event (payment success, failure, cancellation), the system should update the user's subscription status in the database to match the event data.
**Validates: Requirements 9.7, 32**

### Weekly Review Properties

**Property 35: Reflection Persistence Round Trip**
*For any* weekly review reflection text that is saved, retrieving the weekly review should return the same reflection text.
**Validates: Requirements 7.4, 44**

## Error Handling

### Error Categories

**Validation Errors (400 Bad Request)**
- Empty or invalid input fields
- Data that violates schema constraints
- Malformed request bodies

**Authentication Errors (401 Unauthorized)**
- Missing or invalid session token
- Expired session
- Invalid credentials

**Authorization Errors (403 Forbidden)**
- Insufficient permissions for action
- Feature not available in subscription tier
- CSRF token missing or invalid

**Not Found Errors (404 Not Found)**
- Resource ID does not exist
- User attempts to access deleted entity

**Rate Limiting Errors (429 Too Many Requests)**
- Exceeded authentication attempt limit
- Exceeded API rate limit

**Server Errors (500 Internal Server Error)**
- Database connection failures
- Unexpected exceptions
- External service failures (Stripe, email)

### Error Response Format

All API errors should return a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

Example validation error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "title": ["Title cannot be empty"],
      "estimatedMinutes": ["Must be a positive number"]
    }
  }
}
```

### Error Handling Strategies

**Client-Side Error Handling**
- Display toast notifications for user-facing errors
- Show inline validation errors on forms
- Provide retry buttons for transient failures
- Log errors to monitoring service (PostHog)

**Server-Side Error Handling**
- Catch and log all exceptions
- Return appropriate HTTP status codes
- Never expose stack traces to clients
- Rollback database transactions on error

**Graceful Degradation**
- If analytics service fails, show cached data
- If AI summary fails, allow manual reflection
- If team status polling fails, show last known status

## Testing Strategy

### Dual Testing Approach

FocusForge requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples and edge cases
- Integration points between components
- Error conditions and boundary values
- UI component rendering (React Testing Library)

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Invariants that must always be maintained
- Round-trip properties for data persistence

Both approaches are complementary and necessary. Unit tests catch concrete bugs with specific inputs, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: focusforge, Property {number}: {property_text}`

**Example Property Test Structure**:
```typescript
import fc from 'fast-check';

// Feature: focusforge, Property 9: Session Persistence Round Trip
test('session persistence round trip', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        durationMinutes: fc.integer({ min: 1, max: 180 }),
        distractionCount: fc.integer({ min: 0, max: 50 }),
        notes: fc.option(fc.string(), { nil: null }),
      }),
      async (sessionData) => {
        const session = await createSession(sessionData);
        const retrieved = await getSession(session.id);
        
        expect(retrieved.durationMinutes).toBe(sessionData.durationMinutes);
        expect(retrieved.distractionCount).toBe(sessionData.distractionCount);
        expect(retrieved.notes).toBe(sessionData.notes);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Requirements

**Unit Test Coverage**:
- API route handlers: 80%+ coverage
- Business logic services: 90%+ coverage
- Utility functions: 95%+ coverage
- UI components: 70%+ coverage (focus on logic, not styling)

**Property Test Coverage**:
- Each correctness property must have at least one property-based test
- Critical paths (auth, payments, data persistence) require property tests
- Properties should be tested in isolation when possible

### Testing Tools

**Unit Testing**:
- Jest for test runner
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking
- Prisma test database for integration tests

**Property-Based Testing**:
- fast-check for property generation and testing
- Custom generators for domain models (User, Task, Session)

**E2E Testing** (optional, not part of core spec):
- Playwright for critical user flows
- Test: registration → onboarding → create task → start session → complete

### Test Organization

```
/tests
  /unit
    /api
      auth.test.ts
      tasks.test.ts
      sessions.test.ts
    /services
      analytics.test.ts
      timer.test.ts
    /components
      FocusTimer.test.tsx
      TaskBoard.test.tsx
  /property
    auth-properties.test.ts
    session-properties.test.ts
    task-properties.test.ts
    analytics-properties.test.ts
    persistence-properties.test.ts
  /integration
    task-workflow.test.ts
    session-workflow.test.ts
  /helpers
    generators.ts
    test-db.ts
```

### Continuous Integration

- Run all tests on every pull request
- Block merge if tests fail
- Generate coverage reports
- Run property tests with higher iteration counts (1000+) on main branch
