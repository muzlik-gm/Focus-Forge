# UI/UX Redesign - Requirements

## Overview
Complete redesign of FocusForge frontend to eliminate generic AI aesthetics, improve functionality, and create a professional productivity tool.

## Problem Statement
Current issues:
- Generic "AI-generated" look with excessive animations and gradients
- Non-functional UI elements that don't connect to backend
- Poor color palette and inconsistent design system
- No clear information hierarchy or user story
- Sloppy layouts with overflow issues
- Emojis instead of proper icons
- Excessive hover effects that add no value

## User Stories

### 1. As a user, I want a clean, professional interface that doesn't look like a template
**Acceptance Criteria:**
- No unnecessary gradients or glow effects
- Consistent, professional color palette (not random colors)
- Clean typography with proper hierarchy
- Minimal, purposeful animations only
- No emojis - proper icons only

### 2. As a user, I want the dashboard to show me real, actionable data
**Acceptance Criteria:**
- Dashboard displays actual data from backend APIs
- Clear empty states that guide users to take action
- Focus on today's metrics and this week's progress
- Quick access to start focus session
- Today's task list is functional and interactive

### 3. As a user, I want to start and track focus sessions easily
**Acceptance Criteria:**
- Simple, functional timer interface
- Clear start/pause/stop controls
- Distraction logging that actually works
- Session history shows real data
- Sessions save to backend properly

### 4. As a user, I want to manage tasks in a simple, effective way
**Acceptance Criteria:**
- Kanban board with drag-and-drop (or simple status change)
- Create tasks with title, priority, status
- Tasks persist to backend
- Filter by status works
- No unnecessary complexity

### 5. As a user, I want analytics that tell me something useful
**Acceptance Criteria:**
- Weekly focus hours chart with real data
- Time-of-day productivity patterns
- Streak tracking that motivates
- Simple insights based on actual patterns
- No fake "AI insights"

## Design Principles

### Visual Design
1. **Color Palette**: Neutral grays with single accent color (blue)
   - Background: `#0f0f10`
   - Surface: `#18181b`
   - Border: `#27272a`
   - Text: `#fafafa`, `#a1a1aa`, `#71717a`
   - Accent: `#3b82f6`

2. **Typography**
   - System fonts only: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`
   - Clear hierarchy: 24px headers, 16px body, 14px secondary
   - No fancy font effects

3. **Spacing**
   - Consistent 4px grid
   - Generous whitespace
   - Clear content boundaries

4. **Components**
   - Simple cards with subtle borders
   - Minimal shadows
   - No hover scale effects
   - Functional buttons only

### Functional Design
1. **Data Flow**: All UI connects to real backend APIs
2. **Loading States**: Simple spinners, no skeleton screens
3. **Error Handling**: Clear error messages
4. **Empty States**: Actionable guidance
5. **Forms**: Validate and save properly

## Pages to Redesign

### 1. Dashboard (`/dashboard`)
- 4 stat cards: Today's focus, tasks done, streak, distractions
- Weekly focus chart (7 bars)
- Today's task list (5 items max)
- CTA to start focus session if no data

### 2. Focus (`/focus`)
- Large timer display
- Start/Pause/Stop buttons
- Distraction counter with log button
- Recent sessions list (right sidebar)
- Sessions save to `/api/sessions`

### 3. Tasks (`/tasks`)
- 3-column kanban: Backlog, In Progress, Done
- Add task button (opens simple form)
- Task cards show: title, priority badge
- Click to edit status
- Connects to `/api/tasks`

### 4. Analytics (`/analytics`)
- 4 stat cards: Total focus, avg session, peak hour, streak
- Weekly breakdown chart
- Hourly heatmap
- Simple text insights (no AI branding)
- Connects to `/api/analytics/weekly`

### 5. Team (`/team`)
- Member list with status indicators
- Weekly leaderboard
- Invite button
- Connects to `/api/team/members`

## Technical Requirements

### Component Structure
```
components/
  ui/
    Button.tsx          - Single button component
    Card.tsx            - Simple card wrapper
    Input.tsx           - Form input
  layout/
    Navbar.tsx          - Top nav (logo, search, profile)
    Sidebar.tsx         - Left nav (main menu)
```

### Styling
- Tailwind utility classes only
- No custom CSS beyond globals
- CSS variables for colors
- No animation libraries

### State Management
- React hooks for local state
- Fetch API for backend calls
- No complex state management

## Out of Scope
- Advanced animations
- Complex interactions
- Multiple themes
- Mobile-specific redesign (responsive is fine)
- Settings page redesign
- Billing page redesign
- Review page redesign

## Success Metrics
1. No visual overflow or layout issues
2. All displayed data comes from backend
3. User can complete core flows: start session, create task, view analytics
4. Design looks professional, not template-like
5. Zero emojis in production UI
6. Page load shows real data or clear empty states
