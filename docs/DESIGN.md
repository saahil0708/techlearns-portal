# 🎨 CodePlatform — Design System & UI/UX Guidelines

> **Document Version**: `1.2.0`  
> **Status**: Approved UI/UX Design System  
> **Aesthetic Philosophy**: Modern Developer Aesthetics · Sleek Dark Themes · Glassmorphism · CodeChef Parity · Strict Table Data Standard  

---

## 🌌 1. Core Visual Principles & Aesthetic Foundations

CodePlatform is designed to offer a state-of-the-art, high-density, developer-focused user experience that combines high aesthetic elegance with utilitarian data clarity.

```mermaid
mindmap
  root((Design Principles))
    💎 Sleek Dark Aesthetics
      Deep Slate & Charcoal Palettes
      Subtle 1px Glassmorphism Borders
      Vibrant Gradient Accents
    📊 High-Density Data Clarity
      Strict List Table Standard (Rule #10)
      Zero Cluttered Card Grids
      Accessible Sorting & Filtering
    ⭐ CodeChef Star Rating Visuals
      1★ to 7★ Radiant Badges
      START256 Matrix Scoreboard
      Interactive 365-Day Activity Heatmap
    ⚡ Micro-Animations & Fluidity
      Smooth Hover Transitions
      Subtle Glowing Highlights
      Instant Tab Switching
```

---

## 🎨 2. Color System & Design Tokens

### 2.1 Base Surface & Theme Colors

| Token Name | Hex Code | Purpose / Application |
| :--- | :--- | :--- |
| `--bg-canvas` | `#0b0f19` | Main application background (deep interstellar slate) |
| `--bg-surface` | `#111827` | Primary surface for tables, sidebar, and panels |
| `--bg-card` | `rgba(17, 24, 39, 0.75)` | Glassmorphism cards with backdrop blur ($12\text{px}$) |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | 1px clean separation borders |
| `--border-focus` | `#38bdf8` | Vibrant cyan border for active inputs and focused elements |
| `--text-primary` | `#f8fafc` | High-contrast headers, problem titles, and active text |
| `--text-secondary` | `#94a3b8` | Subtitles, metadata, timestamps, and column labels |
| `--text-muted` | `#64748b` | Disabled items, placeholder text, and subtle hints |

---

### 2.2 CodeChef Star Rating & Division Color Tokens

The platform implements strict CodeChef visual parity for competitive ratings:

| Tier | Star Glyph | Rating Range | Primary Color | Hex Code | Glowing CSS Shadow |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **Beginner** | `1★` | $0 - 1399$ | Slate Gray | `#94a3b8` | `0 0 10px rgba(148, 163, 184, 0.3)` |
| **Novice** | `2★` | $1400 - 1599$ | Emerald Green | `#22c55e` | `0 0 12px rgba(34, 197, 94, 0.4)` |
| **Intermediate**| `3★` | $1600 - 1799$ | Cyan Blue | `#06b6d4` | `0 0 12px rgba(6, 182, 212, 0.4)` |
| **Advanced** | `4★` | $1800 - 1999$ | Royal Purple | `#a855f7` | `0 0 12px rgba(168, 85, 247, 0.4)` |
| **Expert** | `5★` | $2000 - 2199$ | Amber Yellow | `#eab308` | `0 0 14px rgba(234, 179, 8, 0.5)` |
| **Master** | `6★` | $2200 - 2499$ | Flame Orange | `#f97316` | `0 0 14px rgba(249, 115, 22, 0.5)` |
| **Grandmaster** | `7★` | $2500 - \infty$ | Crimson Red | `#ef4444` | `0 0 16px rgba(239, 68, 68, 0.6)` |

---

### 2.3 Verdict & Execution Status Color Codes

