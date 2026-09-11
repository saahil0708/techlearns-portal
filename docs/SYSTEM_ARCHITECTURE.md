# CodePlatform: End-to-End System Architecture & Infrastructure Blueprint

This document outlines the production architecture, cloud deployment, data flow, notification pipelines, polyglot sandboxed judge execution, and frontend AI code editor workspace for **CodePlatform**.

---

## 1. High-Level Architecture Overview

```mermaid
flowchart TD
    subgraph SCM_CICD ["1. Source Control & CI/CD Pipeline"]
        GH["GitHub Repository\n(Feature Branches / PRs)"]
        ADO["Azure DevOps Pipelines\n(Lint, Test, Docker Build & Scan)"]
        ACR["Azure Container Registry (ACR)\n(Versioned Container Images)"]
        GH -->|Webhooks / PR Triggers| ADO
        ADO -->|Publish Images| ACR
    end

    subgraph CLOUD_APP ["2. Azure Containerized Apps Tier"]
        ACA_FE["Frontend: Next.js SSR (React 19)\n(Azure Container Apps)"]
        ACA_BE["Backend API: NestJS (REST + GraphQL + WS)\n(Azure Container Apps)"]
        ACR -->|Continuous Deployment| ACA_FE
        ACR -->|Continuous Deployment| ACA_BE
    end

    subgraph DATA_STATE ["3. Data & Messaging Tier"]
        PG[("PostgreSQL\n(Azure Flexible Server)\nPrisma ORM")]
        REDIS[("Redis / BullMQ\n(Azure Cache for Redis)\nJob Queues & Session Cache")]
        ACA_BE -->|CRUD & Relations| PG
        ACA_BE -->|Queue Enqueue & Rate Limiting| REDIS
    end

    subgraph NOTIFICATION_ENGINE ["4. Multi-Channel Notification Engine"]
        NOTIF_WORKER["Notification Worker / Outbox Dispatcher"]
        REDIS -->|Notification Events| NOTIF_WORKER
        
        ACS["Azure Communication Services (ACS)\n/ AWS SES (Email)"]
        SMS["SMS Gateway (ACS / Twilio)"]
        WA["WhatsApp Business API"]
        PUSH["Web Push / FCM Notifications"]
        
        NOTIF_WORKER -->|Email Invitations & Alerts| ACS
        NOTIF_WORKER -->|Verification & 2FA SMS| SMS
        NOTIF_WORKER -->|Contest & Batch Updates| WA
        NOTIF_WORKER -->|Real-time Browser / App Push| PUSH
    end

    subgraph JUDGE_ENGINE ["5. Sandboxed Code Execution Engine"]
        JUDGE_PROD["Judge Worker Pool\n(BullMQ Consumer)"]
        REDIS -->|Submission Queue| JUDGE_PROD
        
        DOCKER_SANDBOX["Isolated Docker Sandbox Container\n(C#, Java, C++, Python, Rust, Go)\n• cgroups resource capping\n• seccomp & network disabled\n• Memory & Execution Timers"]
        
        JUDGE_PROD -->|Spawn Sandbox & Mount Source| DOCKER_SANDBOX
        DOCKER_SANDBOX -->|Compile & Run Against Test Cases| DOCKER_SANDBOX
        DOCKER_SANDBOX -->|Verdict: AC, WA, TLE, MLE, CE, RE| JUDGE_PROD
        JUDGE_PROD -->|Persist Submission & Leaderboard Score| PG
        JUDGE_PROD -->|Stream Results via WebSocket / SSE| ACA_BE
    end

    subgraph CLIENT_TIER ["6. Frontend Client & AI Code Editor Workspace"]
        USER["End User / Student / Faculty\n(Browser / Mobile)"]
        USER <-->|HTTPS / WSS (Real-time Stream)| ACA_FE
        ACA_FE <-->|SSR Data Fetching & API Client| ACA_BE
        
        subgraph WORKSPACE ["Interactive Coding Workspace"]
            MONACO["Monaco Code Editor Wrapper\n(Multi-language, Syntax, IntelliSense, Diffs)"]
            AI_WRAPPER["AI Coding Assistant Pane\n(Complexity Analysis, Hints, Test Cases)"]
            TEST_RUNNER["Split-Pane Test Runner & Verdict Console"]
            MONACO <--> AI_WRAPPER
            MONACO --> TEST_RUNNER
        end
    end
```

