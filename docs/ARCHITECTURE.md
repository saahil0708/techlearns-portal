# 🏗️ CodePlatform — System Architecture & Technical Blueprint

> **Document Version**: `1.2.0`  
> **Status**: Production Architecture Baseline  
> **Stack**: NestJS 12 · Next.js 19 (React 19) · PostgreSQL · Prisma 6 · Redis · BullMQ · Docker Sandbox  

---

## 🧭 1. Architectural Philosophy & Principles

CodePlatform is architected around five fundamental engineering pillars:

```mermaid
mindmap
  root((Engineering Pillars))
    ⚡ SSR-First Frontend
      Server Components by Default
      Interactive Leaves as Client Components
      Zero Hydration Mismatch
    🛡️ Zero-Trust Sandbox Security
      Hardened Docker Containers
      Read-Only Filesystem & cgroups
      Network Disabled & seccomp
    🏛️ Multi-Tenant Isolation
      College-Level Data Boundary
      Role-Based Guard Hierarchy
      Audit Logging Outbox
    🔄 Event-Driven Queueing
      BullMQ Submissions Processing
      Real-Time WebSocket Feedback
      Exponential Backoff Retries
    📊 Strict Structured Tables
      Clean List Tables with Pagination
      Zero Card Grid Data Presentation
      Export to CSV / Excel
```

---

## 🏛️ 2. High-Level System Architecture (C4 Level 1 & 2)

```mermaid
flowchart TB
    subgraph CLIENT_TIER ["🖥️ Client Application Tier (Next.js 19 App Router)"]
        Browser["🌐 Browser (Student / Faculty / Admin)"]
        SSR["⚡ React Server Components (RSC)"]
        ClientLeaves["🎛️ Interactive Client Leaves (Monaco, Charts, Modals)"]
        Browser <--> SSR
        SSR --> ClientLeaves
    end

    subgraph GATEWAY_API ["🚀 Backend Application Tier (NestJS 12 Modular Monolith)"]
        AuthM["🔐 Auth & Passkey Module"]
        InstM["🏛️ Institutions & Batches Module"]
        CourseM["📚 Courses & Progress Module"]
        ProbM["🧩 Problems, Editorials & Test Cases Module"]
        SubmM["📤 Submissions & Ingestion Module"]
        ContM["🏆 Contests & Arena Module"]
        PotdM["📅 POTD & Daily Streak Module"]
        PlagM["🛡️ Plagiarism & Code Similarity Engine"]
        JudgeWorker["⚙️ BullMQ Judge Worker Pool"]
        
        AuthM --- InstM --- CourseM --- ProbM --- SubmM --- ContM --- PotdM --- PlagM
    end

    subgraph DATA_TIER ["🗄️ Persistence & Messaging Tier"]
        Postgres[("🐘 PostgreSQL 16\n(Prisma ORM Managed)")]
        RedisStore[("🔴 Redis 7+\n(Job Queues & Session Cache)")]
    end

    subgraph JUDGE_SANDBOX ["🔒 Docker Isolated Execution Engine"]
        SandboxContainer["🐳 Polyglot Docker Sandbox\n(GCC 13 / OpenJDK 21 / Python 3.12 / Node 20)"]
    end

    ClientLeaves <-->|REST API & GraphQL & WebSocket| GATEWAY_API
    GATEWAY_API -->|Type-safe Queries & Mutations| Postgres
    GATEWAY_API -->|Enqueue Submissions & Events| RedisStore
    RedisStore -->|Dequeue Submissions| JudgeWorker
    JudgeWorker -->|Spawn Sandbox & Stream I/O| SandboxContainer
    SandboxContainer -->|Return Verdict & Memory/Time| JudgeWorker
    JudgeWorker -->|Persist Verdict & Leaderboard Score| Postgres
```

---

## ⚙️ 3. Backend Architecture (`/server`)

The backend is built as a modular, extensible, and type-safe NestJS application located in [`server/src/`](../server/src/).

### 3.1 Backend Module Breakdown

