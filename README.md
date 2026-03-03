# Forgrin

A SaaS web application for deep work and productivity management, built with Next.js 14, TypeScript, and PostgreSQL.

## Features

- **Focus Session Tracking**: Timed deep work sessions with pause/resume functionality
- **Task Management**: Kanban board with drag-and-drop
- **Analytics**: Detailed productivity insights and visualizations
- **Team Collaboration**: Workspace management and team leaderboards
- **Weekly Reviews**: Reflection and AI-generated insights
- **Subscription Tiers**: Free, Pro, and Team plans with Stripe integration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Animation**: Framer Motion
- **Validation**: Zod
- **Testing**: Jest + fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update `.env.local` with your configuration:
   - Database connection string
   - NextAuth secret (generate with `openssl rand -base64 32`)
   - Stripe API keys
   - Other optional services

5. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard and main app pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── lib/                   # Utility functions and services
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Authentication utilities
│   └── ...               # Other utilities
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   └── property/        # Property-based tests
└── public/              # Static assets
```

## Color Palette

- **Primary**: Deep Indigo (#1E1B4B), Electric Blue (#2563EB)
- **Accent**: Neon Cyan (#22D3EE), Soft Purple (#8B5CF6)
- **Neutral**: Dark Gray (#111827), Light Gray (#F3F4F6), White (#FFFFFF)

## License

Private - All rights reserved

