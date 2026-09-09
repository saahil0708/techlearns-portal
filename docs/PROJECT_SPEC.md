# CodePlatform - Full-Stack Project Specification

## 1. Project Overview

### Project Name
**CodePlatform**

### Project Type
An enterprise-grade, full-stack CodeChef/LeetCode-style online learning and competitive programming platform tailored for universities, faculty, and students.

### Main Purpose
The platform facilitates:
- **Platform administrators** to manage colleges, global system settings, and platform-wide resources.
- **College administrators** to manage faculty members, student batches/cohorts, and academic course assignments.
- **Faculty** to author structured courses, modular lessons, coding problems, public & hidden test cases, and competitive contests.
- **Students** to learn programming, read interactive lessons, solve coding problems across multiple languages, submit code to an automated judge, and participate in ranked contests.
- **Automated Judge System** to securely compile, sandbox, execute, and evaluate user code submissions asynchronously.
- **Competitive Contests** with dynamic score calculation, penalty time tracking, and real-time leaderboards.
- **Modern Responsive Frontend** providing an interactive problem-solving IDE workspace, curriculum viewer, and live contest dashboard.

---

## 2. Technology Stack

### Backend (`/`)
- **Framework**: Node.js, NestJS (TypeScript, ESM)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Cache & Message Queue**: Redis, BullMQ
- **Authentication & Security**: JWT (JSON Web Tokens), Passport.js, bcryptjs
- **API Documentation**: Swagger / OpenAPI (`/api/docs`)
- **Testing**: Vitest, Supertest, Oxlint
- **Package Manager**: pnpm

### Frontend (`/frontend`)
- **Framework**: Next.js (App Router), React 19, TypeScript
- **Rendering Strategy**: SSR-First (React Server Components wherever possible; client components only for interactive UI & browser APIs)
- **Styling**: Tailwind CSS
- **Icons**: React Icons / Lucide React
- **Client State & API Layer**: Typed API Client (`src/lib/api.ts`), Auth Context (`src/lib/AuthContext.tsx`)
- **Package Manager**: pnpm

### Infrastructure & Execution Sandboxing
- **Database & Cache**: Dockerized PostgreSQL (port `5433`) & Redis (port `6379`)
- **Execution Sandbox**: Isolated ephemeral Docker containers with CPU quotas, memory limits, and zero network access

---

## 3. Core User Roles & Responsibilities

| Role | Scope | Key Responsibilities |
|---|---|---|
| `SUPER_ADMIN` | Global Platform | Complete platform control, configure system settings, view all colleges & users, bypass tenant boundaries. |
| `PLATFORM_ADMIN` | Global Platform | Manage colleges, college admins, view platform metrics, manage platform-level global problems & contests. |
| `COLLEGE_ADMIN` | College / Organization | Manage college profile, faculty rosters, student batches/cohorts, and course allocations. |
| `FACULTY` | College / Academic | Create/manage courses, modules, lessons, coding problems, test cases, contests; monitor student progress. |
| `STUDENT` | College / Learning | View enrolled courses, read lessons, solve coding problems, submit code in supported languages, join contests. |

---

## 4. Full-Stack Directory Structure

