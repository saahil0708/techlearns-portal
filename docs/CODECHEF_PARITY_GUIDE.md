# CodePlatform: CodeChef Feature Parity Documentation

This document outlines the rating, division, profile, problem, and leaderboard features, architecture, and UI/UX mechanics implemented in **CodePlatform** matching **CodeChef** standards.

---

## 1. Feature Comparison & Parity Matrix

| Feature Area | CodeChef Standard | CodePlatform Implementation | Parity Status |
| :--- | :--- | :--- | :--- |
| **Star Rating System** | 1★ to 7★ Tier progression (<1400 to 2500+) | Tier matching with custom glowing badges and unbounded max rating | ✅ Complete Parity |
| **Contest Divisions** | Div 1, Div 2, Div 3, Div 4 segregation | Division tags, filter tabs on Arena, and rating-based eligibility | ✅ Complete Parity |
| **Competitive Profile** | Rating progression graph + 365-day calendar heatmap | Interactive Recharts rating curve with date cutoffs + Localized activity heatmap | ✅ Complete Parity |
| **Problemset Explorer** | Practice list with numeric ratings (e.g. 480, 1420, 2240) | Standardized List Table with problem codes, star ratings, and contest tags | ✅ Complete Parity (Rule #10 Compliant) |
| **Problem Solver Workspace** | Subtask breakdown, Partial scoring (e.g., 30/100), Verdicts | Subtask allocation tab (`st.name`, `st.testCases`), real score history chips | ✅ Complete Parity |
| **Contest Arena & Leaderboard** | Problem Matrix (`P1`, `P2`, `P3...`) with solve time & penalties | START256-style matrix ranklist with pagination offset calculation | ✅ Complete Parity |

---

## 2. Rating & Division Architecture

### 2.1 Star Rating Tiers
The rating engine is centralized in [`frontend/src/utils/codechefRating.ts`](../frontend/src/utils/codechefRating.ts).

```
1★ (Beginner)      :    0 – 1399  (Gray / Slate)
2★ (Novice)        : 1400 – 1599  (Green)
3★ (Intermediate)  : 1600 – 1799  (Cyan / Blue)
4★ (Advanced)      : 1800 – 1999  (Purple)
5★ (Expert)        : 2000 – 2199  (Yellow / Amber)
6★ (Master)        : 2200 – 2499  (Orange)
7★ (Grandmaster)   : 2500 – ∞     (Rose / Red)
```

- **Unbounded Maximum**: 7★ tier is configured with `maxRating: Infinity` so ratings above `9999` are properly retained in the Grandmaster tier.
- **Divisions Allocation**:
  - **Division 1**: Rating $\ge 2000$ (5★, 6★, 7★)
  - **Division 2**: Rating $1600 - 1999$ (3★, 4★)
  - **Division 3**: Rating $1400 - 1599$ (2★)
  - **Division 4**: Rating $< 1400$ (1★)

### 2.2 Reusable Star Badge Component
- **Component**: [`StarRatingBadge.tsx`](../frontend/src/components/shared/StarRatingBadge.tsx)
- **Features**:
  - Optional star glyph display (`showStars?: boolean`).
  - Optional division badge display (`showDivision?: boolean`).
  - Size configurations (`sm`, `md`, `lg`).
  - Hover tooltips showing tier name, score boundaries, and current division.

---

## 3. Student Competitive Profile

Located in [`frontend/src/components/students/profile/`](../frontend/src/components/students/profile/).

1. **Header ([`StudentProfileHeader.tsx`](../frontend/src/components/students/profile/StudentProfileHeader.tsx))**:
   - Displays user avatar, handle, institution, Star Rating Badge, Global Rank, and conditional College Rank (only when defined).
2. **Contest Rating Curve ([`RatingHistoryChart.tsx`](../frontend/src/components/students/profile/RatingHistoryChart.tsx))**:
   - Date-based cutoffs for `6M`, `1Y`, and `ALL` filters relative to the current timestamp.
   - Synchronized stats: Peak rating, current rating, and rank are derived directly from the rating dataset.
3. **Submission Activity Heatmap ([`SubmissionActivityHeatmap.tsx`](../frontend/src/components/students/profile/SubmissionActivityHeatmap.tsx))**:
   - 52-week (365-day) contribution matrix.
   - Local date parser (`parseLocalDate`) to prevent UTC midnight date shifting in western time zones.
   - Derived metrics: Total Submissions, Current Streak (`currentStreakDays`), and Max Streak (`maxStreakDays`).

---

## 4. Problem Archive & Solving Workspace

### 4.1 Problem Archive ([`ProblemArchiveClient.tsx`](../frontend/src/components/problems/ProblemArchiveClient.tsx))
- **Rule #10 Compliance**: Clean, structured **List Table Format**.
- **CodeChef Difficulty Scaling**:
  - `Easy` $\rightarrow$ 480
  - `Medium` $\rightarrow$ 1420
  - `Hard` $\rightarrow$ 2240
- **Columns**: Status, Problem Code (e.g., `START256_A`), Problem Title, Contest Tag, Star / Difficulty Rating, Submissions, Accuracy %, and Solve CTA.

### 4.2 Problem Solver Workspace ([`ProblemSolverClient.tsx`](../frontend/src/components/problems/ProblemSolverClient.tsx))
- **Problem Metadata Header**: Displays problem code, numeric rating, and time/memory limits.
- **Subtasks & Partial Scoring**:
  - Dedicated subtasks tab presenting structured test case batches, subtask names (`st.name`), test case counts (`st.testCases`), and point allocations.
- **Submission Verdicts**:
  - Real-time score pills preserving partial scores (e.g., `30 pts`, `70 pts`, `100 pts`) instead of binary 0/100 points.

---

## 5. Contest Arena & Matrix Leaderboard

### 5.1 Contest Arena ([`ContestsArenaClient.tsx`](../frontend/src/components/contests/ContestsArenaClient.tsx))
- **Division Filter Pills**: `All`, `Div 1`, `Div 2`, `Div 3`, `Div 4`.
- **Automatic Page Reset**: Switching divisions immediately resets pagination to page 1 while maintaining query and status filters.

### 5.2 Matrix Leaderboard ([`LeaderboardClient.tsx`](../frontend/src/components/leaderboard/LeaderboardClient.tsx))
- **CodeChef START256 Matrix Mode**:
  - Problem columns (`P1`, `P2`, `P3`, `P4`, `P5`, `P6`).
  - Score boxes displaying solve times (e.g., `0:14`) and penalty counts (e.g., `+1`, `+2`).
  - Pagination-aware ranking formula: `idx = (page * rowsPerPage) + itemIndex`.

---

## 6. Security, Configuration & Integrity

1. **Docker Compose Environment Security ([`docker-compose.yml`](../docker-compose.yml))**:
   - `JWT_SECRET: ${JWT_SECRET:?JWT_SECRET must be set}`
   - `JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:?JWT_REFRESH_SECRET must be set}`
   - `TOTP_ENCRYPTION_KEY: ${TOTP_ENCRYPTION_KEY:?TOTP_ENCRYPTION_KEY must be set}`
2. **Strict Data Presentation Standard (Rule #10)**:
   - All dataset views use clean, accessible, and responsive list tables with search, filtering, and pagination.
3. **Type Safety**:
   - Fully typed interfaces across backend NestJS DTOs and Next.js frontend clients with zero TypeScript emit errors.
