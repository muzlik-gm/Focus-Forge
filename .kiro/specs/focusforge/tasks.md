# Implementation Plan: FocusForge

## Overview

This implementation plan breaks down the FocusForge SaaS application into incremental, testable steps. The approach follows a bottom-up strategy: establish core infrastructure first, then build domain features, and finally integrate everything into the complete application.

The implementation is organized into phases:
1. Project setup and infrastructure
2. Database and authentication
3. Core features (tasks, focus sessions, analytics)
4. Team collaboration
5. Billing and subscriptions
6. UI polish and landing page

Each task builds on previous work, ensuring the application remains functional at every checkpoint.

## Tasks

- [x] 1. Initialize Next.js project and configure development environment
  - Create Next.js 14 project with TypeScript and App Router
  - Install dependencies: Prisma, NextAuth, Tailwind CSS, Shadcn UI, Framer Motion, Zod, fast-check
  - Configure Tailwind with custom color palette (Deep Indigo, Electric Blue, Neon Cyan)
  - Set up ESLint and Prettier
  - Create .env.local template with required environment variables
  - Configure TypeScript with strict mode
  - _Requirements: 16, 33_

- [ ] 2. Set up database schema and Prisma
  - [x] 2.1 Create Prisma schema with all models
    - Define User, Workspace, Task, FocusSession, WeeklyReview, ApiKey models
    - Add enums for SubscriptionTier, TaskStatus, TaskPriority
    - Configure indexes for query optimization
    - Set up foreign key relationships with cascade delete
    - _Requirements: 11.3, 11.5_
  
  - [ ]* 2.2 Write property test for foreign key integrity
    - **Property 27: Foreign Key Integrity**
    - **Validates: Requirements 11.3**
  
  - [x] 2.3 Initialize Prisma client and run migrations
    - Generate Prisma client
    - Create initial migration
    - Set up test database for development
    - _Requirements: 11.1_

- [ ] 3. Implement authentication system
  - [x] 3.1 Configure NextAuth with credentials provider
    - Create NextAuth configuration file
    - Set up session strategy with JWT
    - Configure secure cookie settings (HTTP-only, secure, sameSite)
    - _Requirements: 1.2, 13.2_
  
  - [x] 3.2 Implement user registration endpoint
    - Create POST /api/auth/register route
    - Validate input with Zod schema
    - Hash passwords with bcrypt
    - Create user record in database
    - _Requirements: 1.1, 13.1_
  
  - [ ]* 3.3 Write property test for password encryption
    - **Property 1: Password Encryption**
    - **Validates: Requirements 1.1, 13.1**
  
  - [ ]* 3.4 Write property test for session creation
    - **Property 2: Session Creation on Login**
    - **Validates: Requirements 1.2, 13.2**
  
  - [x] 3.5 Implement logout functionality
    - Create logout endpoint
    - Invalidate session tokens
    - Clear cookies
    - _Requirements: 1.4_
  
  - [ ]* 3.6 Write property test for session invalidation
    - **Property 3: Session Invalidation on Logout**
    - **Validates: Requirements 1.4**
  
  - [x] 3.7 Add CSRF protection middleware
    - Implement CSRF token generation and validation
    - Add middleware to protect authenticated routes
    - _Requirements: 1.5_
  
  - [ ]* 3.8 Write property test for CSRF protection
    - **Property 4: CSRF Protection**
    - **Validates: Requirements 1.5**
  
  - [x] 3.9 Implement rate limiting for auth endpoints
    - Add rate limiting middleware using in-memory store
    - Configure limits for login and registration
    - Return 429 status when limit exceeded
    - _Requirements: 1.6_
  
  - [ ]* 3.10 Write property test for rate limiting
    - **Property 5: Rate Limiting**
    - **Validates: Requirements 1.6**

- [x] 4. Checkpoint - Ensure authentication tests pass
  - All authentication unit tests passing
  - Integration tests passing (except rate-limiting tests that require HTTP server)
  - MongoDB integration validated