| Verdict Key | Label | Badge Background | Text Color | Icon |
| :--- | :--- | :--- | :--- | :---: |
| `ACCEPTED` | **Accepted (AC)** | `rgba(34, 197, 94, 0.15)` | `#22c55e` | ✅ |
| `WRONG_ANSWER` | **Wrong Answer (WA)** | `rgba(239, 68, 68, 0.15)` | `#ef4444` | ❌ |
| `TIME_LIMIT_EXCEEDED` | **Time Limit (TLE)** | `rgba(245, 158, 11, 0.15)` | `#f59e0b` | ⏱️ |
| `MEMORY_LIMIT_EXCEEDED`| **Memory Limit (MLE)** | `rgba(249, 115, 22, 0.15)` | `#f97316` | 💾 |
| `COMPILATION_ERROR` | **Compile Error (CE)** | `rgba(217, 70, 239, 0.15)` | `#d946ef` | 🛠️ |
| `RUNTIME_ERROR` | **Runtime Error (RE)** | `rgba(236, 72, 153, 0.15)` | `#ec4899` | ⚠️ |
| `PROCESSING` / `QUEUED`| **Evaluating...** | `rgba(56, 189, 248, 0.15)` | `#38bdf8` | 🔄 |

---

## 🔤 3. Typography & Font Hierarchy

The platform relies on Google Fonts with strict monospace integration for code blocks:
- **Primary Body & Display**: `Inter, system-ui, -apple-system, sans-serif`
- **Monospace & Code Workspace**: `JetBrains Mono, Fira Code, 'Courier New', monospace`

```css
/* Typography Scale */
.text-hero    { font-size: 2.5rem;   line-height: 1.2; font-weight: 800; letter-spacing: -0.025em; }
.text-h1      { font-size: 1.875rem; line-height: 1.25; font-weight: 700; letter-spacing: -0.02em; }
.text-h2      { font-size: 1.5rem;   line-height: 1.3; font-weight: 600; }
.text-h3      { font-size: 1.25rem;  line-height: 1.4; font-weight: 600; }
.text-body    { font-size: 0.875rem; line-height: 1.5; font-weight: 400; }
.text-caption { font-size: 0.75rem;  line-height: 1.4; font-weight: 500; }
.font-mono    { font-family: 'JetBrains Mono', monospace; font-feature-settings: "liga" 1; }
```

---

## 🧩 4. Component Design Specifications

### 4.1 Star Rating Badge (`StarRatingBadge.tsx`)

A reusable badge component rendering the user's star tier, division qualification, and rating range.

```tsx
<StarRatingBadge 
  rating={1845} 
  tier="Advanced" 
  stars={4} 
  division="Div 2" 
  showStars={true} 
  showDivision={true} 
  size="md" 
/>
```
- **Visual Design**: Sleek rounded pill (`rounded-full`), $1\text{px}$ subtle colored border matching tier, gradient fill, and hover tooltip indicating rating boundary.

---

### 4.2 Problem Archive Table (Strict Rule #10 Implementation)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🔍 Search problem name / code...   [Difficulty ▾]  [Contest Tag ▾]  [Status ▾]          [📥 Export CSV/Excel]  │
├────────┬────────────┬──────────────────────────────┬──────────────┬──────────┬─────────────┬──────────┬────────┤
│ Status │ Code       │ Problem Title                │ Contest Tag  │ Rating   │ Submissions │ Accuracy │ Action │
├────────┼────────────┼──────────────────────────────┼──────────────┼──────────┼─────────────┼──────────┼────────┤
│   ✅   │ START256_A │ Chef and String Minimization │ START256     │ 480 (1★) │ 14,230      │ 78.4%    │ [Solve]│
│   ⏳   │ START256_B │ Tree Path Inversion          │ START256     │ 1420(2★) │ 6,810       │ 42.1%    │ [Solve]│
│   ❌   │ START256_C │ Graph Modular Eulerian Cycles│ START256     │ 2240(6★) │ 940         │ 18.2%    │ [Solve]│
├────────┴────────────┴──────────────────────────────┴──────────────┴──────────┴─────────────┴──────────┴────────┤
│  Showing 1–10 of 245 problems                                      [⏮ Prev]  Page 1 of 25  [Next ⏭]           │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Table Mandatory Features:
1. **Header Toolbar**: Real-time debounced search bar + multi-select dropdown filters + CSV Export CTA button.
2. **Column Sorting**: Sortable headers with ascending/descending arrow indicators.
3. **Accuracy Bar**: Visual miniature progress indicator showing percentage of successful verdicts.
4. **Interactive Rows**: Subtle hover highlight (`hover:bg-slate-800/50`) and direct action CTA link.

---

