# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

FocusForge is a SaaS deep work and productivity app with two deployment targets sharing the same Next.js frontend and MongoDB backend:
- **Web version**: Next.js 14 (App Router) + MongoDB (Prisma) + NextAuth + Stripe
- **Desktop version**: Tauri static frontend that connects to the web server's API routes for all data operations

Both versions use the same MongoDB database and NextAuth authentication system. The desktop app is a lightweight client that makes HTTP requests to the Next.js server.

The frontend detects its environment via `window.__TAURI__` (Tauri v1) for UI adjustments, but both web and desktop use the same cloud-based authentication and data storage (see `contexts/AuthContext.tsx`).

## Build & Dev Commands

```
npm run dev              # Start Next.js dev server (web) at localhost:3000
npm run build            # Production build (currently configured for static export to desktop-app/dist)
npm run build:desktop    # Desktop-specific build via scripts/build-desktop.js
npm run lint             # ESLint
npm run format           # Prettier (write)
npm run format:check     # Prettier (check only)
npm test                 # Jest (all tests)
npm test -- --watch      # Jest in watch mode
npm test -- <path>       # Run a single test file, e.g. npm test -- tests/unit/lib/tasks.test.ts
```

### Database (Prisma / MongoDB)

```
npm run db:generate      # prisma generate
npm run db:migrate       # prisma migrate dev
npm run db:migrate:deploy # prisma migrate deploy
npm run db:push          # prisma db push
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # ts-node prisma/seed.ts
npm run db:reset         # prisma migrate reset
```

### Desktop (Tauri)

Desktop development requires Rust and is run from the `desktop-app/` directory:

```
cd desktop-app && npm run tauri dev    # Dev mode
cd desktop-app && npm run build        # Production build (.exe / .dmg / .AppImage)
```

## Architecture

### Next.js App Router (`app/`)

- `app/(dashboard)/` — Authenticated pages behind middleware auth guard: dashboard, analytics, billing, focus, review, settings, tasks, team
- `app/api/` — REST API routes (analytics, auth, billing, blog, dev, export, notifications, onboarding, press, reviews, sessions, settings, tasks, team)
- `app/login/`, `app/register/`, `app/onboarding/` — Public auth & onboarding flows
- `app/desktop-login/` — Tauri-specific login page
- Public marketing pages: about, blog, careers, community, contact, docs, features, help, integrations, mobile, press, pricing, privacy, security, status, terms

### Key Libraries (`lib/`)

- `auth.ts` — NextAuth config (credentials provider, JWT strategy, rate-limited login via `rate-limit.ts`)
- `prisma.ts` — Singleton Prisma client with dev-mode query logging
- `api-client.ts` — Client-side fetch helpers that auto-attach CSRF tokens (`csrf.ts`)
- `feature-access.ts` — Subscription tier gating (FREE/PRO/TEAM) for API routes and middleware, backed by `billing.ts`
- `sessions.ts`, `tasks.ts`, `reviews.ts`, `analytics.ts`, `workspaces.ts`, `invitations.ts` — Domain-specific server logic
- `tauri-api.ts` — Tauri IPC bridge for desktop features (auth, monitoring, focus sessions, notifications)
- `design-system.ts`, `animations.ts` — Shared visual constants and animation presets

### Components (`components/`)

Organized by feature domain: `analytics/`, `auth/`, `celebration/`, `dashboard/`, `layout/`, `providers/`, `tasks/`, `team/`, `timer/`, `ui/`

- `ui/` — Reusable primitives (Button, Card, Modal, etc.)
- `providers/Providers.tsx` — Root provider wrapper (NextAuth SessionProvider, AuthContext, etc.)

### Auth Dual-Mode Pattern

The `AuthContext` (`contexts/AuthContext.tsx`) is the unified auth hook for components. Both web and desktop use NextAuth session:
- **Web**: NextAuth session from same-origin server
- **Desktop**: NextAuth session from API server (configured via NEXT_PUBLIC_API_URL)

