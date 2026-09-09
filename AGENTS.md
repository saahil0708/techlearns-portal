# Agent Instructions

## Project Overview

**CodePlatform** is a full-stack learning and competitive programming platform tailored for colleges, faculty, and students (CodeChef / LeetCode style).

## Technology Stack

### Backend (`/`)
- **Framework**: NestJS (TypeScript, Node.js, ESM)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Cache & Message Queue**: Redis, BullMQ
- **Authentication**: JWT, Passport.js, bcryptjs
- **API Documentation**: Swagger / OpenAPI (`/api/docs`)
- **Testing**: Vitest, Supertest, Oxlint
- **Package Manager**: pnpm

### Frontend (`/frontend`)
- **Framework**: Next.js (App Router), React 19, TypeScript
- **Rendering Strategy**: SSR-First (React Server Components by default; client components strictly for interactive state/browser APIs)
- **Styling**: Tailwind CSS
- **Icons & UI**: Lucide React
- **HTTP Client**: Fetch API / Custom typed API client connected to backend (`http://localhost:3000`)
- **Package Manager**: pnpm

## Architecture

### Backend Modules:
- `auth`: JWT registration, login, profile resolution
- `users`: User identity management and credential sanitization
- `colleges`: Multi-tenant organization CRUD and member roles
- `batches`: Student cohorts and roster management
- `courses`: Curriculum, modules, lessons, enrollments, and progress
- `problems`: Coding problems, statement markdown, tags, test cases
- `submissions`: Solution submission handling and queue dispatching
- `judge`: BullMQ worker, Docker sandbox execution, evaluation
- `contests`: Competitive contests, problem mappings, timers
- `leaderboard`: Real-time score calculation, penalties, and rankings

### Frontend App Structure:
- `src/app/page.tsx`: Modern Landing / Hero portal with live platform metrics & quick actions
- `src/app/problems/`: Problem explorer with search, tags, and difficulty filtering
- `src/app/problems/[slug]/`: Problem solving workspace with split-pane code editor, test runner, and submission verdicts
- `src/app/courses/`: Course catalog and interactive lesson viewer with progress tracker
- `src/app/contests/`: Active, upcoming, and past contest dashboard with countdowns
- `src/app/leaderboard/`: Live rank board with score breakdown and penalty time
- `src/app/login/` & `src/app/register/`: Authentication pages connected to NestJS backend
- `src/components/`: Reusable navigation bar, footer, code editor, modals, and badges
- `src/lib/api.ts`: Centralized typed API client handling tokens and standard response envelopes

## Core Rules

1. **Inspect Before Modifying**: Inspect existing code before making changes.
2. **Modular Architecture**: Keep backend business logic in services and controllers thin; keep frontend components modular and reusable.
3. **SSR by Default**: Wherever SSR (Server-Side Rendering / React Server Components) is possible, use SSR by default for pages, layouts, and data-fetching boundaries. Strictly limit Client Components (`'use client'`) to interactive leaves, event handlers, client state (`useState`/`useEffect`), or browser-only dependencies (e.g., chart rendering).
4. **Multi-Tenant Isolation**: Enforce college-level data isolation via `CollegeAccessGuard`.
5. **Security First**:
   - Never expose password hashes.
   - Never expose hidden problem test cases to students.
   - Never execute submitted code inside the main API process.
6. **UI & Design Excellence**:
   - Craft sleek, modern developer-focused aesthetics (clean dark themes, rich gradients, smooth transitions, glassmorphism cards).
   - Responsive layouts optimized for desktops, laptops, and mobile screens.
7. **Input Validation**: Use DTOs with `class-validator` on the backend and typed form schemas on the frontend.
8. **Database Integrity**: Always use `PrismaService` for database operations.
9. **Verification**: Run tests and linting after implementation; never claim a task is complete without verification.
10. **Data Presentation Standard**: For viewing multi-item collections and datasets (colleges, problems, submissions, student rosters, courses, contests), strictly use clean, structured **list table format only** (with search, filtering, pagination, and Excel/CSV export) rather than card grid layouts.

## Required Report

After completing a task or phase, report:
- Summary of implementation
- Files changed
- Database changes
- API endpoints / Frontend routes
- Tests added / UI components built
- Commands executed
- Test and lint results
- Remaining issues