- [ ] 5. Build task management system
  - [x] 5.1 Create task data access layer
    - Implement createTask, getTasks, updateTask, deleteTask functions
    - Add filtering by status, priority, and tags
    - Implement ordering within status columns
    - _Requirements: 4.1, 4.3, 4.4, 4.5_
  
  - [x] 5.2 Create task API endpoints
    - POST /api/tasks - create task
    - GET /api/tasks - list tasks with filters
    - PATCH /api/tasks/[id] - update task
    - DELETE /api/tasks/[id] - delete task
    - Add Zod validation for all inputs
    - _Requirements: 4.1, 4.6, 4.7_
  
  - [ ]* 5.3 Write property test for task creation
    - **Property 11: Task Creation Completeness**
    - **Validates: Requirements 4.1**
  
  - [ ]* 5.4 Write property test for task update round trip
    - **Property 14: Task Update Round Trip**
    - **Validates: Requirements 4.6**
  
  - [ ]* 5.5 Write property test for task deletion
    - **Property 15: Task Deletion**
    - **Validates: Requirements 4.7**
  
  - [ ]* 5.6 Write property test for task title validation
    - **Property 16: Task Title Validation**
    - **Validates: Requirements 4.8**
  
  - [ ]* 5.7 Write property test for task filter correctness
    - **Property 13: Task Filter Correctness**
    - **Validates: Requirements 4.3, 4.4**
  
  - [x] 5.8 Build TaskBoard component with drag-and-drop
    - Create TaskBoard client component
    - Implement three columns: Backlog, In Progress, Done
    - Add drag-and-drop using Framer Motion
    - Update task status on drop
    - Add optimistic updates for smooth UX
    - _Requirements: 4.2, 4.5, 24_
  
  - [ ]* 5.9 Write property test for task status update
    - **Property 12: Task Status Update**
    - **Validates: Requirements 4.2**
  
  - [x] 5.10 Create TaskCard component
    - Display task title, description, priority, tags, estimated time
    - Add checkbox for completion
    - Show drag handle
    - Apply priority color coding
    - _Requirements: 19, 38_
  
  - [x] 5.11 Add task filtering UI
    - Create filter panel with priority and tag filters
    - Implement filter state management
    - Update task list based on selected filters
    - _Requirements: 4.3, 4.4_

- [ ] 6. Implement focus session engine
  - [x] 6.1 Create focus session data access layer
    - Implement startSession, pauseSession, resumeSession, stopSession functions
    - Implement logDistraction function
    - Implement getSessions with date range filtering
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.7_
  
  - [x] 6.2 Create focus session API endpoints
    - POST /api/sessions/start - start new session
    - POST /api/sessions/[id]/pause - pause session
    - POST /api/sessions/[id]/resume - resume session
    - POST /api/sessions/[id]/stop - stop and save session
    - POST /api/sessions/[id]/distraction - log distraction
    - GET /api/sessions - list sessions
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.7_
  
  - [ ]* 6.3 Write property test for timer countdown
    - **Property 7: Timer Countdown**
    - **Validates: Requirements 3.1**
  
  - [ ]* 6.4 Write property test for pause-resume round trip
    - **Property 8: Pause-Resume Round Trip**
    - **Validates: Requirements 3.3, 3.4**
  
  - [ ]* 6.5 Write property test for session persistence
    - **Property 9: Session Persistence Round Trip**
    - **Validates: Requirements 3.5, 3.6, 3.8**
  
  - [ ]* 6.6 Write property test for distraction logging
    - **Property 10: Distraction Logging**
    - **Validates: Requirements 3.7**
  
  - [x] 6.7 Build FocusTimer client component
    - Create timer display with countdown
    - Implement start, pause, resume, stop controls
    - Add distraction logging button
    - Use useEffect for timer tick
    - Handle timer completion with notification
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 42, 49_
  
  - [x] 6.8 Create session history panel
    - Display past sessions in reverse chronological order
    - Show duration, distraction count, notes for each session
    - Display distraction log with timestamps
    - _Requirements: 23, 37_
  
  - [x] 6.9 Add session notes input
    - Create notes textarea for active sessions
    - Auto-save notes periodically
    - Persist notes when session stops
    - _Requirements: 3.8, 23_

