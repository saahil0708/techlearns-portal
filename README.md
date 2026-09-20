# CodePlatform

> Full-stack learning and competitive programming platform tailored for colleges, faculty, and students (CodeChef / LeetCode style) with automated multi-language sandboxed code evaluation and multi-channel notifications.

---

## Key Architectural Highlights

- **Code Management & CI/CD**: GitHub repo integrated with Azure DevOps pipelines for automated linting, test suites, and containerized image publishing.
- **Cloud Infrastructure**: Azure Container Apps hosting Next.js 19 SSR frontend and NestJS API backend.
- **Multi-Channel Notifications**: Email (Azure Communication Services / AWS SES), SMS, WhatsApp Business API, and Web Push notifications via transactional outbox worker.
- **Database & State**: PostgreSQL (Azure Flexible Server) with Prisma ORM + Redis / BullMQ for high-throughput queues and caching.
- **Polyglot Sandboxed Judge**: Docker-isolated execution environment (C#, Java, C++, Python, Rust, Go) with cgroups/seccomp security, sub-second test execution, and real-time result streaming.
- **Monaco Code Editor & AI Workspace**: React 19 Monaco editor wrapper with custom themes, test runner console, and AI Copilot assistant.

Detailed system documentation and engineering guidelines are available in [`docs/`](./docs/):

| Document | Description |
| :--- | :--- |
| 📋 [**PRD.md**](./docs/PRD.md) | Product Requirements Document: Roles, features, KPIs, and roadmap |
| 🏗️ [**ARCHITECTURE.md**](./docs/ARCHITECTURE.md) | System architecture, NestJS modules, Next.js RSC, Docker sandbox, and ER diagram |
| 🎨 [**DESIGN.md**](./docs/DESIGN.md) | UI/UX design system, 1★–7★ star rating tokens, START256 matrix, and table standards |
| 📜 [**RULES.md**](./docs/RULES.md) | Mandatory engineering invariants, security rules, and Rule #10 list table standard |
| 📋 [**TASKS.md**](./docs/TASKS.md) | Engineering task breakdown, priorities (`P0`–`P3`), statuses, and acceptance criteria |
| 🧠 [**MEMORY.md**](./docs/MEMORY.md) | Persistent project memory, ADR logs, domain glossary, and port mappings |

---

## Technology Stack

### Backend
- **Framework**: NestJS (TypeScript, Node.js, ESM)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Cache & Message Queue**: Redis, BullMQ
- **Authentication**: JWT, WebAuthn Passkeys, TOTP 2FA, bcryptjs
- **API Formats**: GraphQL (`/graphql`) & REST OpenAPI (`/api/docs`)
- **Testing & Quality**: Vitest, Supertest, Oxlint

### Frontend (`/frontend`)
- **Framework**: Next.js 19 (App Router, SSR-First)
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Icons**: Lucide React
- **HTTP Client**: Centralized typed API client

---

## Project Structure

```text
├── docker/                       # Sandbox containers for isolated code compilation/execution
├── docs/                         # Engineering specifications, PRD, and architecture docs
│   ├── ARCHITECTURE.md           # System architecture, C4 diagrams & ER model
│   ├── DESIGN.md                 # UI/UX design system & CodeChef parity tokens
│   ├── MEMORY.md                 # Project memory, ADR log & glossary
│   ├── PRD.md                    # Product requirements & feature matrix
│   ├── RULES.md                  # Mandatory engineering rules & standards
│   └── TASKS.md                  # Feature roadmap & active sprint tasks
├── frontend/                     # Next.js 19 SSR Frontend application
├── prisma/                       # Database models and migration scripts
│   ├── schema.prisma
│   └── migrations/
├── src/                          # NestJS Backend API & background workers
│   ├── auth/                     # Authentication & credential security
│   ├── colleges/                 # Multi-tenant college management
│   ├── batches/                  # Student cohorts and batch rosters
│   ├── courses/                  # Course catalog and interactive lessons
│   ├── problems/                 # Coding problem repository & test cases
│   ├── submissions/              # Submissions and evaluation queue
│   ├── judge/                    # Sandboxed BullMQ execution workers
│   ├── contests/                 # Competitive programming contests
│   ├── leaderboard/              # Real-time leaderboard and rankings
│   └── users/                    # User identity & outbox invitations
└── test/                         # End-to-end and integration tests
```

---

## Quick Start

### 1. Start Infrastructure (Postgres & Redis)
```bash
docker compose up -d                 # start infra
docker compose --profile judge up -d # start judge service
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Apply Migrations & Generate Prisma Client
```bash
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

### 4. Run Development Servers
```bash
# Start Backend (port 8000)
pnpm dev

# Start Frontend (port 3000)
cd frontend
pnpm dev
```

---

## Testing & Quality

```bash
# Run unit & integration tests
pnpm test

# Run type checks
pnpm exec tsc --noEmit

# Run fast linter
pnpm run lint
```
