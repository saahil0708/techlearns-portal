# CodePlatform - Frontend Feature & Backend API Specification

> **Living Documentation**: This file documents all frontend pages, interactive UI features, component structures, and the exact REST API endpoints, query parameters, request bodies, and response envelopes needed from the NestJS / Prisma backend.

---

## 📑 Table of Contents
1. [Architecture & API Standards](#1-architecture--api-standards)
2. [Colleges & Higher-Ed Organizations (`/colleges`)](#2-colleges--higher-ed-organizations-colleges)
3. [K-12 Schools & STEM Academies (`/schools`)](#3-k-12-schools--stem-academies-schools)
4. [Students & Competitive Coders (`/students`)](#4-students--competitive-coders-students)
5. [Problems Explorer & Code Workspace (`/problems`)](#5-problems-explorer--code-workspace-problems)
6. [Contests Arena & Leaderboard (`/contests`)](#6-contests-arena--leaderboard-contests)
7. [Courses & Interactive Lessons (`/courses`)](#7-courses--interactive-lessons-courses)
8. [Submissions & Judge Sandbox (`/submissions`)](#8-submissions--judge-sandbox-submissions)
9. [Authentication, Users & RBAC (`/auth`)](#9-authentication-users--rbac-auth)

---

## 1. Architecture & API Standards

### Standard Response Envelope
All backend endpoints must return consistent JSON envelopes:
```typescript
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}
```

### Standard Pagination & Sorting Query Parameters
- `page`: `number` (1-indexed, default: `1`)
- `limit`: `number` (default: `10`, options: `10`, `25`, `50`, `100`)
- `sortBy`: `string` (column key)
- `sortOrder`: `'asc' | 'desc'` (default: `'desc'`)
- `search`: `string` (case-insensitive substring match)

---

## 2. Colleges & Higher-Ed Organizations (`/colleges`)

### 🌐 Frontend Routes
- **`/colleges`**: Collegiate Directory List Table
- **`/colleges/[id]`**: College Analytics & Cohorts Workspace (5 Sub-Tabs)

### 🖥️ Frontend Features
- **Directory List Table (Rule 10)**: Sortable columns (Code, Name, Domain, State, Tier, Quota Progress Bar, Enrolled Students, Batches, Courses, Faculty, Status), full-pill pagination, one-click Excel/CSV export.
- **Create College Modal**: University name, short code, domain, location, quota, tier.
- **5 Sub-Tabs on `/colleges/[id]`**:
  1. *Batches / Cohorts*: Name, year, enrolled students, placement %, active labs.
  2. *Student Roster*: Name, `@handle`, student ID, CGPA/Rating, solved count, status.
  3. *Assigned Courses*: Course title, department, enrolled tally, completion %.
  4. *Faculty / Instructors*: Name, title, department, active courses count.
  5. *Institution Settings*: Quota adjustments, domain verification, SSO settings.

### 🔌 REST APIs
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `GET` | `/api/v1/colleges` | Paginated list of colleges | `?search=&tier=&status=&page=&limit=&sortBy=&sortOrder=` | `CollegeEntity[]` + `meta` |
| `POST` | `/api/v1/colleges` | Register a new college tenant | `{ name, code, domain, state, tier, maxQuota }` | `CollegeEntity` |
| `GET` | `/api/v1/colleges/:id` | Single college details & KPI metrics | – | `CollegeDetail` |
| `PATCH` | `/api/v1/colleges/:id` | Update college details & quota | `{ name?, maxQuota?, status?, domain? }` | `CollegeEntity` |
| `GET` | `/api/v1/colleges/:id/batches` | Get college batches/cohorts | `?page=&limit=&search=` | `BatchItem[]` + `meta` |
| `GET` | `/api/v1/colleges/:id/faculty` | Get faculty members list | `?department=&page=&limit=` | `FacultyItem[]` + `meta` |
| `POST` | `/api/v1/colleges/join` | Join an institution via College Code | `{ collegeCode }` | `{ college, membership, user }` |
| `POST` | `/api/v1/batches/join` | Join a specific batch via Batch Sub-Code | `{ batchCode }` | `{ college, batch, membership, user }` |

---

## 3. K-12 Schools & STEM Academies (`/schools`)

### 🌐 Frontend Routes
- **`/schools`**: High Schools & STEM Directory List Table
- **`/schools/[id]`**: School STEM Analytics Workspace (5 Sub-Tabs)

### 🖥️ Frontend Features
- **Directory List Table (Rule 10)**: Filter by Curriculum (AP, IB, CBSE, STEM Honors), district search, student seat quota usage bar, full-pill pagination, Excel/CSV export.
- **Register School Modal**: School name, code, curriculum, grades (9–12), seat quota.
- **5 Sub-Tabs on `/schools/[id]`**:
  1. *Grade Sections*: Grade 9–12 sections, AP/IB tracks, student capacity.
  2. *Student Roster*: Grade level, parent contact, USACO/AP score, solved tally.
  3. *Coding Labs*: Lab name, environment (Python/C++/Web), weekly hours, active workstations.
  4. *CS Instructors*: Teacher name, subject specialization, assigned labs.
  5. *School Settings*: Seat allocation, district linking.

### 🔌 REST APIs
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `GET` | `/api/v1/schools` | List schools with curriculum filter | `?curriculum=&status=&search=&page=&limit=` | `SchoolEntity[]` + `meta` |
| `POST` | `/api/v1/schools` | Register new K-12 school | `{ name, code, domain, district, curriculum, grades, maxQuota }` | `SchoolEntity` |
| `GET` | `/api/v1/schools/:id` | Single school summary & metrics | – | `SchoolDetail` |
| `GET` | `/api/v1/schools/:id/grades` | Grade sections & cohorts | `?page=&limit=` | `GradeCohortItem[]` + `meta` |
| `GET` | `/api/v1/schools/:id/students` | School student roster | `?gradeId=&page=&limit=` | `SchoolStudent[]` + `meta` |
| `GET` | `/api/v1/schools/:id/labs` | STEM Coding labs list | `?status=&page=&limit=` | `CodingLabItem[]` + `meta` |
| `GET` | `/api/v1/schools/:id/teachers` | School CS teachers list | `?page=&limit=` | `SchoolTeacher[]` + `meta` |

---

## 4. Students & Competitive Coders (`/students`)

### 🌐 Frontend Routes
- **`/students`**: Global Coder Directory & Leaderboard
- **`/students/[id]`**: Comprehensive Coder Profile & Performance Matrix

### 🖥️ Frontend Features
- **Interactive List Table (Rule 10)**: Column sorting (Rank, Rating, Solved, Accuracy, Streak), multi-select row checkboxes, floating bulk actions bar.
- **Multi-Dimensional Filters**: Rating Tier (Master, Candidate Master, Expert, Specialist), Min Solved (500+, 300+, 100+), Min Streak (30+, 14+, 7+ days), Institution tabs.
- **Head-to-Head Compare Modal**: Compare 2–3 coders side-by-side (stacked rating bars, solved difficulty breakdown, accuracy showdown).
- **Quick-Peek Slide-Over Drawer**: Instant preview of recent submissions, copyable email/ID, rank/tier without navigating away.
- **Bulk CSV / Excel Import Modal**: Upload rosters with institution & cohort mapping.
- **Profile Page (`/students/[id]`)**:
  - *365-Day Activity Heatmap*: GitHub/LeetCode-style daily submission intensity matrix.
  - *5 Structured Sub-Tabs*: Submissions History (with syntax code viewer modal), Enrolled Courses, Contest History & Rating Deltas, Topic Mastery Breakdown, Badges & Honors.

### 🔌 REST APIs
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `GET` | `/api/v1/students` | Global student leaderboard & directory | `?search=&type=&tier=&minSolved=&minStreak=&status=&page=&limit=&sortBy=&sortOrder=` | `StudentDirectoryEntity[]` + `meta` |
| `POST` | `/api/v1/students` | Register or invite student | `{ name, handle, email, studentId, institutionType, institutionId, cohort }` | `StudentDirectoryEntity` |
| `POST` | `/api/v1/students/bulk-import` | Bulk parse & import student CSV/Excel roster | `FormData (file, institutionId, cohortId)` | `{ importedCount: number, errors: [] }` |
| `GET` | `/api/v1/students/:id` | Comprehensive student profile summary | – | `StudentProfile` |
| `GET` | `/api/v1/students/:id/activity-heatmap` | 365-day submission intensity counts | `?year=2026` | `ActivityDay[]` |
| `GET` | `/api/v1/students/:id/submissions` | Historical submissions for student | `?verdict=&difficulty=&page=&limit=` | `StudentSubmissionItem[]` + `meta` |
| `GET` | `/api/v1/students/:id/courses` | Enrolled courses & completion progress | `?status=&page=&limit=` | `StudentCourseItem[]` + `meta` |
| `GET` | `/api/v1/students/:id/contests` | Contest rating deltas & rank history | `?page=&limit=` | `StudentContestItem[]` + `meta` |
| `GET` | `/api/v1/students/:id/topic-mastery` | Topic accuracy & problem solve counts | – | `StudentTopicItem[]` |
| `GET` | `/api/v1/students/:id/badges` | Earned certificates, medals, and badges | – | `StudentBadgeItem[]` |

---

## 5. Problems Explorer & Code Workspace (`/problems`)

### 🌐 Frontend Routes
- **`/problems`**: Problem Explorer List Table with Tag Filters
- **`/problems/[slug]`**: Split-Pane Interactive IDE & Test Runner Workspace

### 🖥️ Frontend Features
- **Problem Explorer List Table (Rule 10)**: Problem ID, Title, Difficulty (Easy/Medium/Hard), Acceptance Rate, Algorithmic Tags (DP, Graphs, Trees, Strings), Solve Status.
- **Problem Workspace (`[slug]`)**:
  - *Left Pane*: Problem statement markdown, input/output format, constraints, sample testcases, hints, submission history.
  - *Right Pane*: Monaco Code Editor (C++20, Python 3, Java 21, TypeScript), custom testcase runner, verdict output panel (Time, Memory, Diff), and Submit button.

### 🔌 REST APIs
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `GET` | `/api/v1/problems` | List problems with filters | `?difficulty=&tag=&status=&search=&page=&limit=&sortBy=` | `ProblemListItem[]` + `meta` |
| `GET` | `/api/v1/problems/:slug` | Problem statement, sample testcases & starter code | – | `ProblemDetail` |
| `POST` | `/api/v1/problems` | Create new problem (Admin/Faculty) | `{ title, slug, statement, difficulty, tags, starterCode, testCases }` | `ProblemDetail` |
| `POST` | `/api/v1/problems/:id/run` | Run code against sample/custom testcases | `{ language, sourceCode, customInput? }` | `{ status, stdout, stderr, runtimeMs, memoryKb }` |
| `POST` | `/api/v1/problems/:id/submit` | Submit solution to BullMQ Judge queue | `{ language, sourceCode }` | `{ submissionId: string, status: 'QUEUED' }` |

---

## 6. Contests Arena & Leaderboard (`/contests`)

### 🌐 Frontend Routes
- **`/contests`**: Active, Upcoming, and Past Contests List Table
- **`/contests/[id]`**: Contest Arena & Live Standings Leaderboard

### 🖥️ Frontend Features
- **Contest Dashboard (Rule 10)**: Live countdown timer, duration, problem count, registered participants, scoring format (ICPC penalty vs LeetCode score).
- **Contest Arena (`[id]`)**: Problem set list, dynamic scoreboard, penalty time calculation, real-time rank updates.

### 🔌 REST APIs
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `GET` | `/api/v1/contests` | List contests (Active, Upcoming, Past) | `?status=&search=&page=&limit=` | `ContestListItem[]` + `meta` |
| `GET` | `/api/v1/contests/:id` | Contest metadata & problem mappings | – | `ContestDetail` |
| `POST` | `/api/v1/contests/:id/register` | Register student for contest | – | `{ registered: boolean }` |
| `GET` | `/api/v1/contests/:id/leaderboard` | Live rank board with scores & penalties | `?page=&limit=` | `LeaderboardRow[]` + `meta` |
| `POST` | `/api/v1/contests` | Create new contest (Faculty/Admin) | `{ title, startTime, endTime, problems, scoringRules }` | `ContestDetail` |

---

## 7. Courses & Interactive Lessons (`/courses`)

### 🌐 Frontend Routes
- **`/courses`**: Course Catalog List Table
- **`/courses/[slug]`**: Interactive Lesson Player, Module Tracker, & Quiz Engine

### 🖥️ Frontend Features
- **Course Directory (Rule 10)**: Title, Level (Beginner/Intermediate/Advanced), Instructor, Module Count, Total Hours, Enrollment count.
- **Course Player (`[slug]`)**: Video/Markdown lesson viewer, in-lesson coding sandbox, module completion tracker, certificate issuance.

### 🔌 REST APIs
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `GET` | `/api/v1/courses` | List courses with difficulty filters | `?level=&search=&page=&limit=` | `CourseListItem[]` + `meta` |
| `GET` | `/api/v1/courses/:slug` | Course syllabus, modules, and lessons | – | `CourseDetail` |
| `POST` | `/api/v1/courses/:id/enroll` | Enroll student in course | – | `{ enrolled: boolean }` |
| `PATCH` | `/api/v1/courses/:id/lessons/:lessonId` | Mark lesson complete & update progress % | `{ completed: boolean }` | `{ progressPct: number }` |

---

## 8. Submissions & Judge Sandbox (`/submissions`)

### 🔌 REST APIs & BullMQ Message Queue
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `GET` | `/api/v1/submissions` | Global submissions feed | `?problemId=&studentId=&verdict=&language=&page=&limit=` | `SubmissionItem[]` + `meta` |
| `GET` | `/api/v1/submissions/:id` | Submission details, testcase verdicts & execution log | – | `SubmissionDetail` |
| `WS / SSE`| `/api/v1/submissions/:id/stream` | Real-time verdict updates while running in Docker sandbox | – | `EventStream (verdict, progress)` |

---

## 9. Users & RBAC Administration (`/users`)

### 🌐 Frontend Routes
- **`/users`**: Users & Identity Management Directory List Table
- **`/users/[id]`**: User Security Profile, Audit Logs, Active Sessions & Tenant Memberships (4 Sub-Tabs)

### 🖥️ Frontend Features
- **Directory List Table (Rule 10)**: Sortable columns (User Name, Handle, Email, Role Tier, Tenant Affiliation, 2FA Status, Last Active Timestamp, Status), full-pill pagination, Excel/CSV export.
- **Role Tier Badges**: Super Admin (`SUPER_ADMIN`), College Admin (`COLLEGE_ADMIN`), School Admin (`SCHOOL_ADMIN`), Faculty (`FACULTY`), Student (`STUDENT`), Recruiter (`RECRUITER`).
- **Create / Provision User Modal**: Name, `@handle`, institutional email, role assignment, tenant organization linking, invitation trigger.
- **Bulk Invite Users Modal**: Drag-and-drop CSV/Excel roster invite parser with temporary credentials generation.
- **Quick-Peek Drawer**: Slide-over preview for fast role checking, email copying, and password reset actions.
- **4 Sub-Tabs on `/users/[id]`**:
  1. *Security & Audit Logs*: Interactive sign-in history, TOTP verification events, role elevations, IP addresses, geo-locations, and status pills.
  2. *Tenant Memberships*: Assigned universities/schools, role within tenant, permissions scope, date assigned.
  3. *Active Sessions & API Keys*: Client device, IP address, session issue date, last active, one-click session revocation.
  4. *Account Preferences*: 2FA enforcement, notification digest settings, editor theme, SSO connections.

### 🔌 REST APIs
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `GET` | `/api/v1/users` | List users with role & status filters | `?role=&status=&twoFactor=&search=&page=&limit=&sortBy=&sortOrder=` | `UserDirectoryEntity[]` + `meta` |
| `POST` | `/api/v1/users` | Provision new user account & send invite | `{ name, handle, email, role, institutionType, institutionName }` | `UserDirectoryEntity` |
| `POST` | `/api/v1/users/bulk-invite` | Bulk invite users from CSV/Excel | `FormData (file, defaultRole, institutionId)` | `{ invitedCount: number, errors: [] }` |
| `GET` | `/api/v1/users/:id` | Single user profile & security summary | – | `UserDetail` |
| `PATCH` | `/api/v1/users/:id/role` | Modify user's global or tenant role | `{ role: UserRole }` | `UserDirectoryEntity` |
| `POST` | `/api/v1/users/:id/reset-password` | Send password reset email or generate token | – | `{ message: string }` |
| `GET` | `/api/v1/users/:id/audit-logs` | Security audit trail for user | `?search=&page=&limit=` | `UserSecurityLogItem[]` + `meta` |
| `GET` | `/api/v1/users/:id/memberships` | Tenant memberships & role scopes | `?page=&limit=` | `UserTenantMembershipItem[]` + `meta` |
| `GET` | `/api/v1/users/:id/sessions` | Active client sessions & API tokens | `?page=&limit=` | `UserActiveSessionItem[]` + `meta` |
| `DELETE` | `/api/v1/users/:id/sessions/:sessionId` | Revoke specific active session | – | `{ revoked: boolean }` |
| `PATCH` | `/api/v1/users/:id/preferences` | Update user settings & 2FA enforcement | `{ twoFactorEnforced?, notifications? }` | `UserPreferenceItem[]` |

---

## 10. Authentication, Auth Guards & Tokens (`/auth`)

### 🔌 REST APIs
| Method | Endpoint | Description | Query / Body Payload | Response Entity |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Email/Password login, issue JWT tokens | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `POST` | `/api/v1/auth/register` | Student/Faculty registration | `{ name, handle, email, password, role, joinCode? }` | `{ user, accessToken }` |
| `GET` | `/api/v1/auth/me` | Current authenticated user profile | Bearer Token in Header | `UserEntity` |
| `POST` | `/api/v1/auth/refresh` | Refresh expired access tokens | `{ refreshToken }` | `{ accessToken }` |
| `POST` | `/api/v1/auth/logout` | Invalidate session tokens | – | `{ success: boolean }` |

