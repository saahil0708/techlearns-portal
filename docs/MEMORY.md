# 🧠 CodePlatform — Project Memory, Decision Log & Technical Knowledge Base

> **Document Version**: `1.2.0`  
> **Status**: Living Knowledge Artifact & Decision Record (ADR)  
> **Maintainer**: Engineering Architecture & AI Agent System  

---

## 🏛️ 1. Architectural Decision Records (ADRs)

```mermaid
timeline
    title Key Architectural Decisions Log
    2026-08 : ADR-001 : Next.js 19 SSR-First & Tailwind/MUI
            : ADR-002 : NestJS 12 Modular Monolith (REST + GraphQL)
    2026-08 : ADR-003 : Redis & BullMQ Judge Sandbox Architecture
            : ADR-004 : WebAuthn Passkeys & TOTP 2FA Auth
    2026-09 : ADR-005 : CodeChef Parity Engine (1★ to 7★ & START256 Matrix)
            : ADR-006 : Strict List Table Standard (Rule #10)
```

---

### 📌 ADR-001: Next.js 19 SSR-First Architecture with Tailwind & MUI
- **Context**: Need a blazingly fast, SEO-friendly, and accessible frontend with rich data visualization and high UI polish.
- **Decision**: Adopt Next.js 19 App Router with React Server Components (RSC) by default. Combine Tailwind CSS for structural utilities and MUI v9 for complex interactive components (date pickers, dialogs, icons).
- **Consequences**: Fast initial page loads ($<0.8\text{s}$ FCP); interactive leaf components require explicit `'use client'` tags.

---

### 📌 ADR-002: NestJS 12 Modular Monolith with Dual REST & GraphQL
- **Context**: Different consumers require different data fetching patterns — simple CRUD operations vs. deeply nested curriculum and submission trees.
- **Decision**: Implement NestJS with dual API interfaces:
  - **REST API** (`/api/v1`) with OpenAPI/Swagger documentation for straightforward CRUD, auth, and file operations.
  - **Apollo GraphQL** (`/graphql`) with code-first schema generation for rich, nested client queries (e.g., student progress, contest leaderboards).
- **Consequences**: Optimal payload size for clients; backend requires maintaining both DTO validations and GraphQL resolvers.

---

### 📌 ADR-003: Asynchronous BullMQ & Docker Sandbox Judge System
- **Context**: Evaluating untrusted user code poses security risks, unpredictable runtime loads, and potential Denial-of-Service.
- **Decision**: Decouple submission intake from code execution using Redis BullMQ queues. Worker processes spawn hardened, isolated Docker containers with Linux `cgroups`, `seccomp`, read-only roots, and `--network none`.
- **Consequences**: Zero host security vulnerability; predictable throughput with horizontal worker auto-scaling.

---

### 📌 ADR-004: Passwordless WebAuthn Passkeys & TOTP 2FA
- **Context**: Academic platforms require strong authentication to prevent credential sharing during competitive exams and contests.
- **Decision**: Integrate FIDO2 / WebAuthn passkeys (`@simplewebauthn/server`) for biometric hardware login alongside RFC 6238 TOTP 2FA and JWT token family rotation.
- **Consequences**: Phishing-resistant login flow with instant biometric verification.

---

### 📌 ADR-005: CodeChef Parity Engine (1★ to 7★ Rating & START256 Matrix)
- **Context**: Competitive programmers expect standardized star rating progressions and matrix contest scoreboards similar to CodeChef.
- **Decision**: Standardize rating tiers into 7 tiers ($1★$ Beginner to $7★$ Grandmaster with unbounded max rating). Division filters (Div 1–4) dynamically segregate contests. Contests use the START256 problem matrix format showing solve times and penalties.
- **Consequences**: Seamless familiarity for competitive coding students and faculty.

---

### 📌 ADR-006: Strict List Table Data Standard (Rule #10)
- **Context**: Card grid layouts for datasets (problems, batches, colleges, submissions) waste vertical space and hinder bulk sorting, searching, and exporting.
- **Decision**: Mandate clean, structured **List Table Format only** for all multi-item collections across the platform.
- **Consequences**: High-density data presentation with search, multi-select filtering, pagination, and Excel/CSV export capabilities.

---

### 📌 ADR-007: Problem of the Day (POTD) Engine & Continuous Streak
- **Context**: Daily student engagement requires consistent problem-solving incentives.
- **Decision**: Implement a POTD scheduler providing a daily algorithmic challenge with streak multipliers, calendar badge tracking, and local date normalization.
- **Consequences**: Boosts student daily active engagement without cluttering regular problem archive.

---

