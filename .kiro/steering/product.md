# Product Overview

FocusForge is a SaaS deep work and productivity application that helps users track focus sessions, manage tasks, and improve productivity through analytics and weekly reviews.

## Deployment Targets

- **Web version**: Standard Next.js web application
- **Desktop version**: Tauri-based desktop app that connects to the web server's API routes

Both versions share the same MongoDB database and NextAuth authentication system. The desktop app is a lightweight client that makes HTTP requests to the Next.js server for all data operations.

## Core Features

- Focus session tracking with distraction monitoring
- Task management with customizable states and priorities
- Weekly reviews with AI-powered insights
- Analytics dashboard with productivity metrics
- Team collaboration and leaderboards
- Subscription tiers (FREE, PRO, TEAM) with feature gating

## Authentication

Dual authentication system:
- NextAuth with credentials provider (email/password)
- Firebase authentication integration
- Both web and desktop use the same cloud-based auth and data storage

## Key User Flows

1. User registers/logs in → Onboarding flow → Dashboard
2. Create tasks → Start focus session → Track distractions → Complete session
3. View analytics → Generate weekly review → Get AI insights
4. Manage team → Invite members → View leaderboard