| Module | Directory | Key Controllers & Services | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Auth** | [`server/src/auth/`](../server/src/auth/) | `AuthController`, `AuthService`, `PasskeyService`, `TwoFactorService` | JWT authentication, refresh token family rotation, WebAuthn passkey registration/assertion, TOTP 2FA setup. |
| **Institutions** | [`server/src/institutions/`](../server/src/institutions/) | `InstitutionsController`, `InstitutionsService` | Multi-tenant institution CRUD, tier management, student capacity quotas, membership role binding. |
| **Batches** | [`server/src/batches/`](../server/src/batches/) | `BatchesController`, `BatchesService` | Student cohort creation, batch rosters, bulk CSV invitation ingestion, student roll numbers. |
| **Courses** | [`server/src/courses/`](../server/src/courses/) | `CoursesController`, `CoursesService`, `ModulesService` | Course catalog, hierarchical modules, markdown lessons, student enrollment, and granular progress tracking. |
| **Problems** | [`server/src/problems/`](../server/src/problems/) | `ProblemsController`, `ProblemsService` | Problem authoring, markdown statements, numerical ratings, public/hidden test case storage, subtask allocations. |
| **Submissions** | [`server/src/submissions/`](../server/src/submissions/) | `SubmissionsController`, `SubmissionsService` | Code submission intake, validation, BullMQ job creation, submission status history. |
| **Judge** | [`server/src/judge/`](../server/src/judge/) | `JudgeProcessor`, `DockerSandboxService` | BullMQ worker consuming submission jobs, spawning Docker sandboxes, enforcing limits, compiling/executing code, evaluating subtask verdicts. |
| **Contests** | [`server/src/contests/`](../server/src/contests/) | `ContestsController`, `ContestsService`, `LeaderboardService` | Competitive programming contests, problem mappings, contest timers, real-time START256 matrix leaderboards. |
| **Users** | [`server/src/users/`](../server/src/users/) | `UsersController`, `UsersService` | User identity management, competitive profile stats, 365-day activity heatmaps, contest rating history. |

---

### 3.2 Dual API Strategy: REST & GraphQL

```mermaid
flowchart LR
    Client["Client / Frontend"]
    Client -->|CRUD & File Operations| REST["REST API (/api/v1)\n• OpenAPI / Swagger Documentation\n• Strict Validation with DTOs & class-validator"]
    Client -->|Complex Nested Queries| GQL["GraphQL API (/graphql)\n• Apollo Server v5 Integration\n• Auto-generated SDL schema (schema.gql)\n• Granular Field Resolvers"]
```

---

## 🖥️ 4. Frontend Architecture (`/client`)

The frontend is built on **Next.js 19 App Router** utilizing an **SSR-First (Server-Side Rendering)** architecture to maximize performance, SEO, and developer ergonomics.

### 4.1 Rendering & Component Boundaries

```mermaid
graph TD
    Page["📄 Page (Server Component / RSC)\n• Fetches Initial Data on Server\n• Validates Session & Role Guards\n• Zero Client Bundle Overhead"]
    Page --> Layout["🧱 Server Layout & Navigation"]
    Page --> DataView["📋 Structured List Table (RSC / Suspense)"]
    DataView --> InterLeaves["🎛️ Client Leaf Components ('use client')"]
    
    subgraph CLIENT_LEAVES ["Interactive Leaves Only"]
        Monaco["💻 Monaco Code Editor Pane"]
        RatingChart["📈 Recharts Rating Progression"]
        Heatmap["🗓️ 365-Day Activity Heatmap"]
        Modals["🪟 Interactive Dialogs & Form Modals"]
    end
    
    InterLeaves --- Monaco
    InterLeaves --- RatingChart
    InterLeaves --- Heatmap
    InterLeaves --- Modals
```

### 4.2 Frontend Directory Structure

```text
client/src/
├── app/                          # Next.js App Router route hierarchy
│   ├── (auth)/                   # Login, Register, Accept Invitation
│   ├── problems/                 # Problem Archive & Problem Solver Workspace
│   ├── courses/                  # Course Catalog, Modules & Lesson Viewer
│   ├── contests/                 # Contest Arena & START256 Leaderboard
│   ├── students/                 # Student Portfolio, Ratings & Heatmap
│   ├── faculty/                  # Faculty Authoring & Grading Portal
│   ├── institution-admin/        # Batch Rosters & Quota Management
│   └── superadmin/               # Platform Governance & System Telemetry
├── components/                   # Reusable UI & Domain Components
│   ├── shared/                   # StarRatingBadge, Navigation, Breadcrumbs
│   ├── tables/                   # Standardized List Table Components
│   ├── problems/                 # Monaco Editor, Split-Pane Runner, Subtasks
│   └── students/                 # Rating charts, activity heatmaps
├── context/                      # React Context providers (Auth, Theme)
├── lib/                          # Centralized Typed API Client
├── store/                        # Redux Toolkit Global State Store
└── types/                        # Shared TypeScript Interface Definitions
```

---