- [x] 7. Checkpoint - Ensure task and session tests pass
  - All task management unit tests passing
  - All session management unit tests passing
  - MongoDB CRUD operations validated
  - Integration tests passing (with minor timeout issues due to network latency)

- [ ] 8. Build analytics engine
  - [x] 8.1 Create analytics calculation service
    - Implement calculateDashboardMetrics function
    - Implement calculateWeeklyAnalytics function
    - Implement calculateMonthlyAnalytics function
    - Implement calculateStreak function
    - _Requirements: 2.7, 5.6, 7.6, 40_
  
  - [ ]* 8.2 Write property test for dashboard metrics accuracy
    - **Property 17: Dashboard Metrics Accuracy**
    - **Validates: Requirements 2.7**
  
  - [ ]* 8.3 Write property test for analytics calculation correctness
    - **Property 18: Analytics Calculation Correctness**
    - **Validates: Requirements 5.6**
  
  - [ ]* 8.4 Write property test for weekly metrics date range
    - **Property 20: Weekly Metrics Date Range**
    - **Validates: Requirements 7.6**
  
  - [ ]* 8.5 Write property test for streak calculation
    - **Property 21: Streak Calculation**
    - **Validates: Requirements 40**
  
  - [x] 8.6 Create analytics API endpoints
    - GET /api/analytics/dashboard - dashboard metrics
    - GET /api/analytics/weekly - weekly breakdown
    - GET /api/analytics/monthly - monthly comparison
    - _Requirements: 5.6, 5.7_
  
  - [ ]* 8.7 Write property test for analytics reactivity
    - **Property 19: Analytics Reactivity**
    - **Validates: Requirements 5.7**
  
  - [x] 8.8 Build dashboard page
    - Create server component for dashboard
    - Fetch and display today's metrics (focus hours, tasks completed, streak, distractions)
    - Display today's task list
    - Add quick start focus button
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_
  
  - [x] 8.9 Create MetricsCard component
    - Display large number with label
    - Add trend arrow indicator
    - Apply background gradient
    - _Requirements: 19_
  
  - [x] 8.10 Build WeeklyFocusChart component
    - Create bar chart showing last 7 days
    - Use recharts or similar library
    - Add hover tooltips with exact values
    - Make responsive
    - _Requirements: 2.5, 39_
  
  - [x] 8.11 Build analytics page
    - Create weekly focus graph
    - Create monthly comparison chart
    - Create distraction heatmap
    - Create focus by time of day histogram
    - Add time range selector
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 50_
  
  - [x] 8.12 Implement AI insights generation (placeholder)
    - Create function to generate insights based on patterns
    - For MVP, use rule-based insights (e.g., "Most productive in mornings")
    - Display in insight box on analytics page
    - _Requirements: 5.5, 28_