Both versions connect to the same MongoDB database through the Next.js API routes.

API routes use NextAuth's `getServerSession(authOptions)` for auth checks. The middleware (`middleware.ts`) protects dashboard routes (redirect to `/login`) and validates CSRF tokens on state-changing API requests.

### Middleware (`middleware.ts`)

Runs on `/api/*` and all dashboard page routes. Handles:
1. Auth redirect for dashboard routes
2. CSRF validation on POST/PUT/PATCH/DELETE to protected API routes
3. CSRF is relaxed in development mode

### Database (Prisma + MongoDB)

Schema at `prisma/schema.prisma` uses MongoDB provider with ObjectId mapping. Core models: User, Workspace, Task, FocusSession, WeeklyReview, ApiKey, NotificationPreferences, Notification, BlogPost, PressRelease.

Note: Despite `.env.local.example` showing a PostgreSQL URL and some docs referencing PostgreSQL, the actual Prisma schema uses `provider = "mongodb"`.

### Subscription Tiers

Three tiers (FREE, PRO, TEAM) control feature access. Tier checks happen via `lib/feature-access.ts` (`FEATURES` constant defines which features need which tier). Billing logic in `lib/billing.ts` with Stripe integration.

### Testing

- **Framework**: Jest + jsdom (configured in `jest.config.js`, setup in `jest.setup.js`)
- **Test env vars**: loaded from `.env.test`, falls back to `.env.local`
- **Structure**: `tests/unit/` (components, lib, API route handlers), `tests/integration/` (API flows), `tests/property/` (fast-check property-based tests)
- **Path alias**: `@/` maps to project root in tests via `moduleNameMapper`
- **Polyfills**: jest.setup.js provides fetch, TextEncoder, and PointerEvent polyfills for jsdom
- Rate limits are cleared before each test automatically

### Config Notes

- `next.config.mjs` is configured for BOTH web and desktop. It includes CORS headers to allow the desktop app to connect to the API routes. **IMPORTANT**: Do NOT use `output: 'export'` as it removes API routes which breaks authentication.
- TypeScript strict mode is enabled. Both ESLint and TypeScript errors are ignored during builds (`ignoreDuringBuilds: true`, `ignoreBuildErrors: true`).
- Path alias: `@/*` maps to project root (tsconfig.json)
- CSRF validation is disabled in development mode to simplify desktop app development

### Environment Variables

Required (see `.env.local.example`):
- `DATABASE_URL` — MongoDB connection string
- `NEXTAUTH_SECRET` — JWT signing secret
- `NEXTAUTH_URL` — App base URL
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe billing
- Optional: `OPENAI_API_KEY` (AI insights), `EMAIL_SERVER`/`EMAIL_FROM` (notifications)

### Desktop App (`desktop-app/`)

Tauri app that connects to a running Next.js server. The desktop app loads the frontend from the server and makes HTTP requests to the server's API routes for all authentication and data operations. Uses the same MongoDB database as the web version.

**Architecture**: Tauri webview → Loads from Next.js server → API routes → MongoDB

**Configuration**: 
- Development: Desktop app connects to `http://localhost:3000` (requires `npm run dev` to be running)
- Production: Desktop app connects to production server URL (set via `NEXT_PUBLIC_API_URL`)
- The desktop app does NOT serve static files - it connects to a live server

**Running Desktop App**:
1. Start Next.js server: `npm run dev` (REQUIRED - must be running)
2. In new terminal: `cd desktop-app && npm run tauri dev`
3. Desktop app opens and loads from the server

**Key Files**:
- `desktop-app/src-tauri/tauri.conf.json` - Tauri configuration (devPath points to server)
- `desktop-app/dist/index.html` - Minimal redirect page for production builds
- `contexts/AuthContext.tsx` - Detects desktop via `window.__TAURI__` (Tauri v1)

See `DESKTOP_APP_SETUP.md` and `DESKTOP_AUTH_FIX.md` for complete documentation.