```
cc/
├── src/                          # Backend (NestJS)
│   ├── main.ts                   # Entry point, global validation pipes, filters, interceptors, Swagger setup
│   ├── app.module.ts             # Root application module
│   │
│   ├── config/                   # Environment configuration & Joi/class-validator validation
│   │   ├── configuration.ts
│   │   └── env.validation.ts
│   │
│   ├── common/                   # Shared guards, interceptors, filters, decorators, types
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── college-access.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts
│   │   └── types/
│   │       └── current-user.interface.ts
│   │
│   ├── prisma/                   # Database Service & Module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── auth/                     # Authentication Module (JWT, Passport, bcryptjs)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── users/                    # Users Identity & Credential Sanitization Module
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── colleges/                 # Multi-Tenant College Organization Module
│   │   ├── colleges.controller.ts
│   │   ├── colleges.service.ts
│   │   ├── colleges.module.ts
│   │   └── dto/
│   │       ├── create-college.dto.ts
│   │       ├── update-college.dto.ts
│   │       └── add-member.dto.ts
│   │
│   ├── batches/                  # Student Cohorts & Batches Module
│   │   ├── batches.controller.ts
│   │   ├── batches.service.ts
│   │   ├── batches.module.ts
│   │   └── dto/
│   │       ├── create-batch.dto.ts
│   │       ├── update-batch.dto.ts
│   │       └── assign-students.dto.ts
│   │
│   ├── courses/                  # Course Curriculum, Modules, Lessons & Progress
│   │   ├── courses.controller.ts
│   │   ├── courses.service.ts
│   │   ├── courses.module.ts
│   │   └── dto/
│   │       ├── create-course.dto.ts
│   │       ├── update-course.dto.ts
│   │       ├── create-module.dto.ts
│   │       ├── update-module.dto.ts
│   │       ├── create-lesson.dto.ts
│   │       ├── update-lesson.dto.ts
│   │       └── update-progress.dto.ts
│   │
│   ├── problems/                 # Coding Problems, Statement Markdown, Test Cases
│   ├── submissions/              # Submission intake & queue dispatching
│   ├── judge/                    # BullMQ processor & Docker execution sandbox
│   ├── contests/                 # Competitive contest scheduling & registration
│   └── leaderboard/              # Score calculation, penalties & live rankings
│
├── prisma/                       # Database migrations & Schema
│   ├── schema.prisma             # Multi-tenant schema definition
│   ├── migrations/               # Applied PostgreSQL migrations
│   └── seed.ts                   # Initial seed script (SuperAdmin, College, Faculty, Student, Problem)
│
├── frontend/                     # Frontend Application (Next.js 16 + React 19)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Global dark layout, fonts, header navbar, footer
│   │   │   ├── page.tsx          # High-impact Hero Landing Page with live stats
│   │   │   ├── login/            # User login with 1-click demo accounts
│   │   │   ├── register/         # User registration
│   │   │   ├── problems/         # Problem explorer with search & difficulty filters
│   │   │   │   └── [slug]/       # Problem solving workspace & code editor
│   │   │   ├── courses/          # Course tracks & curriculum catalog
│   │   │   ├── contests/         # Live, upcoming & past contests dashboard
│   │   │   ├── leaderboard/      # Real-time podium & rank board
│   │   │   └── globals.css       # Tailwind directives & design tokens
│   │   ├── components/           # Navbar, Footer, UI Cards
│   │   └── lib/
│   │       ├── api.ts            # Centralized typed HTTP client
│   │       └── AuthContext.tsx   # React Authentication Context & session hook
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml            # Local PostgreSQL (5433) & Redis (6379)
├── test/                         # Unit & E2E Test Suites
├── package.json                  # Root backend dependencies & scripts
├── AGENTS.md                     # Engineering instructions & rules
└── README.md
```

---

## 5. Request Flow & Execution Architecture

### Standard API Request Flow
```
Client (Next.js Frontend)
  ↓
Controller
  ↓
DTO Validation (ValidationPipe)
  ↓
Authentication Guard (JwtAuthGuard)
  ↓
Authorization Guard (RolesGuard, CollegeAccessGuard)
  ↓
Service
  ↓
Prisma Service
  ↓
PostgreSQL Database
  ↓
Response Interceptor (Standard Success Envelope)
  ↓
Client (Next.js Frontend)
```

### Code Submission & Judge Execution Flow
```
Student submits code (POST /submissions)
  ↓
JWT & Role Validation
  ↓
SubmissionService creates Submission record (status: QUEUED)
  ↓
Submission job pushed to BullMQ Queue
  ↓
API returns submission ID immediately (201 Created / 202 Accepted)
  ↓
[Asynchronous Worker Process]
  ↓
BullMQ Worker picks up job
  ↓
Worker updates Submission status to PROCESSING
  ↓
Worker retrieves Problem & TestCases from Database
  ↓
Worker initializes isolated Docker sandbox
  ↓
Compile Code (if compiled language: C++, Java, etc.)
  ↓
Run against public & hidden TestCases within CPU / Memory / Time limits
  ↓
Compare stdout with expectedOutput (handling trailing whitespace/newlines)
  ↓
Compute Verdict (ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, etc.)
  ↓
Update Submission record with Verdict, Runtime, Memory, Error logs
```

---

## 6. Database Entities & Schema Design