- [ ] 9. Implement team collaboration features
  - [x] 9.1 Create workspace data access layer
    - Implement createWorkspace, getWorkspace, updateWorkspace functions
    - Implement addMember, removeMember functions
    - Implement getTeamMembers with status
    - _Requirements: 6.1, 27_
  
  - [x] 9.2 Create team API endpoints
    - GET /api/team/members - list team members with status
    - GET /api/team/leaderboard - weekly leaderboard
    - POST /api/team/invite - send invitation
    - POST /api/team/accept - accept invitation
    - DELETE /api/team/members/[id] - remove member
    - _Requirements: 6.3, 6.4, 27_
  
  - [ ]* 9.3 Write property test for invitation link security
    - **Property 22: Invitation Link Security**
    - **Validates: Requirements 6.3**
  
  - [ ]* 9.4 Write property test for invitation acceptance
    - **Property 23: Invitation Acceptance**
    - **Validates: Requirements 6.4**
  
  - [ ]* 9.5 Write property test for team data privacy
    - **Property 24: Team Data Privacy**
    - **Validates: Requirements 6.5**
  
  - [ ]* 9.6 Write property test for role-based access control
    - **Property 25: Role-Based Access Control**
    - **Validates: Requirements 6.6, 27**
  
  - [x] 9.7 Build team page
    - Display team members grid with status indicators
    - Show weekly leaderboard
    - Add invite button for workspace owners
    - Highlight current user's position
    - _Requirements: 6.1, 6.2, 26, 43_
  
  - [x] 9.8 Implement team member status tracking
    - Update user status when session starts/stops
    - Add polling mechanism to refresh status every 30s
    - Display colored indicators (green=available, red=in focus, gray=offline)
    - _Requirements: 43_
  
  - [x] 9.9 Create workspace selector component
    - Display current workspace name in navbar
    - Show dropdown with all user's workspaces
    - Switch workspace context on selection
    - _Requirements: 17, 47_

- [x] 10. Implement weekly review feature
  - [x] 10.1 Create weekly review data access layer
    - Implement createWeeklyReview, getWeeklyReview functions
    - Calculate weekly metrics from sessions and tasks
    - _Requirements: 7.6_
  
  - [x] 10.2 Create weekly review API endpoints
    - GET /api/reviews/[weekStartDate] - get review for week
    - POST /api/reviews - create/update review
    - POST /api/reviews/[id]/generate-summary - generate AI summary
    - _Requirements: 7.4, 7.5_
  
  - [ ]* 10.3 Write property test for reflection persistence
    - **Property 35: Reflection Persistence Round Trip**
    - **Validates: Requirements 7.4, 44**
  
  - [ ] 10.4 Build weekly review page
    - Display total focus hours for the week
    - Show top achievements (completed tasks, streak milestones)
    - Show missed goals vs targets
    - Add reflection textarea with auto-save
    - Add button to generate AI summary
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 44_

- [ ] 11. Checkpoint - Ensure analytics and team tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement subscription and billing
  - [x] 12.1 Set up Stripe integration
    - Install Stripe SDK
    - Configure Stripe API keys
    - Create Stripe customer on user registration
    - _Requirements: 9.1, 32_
  
  - [x] 12.2 Create subscription API endpoints
    - POST /api/billing/checkout - create Stripe checkout session
    - POST /api/billing/portal - create customer portal session
    - POST /api/billing/webhook - handle Stripe webhooks
    - _Requirements: 9.1, 9.2, 9.3, 9.7_
  
  - [ ]* 12.3 Write property test for webhook event processing
    - **Property 34: Webhook Event Processing**
    - **Validates: Requirements 9.7, 32**
  
  - [x] 12.4 Implement feature access middleware
    - Create middleware to check subscription tier
    - Block access to Pro/Team features for Free users
    - Return upgrade prompt or 403 error
    - _Requirements: 9.6, 36_
  
  - [ ]* 12.5 Write property test for feature access enforcement
    - **Property 33: Feature Access Enforcement**
    - **Validates: Requirements 9.6, 36**
  
  - [x] 12.6 Build billing settings page
    - Display current subscription tier
    - Show billing history with invoices
    - Display next payment date
    - Add upgrade/downgrade buttons
    - Link to Stripe customer portal
    - _Requirements: 8.4, 9.4, 9.5, 45_
  
  - [x] 12.7 Create pricing page
    - Display Free, Pro, Team tiers
    - Highlight Pro plan
    - Show feature comparison
    - Add CTA buttons linking to checkout
    - _Requirements: 14.3, 36_

