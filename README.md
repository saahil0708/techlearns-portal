# CodePlatform (TechLearns Portal)

> Full-stack learning, enterprise proctoring, and competitive programming platform tailored for colleges, faculty, and students (CodeChef / LeetCode style) with automated multi-language sandboxed code evaluation, live proctoring checks, and multi-channel notifications.

---

## Key Architectural Highlights

- **Code Management & CI/CD**: GitHub monorepo integrated with Azure DevOps pipelines (`azure-pipelines.yml`) for automated linting, test suites, and multi-stage container image publishing.
- **Cloud Infrastructure**: Azure Container Apps (Bicep IaC) hosting Next.js 19 SSR frontend (`client/`) and NestJS API backend (`server/`).
- **Proctoring & System Check**: Integrated hardware diagnostic suite (Camera, Microphone, Screen share, Audio output, Network latency).
- **Multi-Channel Notifications**: Email (Azure Communication Services), SMS, WhatsApp Business API, and Web Push notifications via transactional outbox worker.
- **Database & State**: PostgreSQL (Azure Flexible Server) with Prisma ORM + Azure Service Bus for high-throughput queues and In-Memory AppCacheService.
- **Polyglot Sandboxed Judge**: Docker-isolated execution environment (C, C++, Java, Python, Node.js) with strict resource limits and real-time result streaming.
- **Monaco Code Editor & AI Workspace**: React 19 Monaco editor wrapper with custom themes, test runner console, and AI Copilot assistant.

Detailed system documentation and engineering guidelines are available in [`docs/`](./docs/):

| Document | Description |
| :--- | :--- |
| 📋 [**PRD.md**](./docs/PRD.md) | Product Requirements Document: Roles, features, KPIs, and roadmap |
| 🏗️ [**ARCHITECTURE.md**](./docs/ARCHITECTURE.md) | System architecture, NestJS modules, Next.js RSC, Docker sandbox, and ER diagram |
| 🎨 [**DESIGN.md**](./docs/DESIGN.md) | UI/UX design system, Star rating tokens, hybrid light/dark themes, and table standards |
| 📜 [**RULES.md**](./docs/RULES.md) | Mandatory engineering invariants, security rules, and Rule #10 list table standard |
| 📋 [**TASKS.md**](./docs/TASKS.md) | Engineering task breakdown, priorities (`P0`–`P3`), statuses, and acceptance criteria |
| 🧠 [**MEMORY.md**](./docs/MEMORY.md) | Persistent project memory, ADR logs, domain glossary, and port mappings |
| ☁️ [**infra/README.md**](./infra/README.md) | Azure Bicep IaC, CAF naming standards, and Azure CLI deployment guide |

---

## Technology Stack

### Backend (`/server`)
- **Framework**: NestJS (TypeScript, Node.js 22, ESM)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Cache & Message Queue**: Azure Service Bus, In-Memory AppCacheService
- **Authentication**: JWT, WebAuthn Passkeys, TOTP 2FA, bcryptjs
- **API Formats**: GraphQL (`/graphql`) & REST OpenAPI (`/api/docs`)
- **Testing & Quality**: Vitest, Supertest, Oxlint

### Frontend (`/client`)
- **Framework**: Next.js (App Router, SSR-First, React 19)
- **Styling**: Tailwind CSS & MUI Components
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Icons**: Lucide React & React Icons & MUI Icons
- **HTTP Client**: Centralized typed API client connected to backend (`http://localhost:8000`)

---

## Project Structure

```text
├── docker/                       # Sandbox container definition for isolated code execution
│   └── judge/                    # Ubuntu 24.04 polyglot compiler/runner sandbox
├── docs/                         # Engineering specifications, PRD, and architecture docs
├── infra/                        # Azure Bicep Infrastructure-as-Code (CAF compliant)
├── client/                       # Next.js 19 SSR Frontend application (Port 3000)
│   ├── src/app/                  # App Router pages & routes (Problems, Contests, System Check)
│   ├── src/components/           # Reusable UI components & modals
│   └── src/lib/                  # Typed API client & utilities
├── server/                       # NestJS Backend API & background workers (Port 8000)
│   ├── prisma/                   # Database schema & migrations
│   ├── src/auth/                 # Authentication & credential security
│   ├── src/colleges/             # Multi-tenant college management
│   ├── src/batches/              # Student cohorts and batch rosters
│   ├── src/courses/              # Course catalog and interactive lessons
│   ├── src/problems/             # Coding problem repository & test cases
│   ├── src/submissions/          # Submissions and evaluation queue
│   ├── src/judge/                # Sandboxed execution worker & Docker runner
│   ├── src/contests/             # Competitive programming contests
│   └── src/users/                # User identity & outbox invitations
├── Dockerfile                    # Unified multi-stage Dockerfile (backend, frontend, judge-worker)
├── docker-compose.yml            # Local full-stack orchestration (PostgreSQL, Backend, Client)
└── azure-pipelines.yml           # CI/CD Azure DevOps pipeline for ACR & ACA deployment
```

---

## Quick Start

### 1. Start Infrastructure (PostgreSQL & Sandboxes)
```bash
# Start PostgreSQL database (port 5433 -> 5432)
docker compose up -d postgres

# (Optional) Build local sandbox image for code evaluation:
docker build -t codeplatform-judge:latest ./docker/judge
```

### 2. Install Dependencies & Generate Prisma Client
```bash
# Install root monorepo dependencies
pnpm install

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate
```

### 3. Run Development Servers
```bash
# Start both backend and frontend concurrently:
pnpm dev

# Or start individually:
pnpm dev:server   # Starts NestJS API on http://localhost:8000
pnpm dev:client   # Starts Next.js on http://localhost:3000
```

---

## Docker & Containerization

### Unified Multi-Stage Dockerfile Targets

```bash
# 1. Build Backend API:
docker build --target backend -t codeplatform-backend .

# 2. Build Next.js Frontend:
docker build --target frontend -t codeplatform-frontend .

# 3. Build Judge Worker:
docker build --target judge-worker -t codeplatform-judge-worker .
```

---

## Testing & Quality

```bash
# Run unit & integration tests
pnpm test

# Run linter
pnpm lint
```
