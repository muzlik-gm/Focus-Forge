# Project Structure

## Root Directory Layout

```
forgrin/
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components organized by feature
├── contexts/               # React context providers
├── lib/                    # Server-side utilities and business logic
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── tests/                  # Test files (unit, integration, property)
├── desktop-app/            # Tauri desktop application
├── public/                 # Static assets
└── scripts/                # Build and utility scripts
```

## App Directory (`app/`)

Next.js 14 App Router structure with route groups:

### Protected Routes (`app/(dashboard)/`)
All routes require authentication (enforced by middleware):
- `/dashboard` - Main dashboard
- `/analytics` - Productivity analytics
- `/focus` - Focus session interface
- `/tasks` - Task management
- `/review` - Weekly reviews
- `/settings` - User settings
- `/team` - Team collaboration
- `/billing` - Subscription management

### Public Routes
- `/login`, `/register`, `/onboarding` - Auth flows
- `/desktop-login` - Tauri-specific login
- Marketing pages: `/about`, `/blog`, `/pricing`, `/features`, etc.

### API Routes (`app/api/`)
RESTful API organized by domain:
- `analytics/` - Dashboard, insights, weekly/monthly stats
- `auth/` - Registration, OAuth, NextAuth handlers
- `billing/` - Stripe checkout, portal, webhooks
- `sessions/` - Focus session CRUD and controls (start, pause, resume, stop)
- `tasks/` - Task CRUD and state management
- `reviews/` - Weekly review generation
- `team/` - Invitations, members, leaderboard
- `settings/` - Profile, notifications, workspace, API keys
- `notifications/` - User notifications
- `sync/` - Desktop app sync endpoints

## Components (`components/`)

Feature-based organization:
- `ui/` - Reusable primitives (Button, Card, Modal, Input, etc.)
- `analytics/` - Charts and analytics widgets
- `auth/` - Login, register, onboarding forms
- `dashboard/` - Dashboard-specific components
- `tasks/` - Task list, task card, task forms
- `team/` - Team member list, invitation UI
- `timer/` - Focus timer and session controls
- `layout/` - Navigation, sidebar, header
- `providers/` - Root provider wrapper (Providers.tsx)

## Library (`lib/`)

Server-side utilities and business logic:
- `auth.ts` - NextAuth configuration
- `prisma.ts` - Singleton Prisma client
- `api-client.ts` - Client-side fetch helpers with CSRF
- `feature-access.ts` - Subscription tier gating
- `billing.ts` - Stripe integration
- `sessions.ts` - Focus session logic
- `tasks.ts` - Task management logic
- `reviews.ts` - Weekly review generation
- `analytics.ts` - Analytics calculations
- `workspaces.ts` - Workspace management
- `invitations.ts` - Team invitation logic
- `tauri-api.ts` - Tauri IPC bridge for desktop
- `design-system.ts` - Shared visual constants
- `animations.ts` - Animation presets
- `csrf.ts` - CSRF token handling
- `rate-limit.ts` - Rate limiting for auth

## Contexts (`contexts/`)

- `AuthContext.tsx` - Unified auth hook for web and desktop
  - Detects environment via `window.__TAURI__`
  - Both versions use NextAuth session from API server

## Database (`prisma/`)

- `schema.prisma` - MongoDB schema with models:
  - User, Workspace, Task, FocusSession, WeeklyReview
  - ApiKey, NotificationPreferences, Notification
  - BlogPost, PressRelease
- `seed.ts` - Database seeding script

## Testing (`tests/`)

- `unit/` - Component and library unit tests
  - `components/` - React component tests
  - `lib/` - Business logic tests
  - `api/` - API route handler tests
- `integration/` - API flow integration tests
- `property/` - Property-based tests using fast-check

## Desktop App (`desktop-app/`)

Tauri application structure:
- `src-tauri/` - Rust backend
  - `tauri.conf.json` - Tauri configuration
  - `src/` - Rust source code
- `dist/` - Built frontend files
- `dist/index.html` - Minimal redirect page for production

## Middleware (`middleware.ts`)

Runs on all `/api/*` and dashboard routes:
1. Auth redirect for protected routes
2. CSRF validation on state-changing requests
3. Relaxed in development mode

## Configuration Files

- `next.config.mjs` - Next.js config with CORS for desktop
- `tsconfig.json` - TypeScript config with `@/*` path alias
- `tailwind.config.ts` - Tailwind CSS configuration
- `jest.config.js` - Jest test configuration
- `jest.setup.js` - Test environment setup with polyfills
- `.env.local` - Environment variables (not committed)
- `.env.test` - Test environment variables

## Key Patterns

### Path Alias
Use `@/` to import from project root:
```typescript
import { prisma } from '@/lib/prisma'
import Button from '@/components/ui/Button'
```

### API Route Pattern
```typescript
// app/api/resource/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })
  // ... logic
}
```

### Component Pattern
```typescript
// components/feature/Component.tsx
'use client' // if client component
import { useAuth } from '@/contexts/AuthContext'

export default function Component() {
  const { user } = useAuth()
  // ... component logic
}
```

### Feature Access Pattern
```typescript
import { checkFeatureAccess } from '@/lib/feature-access'

const hasAccess = await checkFeatureAccess(userId, 'FEATURE_NAME')
if (!hasAccess) return new Response('Upgrade required', { status: 403 })
```