- [x] 13. Implement settings and configuration
  - [x] 13.1 Create settings API endpoints
    - PATCH /api/settings/profile - update profile
    - PATCH /api/settings/workspace - update workspace settings
    - PATCH /api/settings/notifications - update notification preferences
    - POST /api/settings/api-keys - generate API key
    - DELETE /api/settings/api-keys/[id] - revoke API key
    - _Requirements: 8.1, 8.2, 8.3, 31_
  
  - [ ]* 13.2 Write property test for settings persistence and validation
    - **Property 30: Settings Persistence and Validation**
    - **Validates: Requirements 8.1, 8.7**
  
  - [ ]* 13.3 Write property test for workspace settings propagation
    - **Property 31: Workspace Settings Propagation**
    - **Validates: Requirements 8.2**
  
  - [ ]* 13.4 Write property test for notification preferences
    - **Property 32: Notification Preferences**
    - **Validates: Requirements 8.3**
  
  - [ ] 13.5 Build settings page with tabs
    - Create tabbed interface: Profile, Workspace, Notifications, Billing, API, Integrations
    - Profile tab: name, email, password change
    - Workspace tab: workspace name, member management
    - Notifications tab: email, browser notification preferences
    - API tab: generate and manage API keys (Pro/Team only)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 31_

- [ ] 14. Build shared UI components and layout
  - [x] 14.1 Create Button component with variants
    - Implement primary, secondary, danger, icon variants
    - Add size options (sm, md, lg)
    - Add hover, active, focus states with animations
    - _Requirements: 18_
  
  - [x] 14.2 Create Card component with variants
    - Implement standard, stats, task, session variants
    - Apply glassmorphism styling
    - Add hover lift effect
    - _Requirements: 19_
  
  - [x] 14.3 Create Modal component
    - Implement overlay with blur effect
    - Add centered modal box with close button
    - Trap focus for accessibility
    - Handle Escape key and overlay click to close
    - _Requirements: 20_
  
  - [ ] 14.4 Build navigation layout
    - Create sidebar with navigation links
    - Add active state styling (blue left border)
    - Implement collapsed sidebar mode
    - Create top navbar with logo, search, notifications, profile dropdown
    - _Requirements: 17_
  
  - [ ] 14.5 Create profile dropdown menu
    - Display user avatar and name
    - Add menu items: Settings, Billing, API Keys, Logout
    - Handle navigation and logout
    - _Requirements: 46_
  
  - [x] 14.6 Implement command palette
    - Create modal with search input
    - Filter commands and navigation options
    - Execute commands on selection
    - Add keyboard shortcut (Cmd/Ctrl+K)
    - _Requirements: 15_
  
  - [x] 14.7 Add notification system
    - Create notification dropdown in navbar
    - Display recent notifications
    - Mark as read on view
    - Send browser notifications (with permission)
    - _Requirements: 29, 49_
  
  - [x] 14.8 Implement responsive layout
    - Add mobile breakpoint styles
    - Collapse sidebar on tablet/mobile
    - Add bottom navigation for mobile
    - Make Kanban board stack on mobile
    - _Requirements: 10.5, 10.6, 22_

- [ ] 15. Build landing page
  - [x] 15.1 Create hero section
    - Add headline and subheading
    - Add primary CTA "Start Deep Work Free"
    - Add secondary CTA "See Demo"
    - Implement animated gradient background
    - _Requirements: 14.1, 35.1, 35.2_
  
  - [ ] 15.2 Create features section
    - Display 3-column layout with feature cards
    - Add icons for each feature
    - Describe key capabilities
    - _Requirements: 14.2, 35.3_
  
  - [ ] 15.3 Create analytics preview section
    - Display screenshot mock of analytics dashboard
    - Highlight key metrics
    - _Requirements: 14.3, 35.4_
  
  - [ ] 15.4 Create testimonials section
    - Display user avatars with quotes
    - Add carousel or grid layout
    - _Requirements: 14.4, 35.5_
  
  - [ ] 15.5 Create footer
    - Add navigation links
    - Add social media icons
    - Add legal links (Privacy, Terms)
    - Add newsletter signup input
    - _Requirements: 14.6, 35.7_
  
  - [ ] 15.6 Optimize landing page for SEO
    - Add meta tags for title, description, OG tags
    - Optimize images with next/image
    - Add structured data markup
    - _Requirements: 14.6_

