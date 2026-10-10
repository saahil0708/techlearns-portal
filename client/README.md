# CodePlatform / TechLearns Portal — Frontend Client
 
Built with [Next.js (App Router)](https://nextjs.org), React 19, TypeScript, Tailwind CSS, and MUI.
 
## Rendering Strategy: SSR by Default
 
- **Server-Side Rendering (SSR) & React Server Components (RSC)**: Wherever SSR is possible, use Server Components by default for layouts, page routes, and static/data-fetching containers.
- **Client Components (`'use client'`)**: Kept strictly minimal and scoped to interactive leaf nodes, client-side event handlers, local states (`useState`, `useEffect`), Monaco editor, hardware diagnostics (Camera/Mic/Screen proctoring), or browser-dependent charting libraries.
 
## Getting Started
 
Run the development server from the monorepo root or `/client`:
 
```bash
# From workspace root:
pnpm dev:client

# Or from inside /client:
pnpm dev
```
 
Open [http://localhost:3000](http://localhost:3000) with your browser to view the platform.
 
## Project Structure
 
- `src/app/`: Next.js App Router routes (Problems, Contests, Leaderboard, Assessment System Check).
- `src/components/`: Reusable UI components (Modals, StarRatingBadge, ProblemWorkspace, Navigation).
- `src/lib/`: Typed API client, token management, and utility functions.
 
## Scripts
 
- `pnpm dev`: Start Next.js development server
- `pnpm build`: Build production Next.js standalone bundle
- `pnpm start`: Run production server
- `pnpm lint`: Run lint checks


