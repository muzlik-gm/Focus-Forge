# UI/UX Redesign - Design Document

## Design System

### Colors
```css
--bg: #0f0f10           /* Main background */
--surface: #18181b      /* Cards, panels */
--border: #27272a       /* Borders */
--text: #fafafa         /* Primary text */
--text-dim: #a1a1aa     /* Secondary text */
--text-dimmer: #71717a  /* Tertiary text */
--accent: #3b82f6       /* Primary actions */
--accent-dim: #2563eb   /* Hover states */
```

### Typography
- **Headers**: 24px/600, 18px/600, 16px/600
- **Body**: 16px/400, 14px/400
- **Small**: 12px/400, 10px/400
- **Font**: System stack

### Components

#### Button
```tsx
// Primary
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">

// Secondary  
<button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm">

// Ghost
<button className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm">
```

#### Card
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
```

#### Input
```tsx
<input className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:border-blue-600 focus:outline-none">
```

#### Stat Card
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
  <div className="text-zinc-400 text-xs mb-1">LABEL</div>
  <div className="text-2xl font-bold">VALUE</div>
  <div className="text-zinc-500 text-xs">Description</div>
</div>
```

## Page Layouts

### Dashboard
```
┌─────────────────────────────────────────┐
│ Dashboard                               │
│ Track your focus and productivity       │
├─────────────────────────────────────────┤
│ [Today: 2h] [Tasks: 5] [Streak: 3] [0] │
├─────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐│
│ │ Weekly Chart    │ │ Today's Tasks   ││
│ │ [||||||||||||]  │ │ □ Task 1        ││
│ │                 │ │ ☑ Task 2        ││
│ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────┘
```

### Focus
```
┌─────────────────────────────────────────┐
│ Focus Session                           │
│ Start a deep work session               │
├─────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐│
│ │                 │ │ Recent Sessions ││
│ │     25:00       │ │ • 45m - 2h ago  ││
│ │                 │ │ • 30m - 5h ago  ││
│ │  [Start] [Stop] │ │ • 25m - 1d ago  ││
│ │                 │ │                 ││
│ │  Distractions:0 │ │                 ││
│ │  [Log +]        │ │                 ││
│ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────┘
```

### Tasks
```
┌─────────────────────────────────────────┐
│ Tasks                          [+ New]  │
│ Organize and track your work            │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌──────────┐ ┌──────────────┐ │
│ │Back │ │In Progres│ │Done          │ │
│ │log  │ │s         │ │              │ │
│ │     │ │          │ │              │ │
│ │Task1│ │Task2     │ │Task3         │ │
│ │Task4│ │          │ │Task5         │ │
│ └─────┘ └──────────┘ └──────────────┘ │
└─────────────────────────────────────────┘
```

### Analytics
```
┌─────────────────────────────────────────┐
│ Analytics                               │
│ Understand your productivity patterns   │
├─────────────────────────────────────────┤
│ [12h total] [45m avg] [2pm peak] [7d]  │
├─────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐│
│ │ Weekly          │ │ By Hour         ││
│ │ [||||||||||||]  │ │ [||||||||||||]  ││
│ └─────────────────┘ └─────────────────┘│
│ ┌─────────────────────────────────────┐│
│ │ Insights                            ││
│ │ • 7-day streak maintained           ││
│ │ • Peak productivity at 2pm          ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Implementation Details

### Dashboard Component
```tsx
interface DashboardData {
  todayFocusHours: number;
  todayTasksCompleted: number;
  currentStreak: number;
  todayDistractions: number;
  weeklyFocus: { day: string; hours: number }[];
  todayTasks: { id: string; title: string; completed: boolean }[];
}

// Fetch from: GET /api/analytics/dashboard
// Show loading state while fetching
// Show empty state if no data
// Display real data when available
```

### Focus Component
```tsx
interface FocusSession {
  duration: number; // seconds
  distractions: number;
  isRunning: boolean;
}

// Timer logic:
// - Start: POST /api/sessions/start
// - Stop: POST /api/sessions/{id}/stop
// - Log distraction: POST /api/sessions/{id}/distraction
// - Fetch history: GET /api/sessions?limit=10
```

### Tasks Component
```tsx
interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'BACKLOG' | 'IN_PROGRESS' | 'DONE';
}

// Operations:
// - Fetch: GET /api/tasks
// - Create: POST /api/tasks
// - Update: PATCH /api/tasks/{id}
// - Group by status for kanban columns
```

### Analytics Component
```tsx
interface AnalyticsData {
  totalFocusMinutes: number;
  avgSessionMinutes: number;
  totalSessions: number;
  dailyBreakdown: { date: string; minutes: number }[];
  focusByTimeOfDay: { hour: number; percentage: number }[];
  streak: number;
}

// Fetch from: GET /api/analytics/weekly?weekStartDate=YYYY-MM-DD
// Calculate peak hour from focusByTimeOfDay
// Display charts with simple bars
```

## Navigation Structure

### Sidebar (Desktop)
- Dashboard
- Focus Sessions
- Tasks
- Analytics
- Team
- Weekly Review
- Settings

### Bottom Nav (Mobile)
- Dashboard
- Focus
- Tasks
- Analytics
- Team

### Top Nav
- Logo (left)
- Search/Command Palette (center-left)
- Workspace Selector (center-right)
- Notifications (right)
- Profile Menu (right)

## Interaction Patterns

### Loading States
- Show simple spinner or skeleton
- Don't block entire page
- Show partial data if available

### Empty States
- Clear message: "No [items] yet"
- Action button: "Create your first [item]"
- Optional: Brief explanation of benefit

### Error States
- Red border on card
- Error message
- Retry button if applicable

### Form Validation
- Inline validation on blur
- Clear error messages
- Disable submit until valid

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus indicators
- Color contrast ratios met

## Performance

- Lazy load routes
- Debounce API calls
- Cache dashboard data (5min)
- Optimize re-renders
- No unnecessary animations

## Browser Support

- Chrome/Edge (latest 2)
- Firefox (latest 2)
- Safari (latest 2)
- No IE11 support