---

## 2. Component Specifications

### 2.1 Code Management & CI/CD Pipeline
- **Source Control**: GitHub organization with branch protection rules (`main`, `staging`, `feature/*`).
- **Automation Engine**: Azure DevOps Pipelines (or GitHub Actions with Azure integration).
  - **Stage 1: Validation**: Oxlint linting, TypeScript typecheck (`tsc --noEmit`), Vitest test suite.
  - **Stage 2: Containerization**: Multi-stage Docker builds for backend and Next.js frontend.
  - **Stage 3: Security & Compliance**: Container vulnerability scan (Trivy / Microsoft Defender for Cloud).
  - **Stage 4: Continuous Delivery**: Blue/Green automated release to Azure Container Apps with zero downtime.

---

### 2.2 Cloud Infrastructure & Deployment (Azure)
- **Frontend App**: Azure Container Apps hosting Next.js 19 SSR runtime, optimized for Core Web Vitals and SSR-first hydration.
- **Backend App**: Azure Container Apps hosting NestJS API running GraphQL (Apollo), REST endpoints, and WebSocket gateways for live judge updates.
- **Auto-scaling Rules**: KEDA-driven scaling based on HTTP request concurrency and BullMQ submission queue depth.

---

### 2.3 Multi-Channel Notification Architecture
- **Reliability Pattern**: Transactional Outbox Pattern with AES-256-GCM encrypted payloads (for activation URLs and sensitive tokens).
- **Supported Channels**:
  | Channel | Primary Provider | Fallback / Alternative | Use Cases |
  | :--- | :--- | :--- | :--- |
  | **Email** | Azure Communication Services (ACS) | AWS SES | Bulk student invitations, password resets, monthly progress digests |
  | **SMS** | Azure Communication Services SMS | Twilio SMS | 2FA verification codes, emergency security alerts |
  | **WhatsApp** | WhatsApp Business API (via Meta/Twilio) | SMS fallback | Contest reminders, deadline countdowns, batch announcements |
  | **Push** | Web Push API / Firebase Cloud Messaging (FCM) | In-App Real-time WS | Live leaderboard rank jumps, submission judge completion |

---

### 2.4 Database & Cache / Message Queue
- **Primary Relational Store**: Azure Database for PostgreSQL (Flexible Server) managed via Prisma ORM.
  - Multi-tenant isolation at College level.
  - Granular indexes on token hashes, user invitations, contest timers, and submission statuses.
- **In-Memory Cache & Queue**: Azure Cache for Redis / Redis 7+.
  - **BullMQ Queues**:
    - `submission-queue`: High-throughput coding problem execution queue.
    - `notification-queue`: Asynchronous multi-channel notification dispatch.
    - `leaderboard-queue`: Real-time score and penalty recalculations.

---

### 2.5 Sandboxed Code Execution (Judge System)
- **Multi-Language Support**: C# (.NET 8), Java 21 (OpenJDK), C++ (GCC 13/Clang), Python 3.12, Go, Rust.
- **Sandbox Security Hardening**:
  - Unprivileged user execution (`nobody`/`sandbox`).
  - Strict resource constraints via Linux `cgroups` (CPU quota, Max RAM 256MB–512MB).
  - Network isolation (`--network none`).
  - Read-only root filesystem with ephemeral `/tmp` execution mounts.
  - `seccomp` profiles blocking unauthorized syscalls (`fork`, `execve`, socket creation).