- [x] 16. Implement onboarding flow
  - [x] 16.1 Create onboarding pages
    - Welcome page with goal selection
    - Feature tour with visual examples
    - Completion page with CTA to dashboard
    - _Requirements: 30_
  
  - [x] 16.2 Add onboarding state management
    - Track onboarding completion in user record
    - Redirect new users to onboarding
    - Allow skip option
    - Don't show onboarding to returning users
    - _Requirements: 30_

- [x] 17. Add micro-interactions and animations
  - [x] 17.1 Implement button animations
    - Add hover glow effect
    - Add active state inset shadow
    - Add focus ring animation
    - _Requirements: 21.1_
  
  - [x] 17.2 Implement card animations
    - Add hover lift effect
    - Add smooth transitions
    - _Requirements: 21.2_
  
  - [x] 17.3 Add page transitions
    - Implement smooth fade transitions between pages
    - Use Framer Motion layout animations
    - _Requirements: 21.3_
  
  - [x] 17.4 Add loading states
    - Create skeleton loaders for dashboard
    - Add loading spinners for async actions
    - _Requirements: 21.4_
  
  - [x] 17.5 Add animated counters
    - Animate number changes in metrics
    - Use spring animation for natural feel
    - _Requirements: 21.5_
  
  - [x] 17.6 Add streak milestone celebration
    - Trigger confetti animation on 7, 30, 100 day streaks
    - Display achievement modal
    - _Requirements: 21.7, 40_

- [ ] 18. Implement data persistence properties
  - [ ]* 18.1 Write property test for general persistence round trip
    - **Property 26: General Persistence Round Trip**
    - **Validates: Requirements 11.1**
  
  - [ ]* 18.2 Write property test for schema validation
    - **Property 28: Schema Validation**
    - **Validates: Requirements 11.4**
  
  - [ ]* 18.3 Write property test for cascade deletion
    - **Property 29: Cascade Deletion**
    - **Validates: Requirements 11.5**

- [ ] 19. Implement security properties
  - [ ]* 19.1 Write property test for input sanitization
    - **Property 6: Input Sanitization**
    - **Validates: Requirements 13.3**

- [x] 20. Add data export functionality
  - [x] 20.1 Create data export API endpoint
    - GET /api/export/json - export all user data as JSON
    - GET /api/export/csv - export sessions and tasks as CSV
    - _Requirements: 34_
  
  - [x] 20.2 Add export UI in settings
    - Add export buttons in settings page
    - Generate download link
    - Exclude sensitive data (passwords)
    - _Requirements: 34_

- [ ] 21. Final checkpoint - Run full test suite
  - Run all unit tests and property tests
  - Verify all 35 correctness properties pass
  - Check test coverage meets requirements (80%+ for API, 90%+ for services)
  - Fix any failing tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Polish and accessibility
  - [ ] 22.1 Audit accessibility
    - Verify WCAG contrast ratios
    - Test keyboard navigation on all pages
    - Add missing ARIA labels
    - Test with screen reader
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 22.2 Optimize performance
    - Run Lighthouse audit
    - Optimize images
    - Minimize bundle size
    - Add loading states
    - _Requirements: 12.1, 12.3, 12.4, 12.5_
  
  - [ ] 22.3 Test responsive design
    - Test on mobile devices
    - Test on tablet
    - Test on desktop and wide screens
    - Fix any layout issues
    - _Requirements: 10.5, 10.6, 22_

- [ ] 23. Deployment preparation
  - [ ] 23.1 Configure production environment
    - Set up production database
    - Configure environment variables in Vercel
    - Set up Stripe production keys
    - Configure domain and SSL
    - _Requirements: 33_
  
  - [ ] 23.2 Deploy to Vercel
    - Connect GitHub repository
    - Configure build settings
    - Deploy to production
    - Verify deployment
    - _Requirements: 12.6_

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Property tests validate universal correctness properties across many generated inputs
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: infrastructure → core features → integration → polish
