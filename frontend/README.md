# CodePlatform Frontend
 
Built with [Next.js 15+ (App Router)](https://nextjs.org), React 19, TypeScript, and Tailwind CSS.
 
## Rendering Strategy: SSR by Default
 
- **Server-Side Rendering (SSR) & React Server Components (RSC)**: Wherever SSR is possible, use Server Components by default for layouts, page routes, and static/data-fetching containers.
- **Client Components (`'use client'`)**: Kept strictly minimal and scoped to interactive leaf nodes, client-side event handlers, local states (`useState`, `useEffect`), or browser-dependent charting libraries.
 
## Getting Started
 
Run the development server:
 
```bash
pnpm dev
```
 
Open [http://localhost:3000](http://localhost:3000) with your browser to view the platform.
 
## Project Structure
 
- `src/app/`: Next.js App Router routes (SSR-first pages, layouts, error boundaries).
- `src/components/`: Reusable UI components (both Server Components and scoped interactive Client Components).
- `src/lib/`: Typed API client, token management, and utility functions.
 
## Scripts
 
- `pnpm dev`: Start Next.js development server
- `pnpm build`: Build production Next.js bundle
- `pnpm start`: Run production server
- `pnpm lint`: Run ESLint checks