### 4.3 START256 Matrix Contest Leaderboard

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🏆 START256 Rated Contest — Division 2 Standings                       [Search Competitor...] [Export]│
├──────┬─────────────────────────┬────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────────┤
│ Rank │ Competitor (College)    │ Rating │ Score   │ Penalty │ P1      │ P2      │ P3      │ P4         │
├──────┼─────────────────────────┼────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────────┤
│  1   │ 🧑‍🎓 alex_dev (MIT CSE)  │ 1740 3★│ 400 pts │ 01:24   │ 0:12 ✅ │ 0:28 ✅ │ 0:45 (+1)│ 1:24 ✅    │
│  2   │ 🧑‍🎓 priya_k (IIT Delhi) │ 1680 3★│ 300 pts │ 00:58   │ 0:08 ✅ │ 0:19 ✅ │ 0:58 ✅ │ --         │
│  3   │ 🧑‍🎓 mark_99 (Stanford)  │ 1715 3★│ 300 pts │ 01:12   │ 0:15 (+2)│ 0:34 ✅ │ 1:12 ✅ │ --         │
├──────┴─────────────────────────┴────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────────┤
│  Showing 1–25 of 1,200 participants                                [⏮ Prev]  Page 1 of 48  [Next ⏭]    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Matrix Score Pills**:
  - Green Pill: Problem solved (`Solve Time` + optional penalty count `+1`, `+2`).
  - Gray Dash (`--`): Unattempted problem.
  - Red Pill (`-3`): Attempted with 3 incorrect submissions, unsolved.

---

### 4.4 Problem Solving Workspace Layout

```mermaid
flowchart TD
    Header["🧭 Problem Metadata Header (Code, 1★-7★ Rating, Time/Memory Limits)"]
    
    subgraph SplitPane ["Split-Pane Workspace"]
        subgraph LeftPane ["Left Pane: Description & Subtasks"]
            Tabs1["[Problem Statement]  [Subtasks & Points]  [Submissions History]  [Editorial & AI]"]
            Statement["Problem Statement Markdown\n• Input / Output Specifications\n• Constraints (1 ≤ N ≤ 10^5)\n• Sample Test Cases & Explanations"]
        end
        
        subgraph RightPane ["Right Pane: Monaco Editor & Console"]
            Toolbar["Language Selector (C++, Java, Python, JS, C)  |  Theme Selector  |  Reset Code"]
            Editor["💻 Monaco Code Editor Instance (VS Code Keybindings, IntelliSense)"]
            Runner["🎛️ Test Runner Console\n[Run Custom Test] [Submit Solution]"]
            Output["Terminal Output & Subtask Verdict Badges (e.g. 100/100 pts)"]
        end
    end
    
    Header --> SplitPane
```

---

## 📱 5. Responsive Breakpoints & Device Adaptability

| Breakpoint | Minimum Width | Primary Target Devices | UI Adaptation Behavior |
| :--- | :--- | :--- | :--- |
| `sm` | $640\text{px}$ | Mobile (Landscape) | Stacked single-column layouts; tables scroll horizontally. |
| `md` | $768\text{px}$ | Tablets & iPads | Collapsible sidebar navigation drawer; 2-column form grids. |
| `lg` | $1024\text{px}$ | Laptops & Small Desktops | Fixed sidebar; Split-pane problem solver layout activated. |
| `xl` | $1280\text{px}$ | Standard Desktop Displays | Expanded table columns, rich charts, and full matrix scoreboard. |
| `2xl` | $1536\text{px}$ | Ultra-wide Displays | Container max-width constrained with centered margin alignment. |

---

## ♿ 6. Accessibility & Usability Standards (WCAG 2.1 AA)

- 👁️ **Contrast Ratios**: All text tokens maintain minimum $4.5:1$ contrast ratio against background surfaces.
- ⌨️ **Keyboard Navigation**: Complete focus ring visibility (`focus-visible:ring-2 focus-visible:ring-sky-400`), skip-to-content anchors, and keyboard-accessible modal dialogs.
- 🏷️ **ARIA Labels**: All interactive icon buttons (`IconButton`), tabs, and status badges include explicit `aria-label` attributes.
- 🚫 **Reduced Motion**: Respects `prefers-reduced-motion` media query to suppress animations for sensitive users.