### Core Models
- **User**: `id`, `name`, `email`, `passwordHash`, `globalRole` (`SUPER_ADMIN`, `PLATFORM_ADMIN`, `COLLEGE_ADMIN`, `FACULTY`, `STUDENT`), `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`), `createdAt`, `updatedAt`
- **College**: `id`, `name`, `code`, `email`, `phone`, `address`, `status` (`ACTIVE`, `INACTIVE`), `createdAt`, `updatedAt`
- **CollegeMembership**: `id`, `userId`, `collegeId`, `role` (`COLLEGE_ADMIN`, `FACULTY`, `STUDENT`), `createdAt`, `updatedAt`
- **Batch**: `id`, `name`, `collegeId`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt`
- **BatchStudent**: `id`, `batchId`, `userId`, `enrolledAt`
- **Course**: `id`, `title`, `description`, `collegeId` (optional), `createdById`, `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `createdAt`, `updatedAt`
- **Module**: `id`, `courseId`, `title`, `description`, `order`, `createdAt`, `updatedAt`
- **Lesson**: `id`, `moduleId`, `title`, `content`, `order`, `createdAt`, `updatedAt`
- **Enrollment**: `id`, `userId`, `courseId`, `status` (`ACTIVE`, `COMPLETED`, `DROPPED`), `enrolledAt`, `completedAt`
- **LessonProgress**: `id`, `userId`, `lessonId`, `completed`, `completedAt`
- **Problem**: `id`, `title`, `slug`, `statement`, `inputFormat`, `outputFormat`, `constraints`, `difficulty` (`EASY`, `MEDIUM`, `HARD`), `timeLimit`, `memoryLimit`, `collegeId`, `createdById`, `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `createdAt`, `updatedAt`
- **TestCase**: `id`, `problemId`, `input`, `expectedOutput`, `isHidden`, `explanation`, `order`, `createdAt`, `updatedAt`
- **Submission**: `id`, `userId`, `problemId`, `contestId` (optional), `language` (`CPP`, `JAVA`, `PYTHON`, `JAVASCRIPT`, `C`), `sourceCode`, `status`, `verdict`, `runtime`, `memory`, `errorMessage`, `passedTestCases`, `totalTestCases`, `createdAt`, `updatedAt`
- **Contest**: `id`, `title`, `description`, `startTime`, `endTime`, `collegeId`, `createdById`, `status` (`UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`), `createdAt`, `updatedAt`
- **ContestProblem**: `id`, `contestId`, `problemId`, `points`, `order`
- **ContestRegistration**: `id`, `contestId`, `userId`, `registeredAt`
- **LeaderboardEntry**: `id`, `contestId`, `userId`, `score`, `penalty`, `rank`, `updatedAt`

### Status & Verdict Enums
- **SubmissionStatus**: `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`
- **SubmissionVerdict**: `ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, `MEMORY_LIMIT_EXCEEDED`, `RUNTIME_ERROR`, `COMPILATION_ERROR`, `SYSTEM_ERROR`

---

## 7. API Design & Standard Response Envelope

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Standard Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "NOT_FOUND",
  "statusCode": 404
}
```

---

## 8. Judge System & Security Constraints

### Critical Security Policies
1. **Never execute untrusted code in the main API process.**
2. **Containerization**: Each submission runs in an isolated ephemeral Docker container.
3. **Resource Boundaries**:
   - Explicit CPU quotas (e.g., `--cpus="1.0"`)
   - Strict Memory Limits (e.g., `-m 256m --memory-swap 256m`)
   - Timeouts using execution wrapper / timeout command
   - Process Limits (PID limit to prevent fork bombs)
   - Read-only file system with ephemeral `/tmp` volume
   - **No Network Access** (`--network none`)
   - Non-root user execution

---

## 9. Frontend Design Guidelines & Key Features

1. **Aesthetics**:
   - Modern developer-centric dark theme with glowing accents, crisp typography (`Inter` & `JetBrains Mono`), and glassmorphism borders.
   - Smooth hover animations, active indicators, and responsive mobile drawer navigation.
2. **Interactive Code Workspace (`/problems/[slug]`)**:
   - Split-view layout: Left pane for problem description, constraints, and sample test cases; Right pane for code editor, language selector (C++, Python, Java, JS), Run Test Cases button, and Submit button.
   - Real-time verdict badge (`ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, etc.).
3. **Course Learning Portal (`/courses`)**:
   - Curriculum tracks, module counts, instructor tags, and enrollment actions.
4. **Competitive Contest Dashboard (`/contests`)**:
   - Live status badges (`ONGOING`, `UPCOMING`, `COMPLETED`), start/end countdown timers, and instant registration.