- **Execution Lifecycle & SLA**:
  - Total turnaround: **10–12 seconds** for full batch test evaluation; **< 1.5s** per individual test case.
  - Verdicts: `ACCEPTED` (AC), `WRONG_ANSWER` (WA), `TIME_LIMIT_EXCEEDED` (TLE), `MEMORY_LIMIT_EXCEEDED` (MLE), `COMPILATION_ERROR` (CE), `RUNTIME_ERROR` (RE), `SYSTEM_ERROR`.

---

### 2.6 Frontend Monaco Editor & AI Workspace
- **Core Editor**: `@monaco-editor/react` embedded inside React 19 Client Component wrapper.
  - Configurable keybindings (VS Code, Vim, Emacs), custom themes (Dark/Cyberpunk/Solarized).
  - Split-pane layout with statement description, code workspace, custom test inputs, and real-time output terminal.
- **AI Copilot Wrapper**:
  - Interactive AI assistance panel (providing algorithmic hints, explaining compilation errors, calculating Big-O time/space complexity, and generating corner test cases without spoiling answers).

---

## 3. Project Directory Structure

```text
├── .github/                      # CI/CD workflows and issue templates
├── azure-pipelines.yml            # Azure DevOps CI/CD pipeline definitions
├── docker/                       # Docker Sandbox environments
│   └── judge/                    # Isolated polyglot compiler & runtime images
│       ├── Dockerfile.cpp        # C++ GCC 13 runner
│       ├── Dockerfile.java       # Java 21 runner
│       ├── Dockerfile.csharp     # C# (.NET 8) runner
│       └── Dockerfile.python     # Python 3.12 runner
├── docs/                         # Architecture, API specs, and project specifications
│   ├── PROJECT_SPEC.md
│   ├── FRONTEND_API_SPEC.md
│   └── SYSTEM_ARCHITECTURE.md
├── prisma/                       # Database schemas and migration history
│   ├── schema.prisma             # PostgreSQL schema models
│   └── migrations/               # Transactional schema migrations
├── frontend/                     # Next.js 19 App Router Frontend (SSR-First)
│   ├── src/
│   │   ├── app/                  # App routes (problems, contests, courses, leaderboard)
│   │   ├── components/
│   │   │   ├── editor/           # Monaco Editor & AI Copilot Wrapper components
│   │   │   ├── judge/            # Live submission terminal & verdict badges
│   │   │   ├── superadmin/       # Management tables (problems, colleges, users)
│   │   │   └── ui/               # Reusable UI component library (Tailwind CSS)
│   │   └── lib/                  # Typed API service client
├── src/                          # NestJS Backend API & Workers
│   ├── auth/                     # JWT, WebAuthn passkeys, TOTP 2FA, token rotation
│   ├── colleges/                 # Multi-tenant college administration & isolation
│   ├── batches/                  # Student cohorts and enrollment rosters
│   ├── courses/                  # Curricula, modules, lessons, and progress tracking
│   ├── problems/                 # Coding problems, test cases, tags, and statements
│   ├── submissions/              # Submission ingestion and BullMQ queue producers
│   ├── judge/                    # BullMQ Judge Workers & Docker Sandbox orchestration
│   ├── notifications/            # Multi-channel notification dispatchers (ACS/SES/SMS/WA)
│   ├── contests/                 # Competitive programming contests & timers
│   ├── leaderboard/              # Real-time contest ranking and score engines
│   ├── users/                    # User identity, outbox invitations, and credentials
│   └── config/                   # Strongly-typed environment validation & config loader
├── docker-compose.yml            # Local dev stack (PostgreSQL, Redis, Sandbox)
├── package.json                  # Root dependencies and scripts
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 4. Verification & Operational Health

- **Unit & Integration Testing**: Vitest test suites across all core domain modules (`pnpm test`).
- **Static Code Analysis**: Oxlint + TypeScript strict mode (`pnpm run lint`, `pnpm exec tsc --noEmit`).
- **Telemetry & Monitoring**: NestJS Observe, Azure Application Insights, and OpenTelemetry instrumentation.
