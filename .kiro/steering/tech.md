# Tech Stack

## Core Framework

- **Next.js 14** (App Router) - React framework with server-side rendering
- **React 18** - UI library
- **TypeScript 5** (strict mode enabled) - Type safety

## Database & ORM

- **MongoDB** - Primary database
- **Prisma 5.22** - ORM with MongoDB provider
- ObjectId mapping for all model IDs

## Authentication

- **NextAuth 4.24** - Authentication framework
  - Credentials provider (email/password with bcrypt)
  - JWT strategy
  - Prisma adapter for session storage
- **Firebase Admin SDK** - Firebase authentication integration

## Styling & UI

- **Tailwind CSS 3.4** - Utility-first CSS
- **Radix UI** - Accessible component primitives (Dialog, Dropdown, Progress, Tabs, Tooltip)
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **clsx** + **tailwind-merge** - Class name utilities

## Payment & Billing

- **Stripe** - Subscription management and payments

## Desktop App

- **Tauri 1.6** - Desktop app framework (Rust + webview)
- Connects to Next.js server via HTTP for all operations
- Detects environment via `window.__TAURI__`

## Testing

- **Jest 29** - Test runner
- **Testing Library** (React, Jest DOM, User Event) - Component testing
- **fast-check** - Property-based testing
- **jsdom** - Browser environment simulation

## Development Tools

- **ESLint** - Linting (errors ignored during builds)
- **Prettier** - Code formatting
- **ts-node** - TypeScript execution for scripts

## Common Commands

### Development
```bash
npm run dev              # Start Next.js dev server at localhost:3000
npm run build            # Production build
npm run build:desktop    # Desktop-specific build
npm run start            # Start production server
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without writing
npm test                 # Run all tests
npm test -- --watch      # Run tests in watch mode
npm test -- <path>       # Run specific test file
```

### Database (Prisma)
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations in dev
npm run db:migrate:deploy # Deploy migrations to production
npm run db:push          # Push schema changes without migrations
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed database
npm run db:reset         # Reset database
```

### Desktop App (from desktop-app/ directory)
```bash
cd desktop-app && npm run tauri dev    # Run desktop app in dev mode
cd desktop-app && npm run build        # Build desktop app (.exe/.dmg/.AppImage)
```

**Note**: Desktop dev requires Next.js server running (`npm run dev` in root)

## Configuration Notes

- Path alias: `@/*` maps to project root
- TypeScript errors ignored during builds (`ignoreBuildErrors: true`)
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)
- CSRF validation disabled in development mode
- CORS headers configured for desktop app API access
- **CRITICAL**: Do NOT use `output: 'export'` - it removes API routes