## 🔒 5. Polyglot Sandboxed Judge Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Student as 🧑‍🎓 Student
    participant IDE as 💻 Monaco Workspace
    participant API as 🚀 Submissions API
    participant Redis as 🔴 Redis (BullMQ)
    participant Worker as ⚙️ Judge Worker
    participant Docker as 🐳 Docker Sandbox
    participant DB as 🐘 PostgreSQL

    Student->>IDE: Click 'Submit Solution'
    IDE->>API: POST /submissions {problemId, language, sourceCode}
    API->>DB: Create Submission (Status: QUEUED)
    API->>Redis: Add Job to 'submission-queue'
    API-->>IDE: Return Submission ID
    
    Worker->>Redis: Dequeue Submission Job
    Worker->>DB: Update Submission (Status: PROCESSING)
    
    Worker->>Docker: Spawn Container (cgroups: 256MB, CPU: 100%, net: none)
    Docker->>Docker: Compile Source Code
    alt Compilation Error
        Docker-->>Worker: CE (Compiler Error Output)
    else Compilation Success
        loop For Each Test Case / Subtask
            Docker->>Docker: Execute with Input under Timers
            Docker-->>Worker: Execution Output, Time (ms), RAM (KB)
            Worker->>Worker: Validate against Expected Output
        end
    end
    
    Worker->>DB: Save Final Verdict (AC, WA, TLE, MLE, CE, RE) & Stats
    opt Contest Mode
        Worker->>DB: Update Leaderboard Score & Penalty Time
    end
    Worker-->>IDE: Push Real-Time Verdict via WebSocket
```

### 5.1 Sandbox Isolation Specifications

- **Resource Limits (Linux cgroups)**:
  - Max Memory: $256\text{ MB} - 512\text{ MB}$ (Hard limit via `--memory` and `--memory-swap`).
  - Max CPU Quota: $100\%$ of single core (`--cpus="1.0"`).
  - Process Limit: Max 32 spawned processes (`--pids-limit 32`) preventing fork bombs.
- **Filesystem Security**:
  - Root filesystem mounted strictly **Read-Only** (`--read-only`).
  - Temporary workspace mounted via ephemeral `tmpfs` (`/tmp:rw,noexec,nosuid,size=64m`).
- **Network Isolation**: Strict `--network none` preventing socket connection attempts, exfiltration, or LAN scanning.
- **Syscall Filtering**: `seccomp` profile barring unauthorized kernel calls (`ptrace`, `chroot`, `syslog`, `reboot`).

---

## 🗄️ 6. Relational Entity-Relationship (ER) Model

```mermaid
erDiagram
    User ||--o{ InstitutionMembership : "has"
    User ||--o{ BatchStudent : "enrolled in"
    User ||--o{ Course : "creates"
    User ||--o{ Enrollment : "takes"
    User ||--o{ LessonProgress : "completes"
    User ||--o{ Problem : "authors"
    User ||--o{ Submission : "submits"
    User ||--o{ Contest : "organizes"
    User ||--o{ ContestRegistration : "registers"
    User ||--o{ LeaderboardEntry : "ranks in"
    User ||--o{ PasskeyCredential : "owns"
    User ||--o{ RefreshToken : "holds"

    Institution ||--o{ InstitutionMembership : "includes"
    Institution ||--o{ Batch : "contains"
    Institution ||--o{ Course : "offers"
    Institution ||--o{ Problem : "manages"
    Institution ||--o{ Contest : "hosts"

    Batch ||--o{ BatchStudent : "rosters"

    Course ||--o{ Module : "structures"
    Course ||--o{ Enrollment : "receives"
    Module ||--o{ Lesson : "contains"
    Lesson ||--o{ LessonProgress : "tracks"

    Problem ||--o{ TestCase : "validates with"
    Problem ||--o{ Submission : "evaluated by"
    Problem ||--o{ ContestProblem : "mapped to"

    Contest ||--o{ ContestProblem : "includes"
    Contest ||--o{ ContestRegistration : "accepts"
    Contest ||--o{ Submission : "records"
    Contest ||--o{ LeaderboardEntry : "tallies"
```

---

## 🛡️ 7. Multi-Tenant Security & Isolation Model

```mermaid
flowchart TD
    Req["Incoming HTTP Request"] --> TokenGuard["1. JwtAuthGuard\n(Validate JWT & User Status)"]
    TokenGuard --> RolesGuard["2. RolesGuard\n(Check SUPER_ADMIN, FACULTY, STUDENT)"]
    RolesGuard --> TenancyGuard["3. CollegeAccessGuard\n(Enforce Institution Membership & Tenant Isolation)"]
    TenancyGuard --> Controller["4. Modular Controller Action Execution"]
    Controller --> PrismaService["5. PrismaService Data Access (Tenant-Scoped Queries)"]
```

### 7.1 Security Invariants
1. **Never leak password hashes**: Excluded globally via class-transformer interceptors and Prisma select projections.
2. **Protect hidden test cases**: Student queries cannot view `TestCase` where `isHidden: true`.
3. **Outbox invitation encryption**: Activation hashes and invitation URLs are cryptographically protected.
4. **Isolated execution**: No submitted source code is ever evaluated within the host API process.