5. **Real-Time Leaderboard (`/leaderboard`)**:
   - Top 3 podium highlight cards, Global vs. College rank toggle, penalty times, and real-time score ranking table.

---

## 10. Phased Implementation Roadmap

- [x] **Phase 1 — Project Setup**: NestJS structure, config validation, basic health check, Swagger setup, response interceptor, exception filter.
- [x] **Phase 2 — Database Foundation**: Prisma multi-tenant schema, PostgreSQL & Redis Docker setup, initial migrations, seed script.
- [x] **Phase 3 — Authentication & Identity**: User lookup, bcrypt hashing, registration, login, `/auth/me`, Passport JWT Strategy.
- [x] **Phase 4 — Authorization & Tenant Guard**: `@Roles()`, `RolesGuard`, `CollegeAccessGuard` for strict college data isolation.
- [x] **Phase 5 — College & Batch Management**: Colleges CRUD, membership management, Batches CRUD, student cohort assignments.
- [x] **Phase 6 — Courses, Modules, Lessons & Progress**: Course curriculum authoring, module/lesson hierarchy, student enrollment, lesson progress tracking.
- [x] **Phase 7 — Frontend Application Setup**: Next.js App Router, Tailwind CSS, React Icons, Landing Page, Problems Explorer, Split-Pane Code Editor Workspace, Courses Catalog, Contests Dashboard, Leaderboard, and Login/Register pages.
- [ ] **Phase 8 — Coding Problems Backend API**: Problem CRUD endpoints, hidden vs public test case segregation (Rule 10).
- [ ] **Phase 9 — Code Submission & Sandboxed Judge Worker**: BullMQ queue, Docker execution worker container, verdict comparator.
- [ ] **Phase 10 — Contests & Real-Time Leaderboard Engine**: Contest timers, registration, live penalty and score engine.
- [ ] **Phase 11 — End-to-End Integration & Deployment**: Full full-stack integration, Docker Compose production build, and CI/CD pipelines.

---

## 11. Institution & Student Onboarding Specification

### 11.1 Hierarchical Code System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Institution / College                    │
│            Auto-Generated Unique Code (e.g. IITB)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│       Batch 1: CSE 2026      │    │    Batch 2: AI & DS 2027     │
│   Sub-Code: IITB-CS26        │    │    Sub-Code: IITB-AI27       │
└──────────────┬───────────────┘    └──────────────┬───────────────┘
               │                                   │
               ▼                                   ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  Student Roster (Automated)  │    │  Student Roster (Automated)  │
└──────────────────────────────┘    └──────────────────────────────┘
```

### 11.2 Key Mechanics & Rules

1. **Auto-Generated Meaningful Unique Codes**:
   - **College Code**: When an institution is added manually or via bulk CSV/Excel upload by SuperAdmin, the platform automatically generates a unique, human-readable uppercase code based on the institution's name and acronym (e.g., `IITB`, `MIT-EECS`, `STAN-CS`).
   - **Batch Sub-Unique Code**: When a cohort/batch is created under an institution, the platform auto-generates a sub-unique join code prefixed with the parent college code (e.g., `IITB-CS26`, `IITB-AI27`).

2. **Student Onboarding Paths**:
   - **Path A: Direct Batch Join (Fastest 1-Step Onboarding)**
     - Student enters a batch sub-code (e.g., `IITB-CS26`) during sign-up or from their profile.
     - The platform automatically:
       1. Affiliates the student with the institution (`user.institution = college.name`).
       2. Creates a `CollegeMembership` record (`role = STUDENT`).
       3. Enrolls the student into the target batch (`BatchStudent` relation).
   - **Path B: College-Wide Join**
     - Student enters the top-level college code (e.g., `IITB`).
     - Student is affiliated with the institution as a general member; faculty can assign them to specific batches at any time.

3. **Faculty Powers & Roster Management**:
   - Faculty members can generate and copy batch join links/codes to share with their students.
   - Faculty can directly enroll students by email or upload CSV class rosters directly into their assigned batches.

4. **Email Freedom**:
   - Students can register with any valid email provider (Gmail, Outlook, personal, or institutional domain); access is authenticated and verified via the cryptographic code lookup.

5. **Platform-Wide Affiliation**:
   - Verified institution branding and batch badges are automatically displayed on:
     - Student Profile & Overview
     - Live Global & College Leaderboards
     - Timed Contest Standings
     - Submission Logs & SuperAdmin Directories