### 📌 ADR-008: Test Case Execution Telemetry Matrix ($T_1 \dots T_N$)
- **Context**: Students and faculty need visibility into which specific test cases failed, timed out, or exceeded memory limits within subtasks.
- **Decision**: Structure judge execution output into granular test case telemetry records displaying runtime (ms), memory (KB), and verdict chips per test case.
- **Consequences**: High transparency for debugging without exposing hidden input/output contents.

---

### 📌 ADR-009: Inter-College & Batch-vs-Batch Rating Aggregation
- **Context**: Institutions need benchmark rankings to measure performance against other colleges and between internal student cohorts.
- **Decision**: Calculate institutional score based on the average rating of the top $10\%$ active competitive programmers, with department-level comparative solve metrics.
- **Consequences**: Fair comparison regardless of college size.

---

### 📌 ADR-010: AST Token Similarity for Plagiarism Detection
- **Context**: Cheating and solution copying undermine contest legitimacy and rating honesty.
- **Decision**: Utilize AST tokenization and Winnowing fingerprinting to identify suspicious code similarities ($>85\%$) to flag candidate pairs for manual faculty review and administrative adjudication rather than immediate automated disqualification.
- **Consequences**: Protects competitive integrity across inter-college and internal contests while avoiding false-positive automated penalties.

---

## 📖 2. Domain Glossary & Technical Vocabulary

| Term | Definition & System Role |
| :--- | :--- |
| **`InstitutionMembership`** | Join entity binding a `User` to an `Institution` with a specific role (`STUDENT`, `FACULTY`, `INSTITUTION_ADMIN`). |
| **`Batch` (Cohort)** | An academic class of students within an institution (e.g., *CSE-2026-Batch-B*) with capacity limits and roster tracking. |
| **`Subtask`** | A grouped batch of test cases with independent score weighting (e.g., Subtask 1: 30 pts, Subtask 2: 70 pts). |
| **`Token Family`** | A UUID grouping related JWT refresh tokens. If a revoked token in a family is used, all tokens in that family are immediately revoked (replay defense). |
| **`cgroups`** | Linux Control Groups used in Docker sandboxes to enforce strict CPU quotas and memory caps ($256\text{ MB}$). |
| **`START256 Matrix`** | A dense leaderboard table format displaying problem columns (`P1`, `P2...`) with solve timestamps (`0:14`) and penalty counters (`+1`). |
| **`Star Tier`** | A 7-level skill classification ($1★$ to $7★$) computed from the user's continuous numerical Elo contest rating. |

---

## ⚙️ 3. Environment Invariants & Port Mapping

| Service / Component | Protocol | Default Port | Environment Variable |
| :--- | :--- | :--- | :--- |
| **Frontend Next.js App** | `HTTP / HTTPS` | `3000` | `PORT=3000`, `NEXT_PUBLIC_API_URL=http://localhost:8000` |
| **Backend NestJS API** | `HTTP / REST` | `8000` | `PORT=8000`, `API_PREFIX=api` |
| **GraphQL Apollo Server** | `GraphQL` | `8000` | Endpoint: `http://localhost:8000/graphql` |
| **Swagger API Docs** | `OpenAPI Docs` | `8000` | Endpoint: `http://localhost:8000/api/docs` |
| **PostgreSQL Database** | `Postgres Wire`| `5432` | `DATABASE_URL=postgresql://user:pass@localhost:5432/codeplatform` |
| **Redis Cache / BullMQ**| `RESP` | `6379` | `REDIS_HOST=localhost`, `REDIS_PORT=6379` |

---

## 💡 4. Known Quirks, Workarounds & Best Practices

1. **Next.js Date Shifting in Activity Heatmap**:
   - *Problem*: Converting UTC dates to local timestamps can shift midnight submissions into the previous day in western time zones.
   - *Fix*: Use `parseLocalDate` helper in [`SubmissionActivityHeatmap.tsx`](../client/src/components/students/profile/SubmissionActivityHeatmap.tsx) to preserve accurate calendar day bins.
2. **7★ Grandmaster Unbounded Rating**:
   - *Problem*: Fixed upper bounds (e.g., `maxRating: 9999`) fail when users achieve exceptionally high ratings.
   - *Fix*: Grandmaster tier ($7★$) uses `maxRating: Infinity` in [`codechefRating.ts`](../client/src/utils/codechefRating.ts).
3. **Contest Leaderboard Pagination Offset**:
   - *Problem*: Leaderboard ranks reset to 1 on page 2 if calculated from array index alone.
   - *Fix*: Formula `rank = (page * rowsPerPage) + index + 1` is applied consistently across all paginated scoreboards.
4. **Prisma Password Projection Hygiene**:
   - *Problem*: Accidental inclusion of `passwordHash` in user select queries.
   - *Fix*: All user queries use explicit `select` fields or pass through `UserSanitizerInterceptor`.
