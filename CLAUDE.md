# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Weple** is a Next.js wedding planning application with AI-powered vendor recommendations, budget tracking, checklist management, couple collaboration, and a community forum. The design system is called "Romantic Spring" — soft, elegant, blossom-inspired UI.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (runs TypeScript type checking)
npm run lint     # ESLint validation
npm start        # Run production build locally
```

To regenerate Supabase TypeScript types after schema changes:
```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > lib/types/database.types.ts
```

## Architecture

### Routing (Next.js App Router)

- `app/(auth)/` — Public pages: `/login`, `/signup`, `/onboarding`
- `app/(dashboard)/` — Protected pages: `/dashboard`, `/schedule`, `/checklist`, `/vendors`, `/vendors/[id]`, `/community`, `/community/[id]`, `/community/write`
- `app/api/` — Route handlers

**Middleware redirect logic** (`middleware.ts` → `lib/supabase/middleware.ts`):
1. No session → `/login`
2. Session but no profile/wedding_date → `/onboarding`
3. Session with wedding_date → `/dashboard`

### Data Layer

**Server Actions** in `actions/` handle all mutations and most data fetching:
- `actions/ai.ts` — AI vendor recommendations and wedding plan generation (Anthropic API via Vercel AI SDK)
- `actions/budget.ts` — Total budget and cost summary
- `actions/checklist.ts` — Wedding task CRUD, D-Day scheduling, budget per task
- `actions/community.ts` — Posts and comments
- `actions/vendors.ts` — Vendor catalog queries (category, region filtering)
- `actions/user-vendors.ts` — User's personal vendor selections
- `actions/invite.ts` — Couple group invite codes
- `actions/profile.ts` — User profile updates

**Supabase clients:**
- `lib/supabase/server.ts` — Server Components and Server Actions (uses `cookies()`)
- `lib/supabase/client.ts` — Client Components (session-only, no persistence)

### Component Pattern

Pages are Server Components that fetch data and pass it as props to Client Components:
- Client Components are named with a `Client` suffix (e.g., `ChecklistClient.tsx`, `VendorClient.tsx`)
- Use `revalidatePath()` after mutations in Server Actions

### Auth

Supabase Auth with `@supabase/ssr`. Sessions are cookie-based and expire when the browser closes (no `maxAge`/`expires` set). RLS policies enforce `auth.uid() = user_id` on all tables. Group-shared data uses `wedding_group_id`.

### Database Schema (Key Tables)

- **profiles** — User profiles with `wedding_date`, `wedding_group_id`, `budget_min/max`, `region_sido/sigungu`
- **tasks** — Checklist items with `d_day` (days before wedding), `estimated_budget`, `actual_cost`, `category`
- **wedding_groups** — Couple group with `total_budget`, linked by `profiles.wedding_group_id`
- **vendors** / **vendor_categories** — Vendor catalog with region and category filtering
- **user_vendors** — User's chosen vendors with `is_confirmed`, `memo`, `price_range`
- **posts** / **comments** — Community forum

Types are auto-generated at `lib/types/database.types.ts` (exported as `Database`).

### Styling

Tailwind CSS 4 with a custom theme defined in `tailwind.config.ts`:
- **Primary colors:** `primary` (#F9A8D4 pink), `gold` (#D4A373), `sage` (#A7C4A0)
- **Backgrounds:** `bg-blush` (#FDF2F8), `bg-cream` (#FFFBF0)
- **Fonts:** `font-pretendard` (body), `font-serif` Cormorant Garamond (titles), `font-cursive` Dancing Script (decorative), `font-cinzel` (premium headings)
- **Custom animations:** `animate-petal-fall`, `animate-bloom`, `animate-fade-in-up`, `animate-float`, `animate-shimmer`
- **Utility:** Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes

### TypeScript Gotchas

Supabase type inference can sometimes produce `never` types. When this happens:
- Add explicit type annotations to variables receiving query results
- Use `as` casting only when the inferred type is provably wrong
- Avoid `.data as any` — prefer narrowing with null checks first
- Always handle `null` — Supabase returns `data | null` on single-row queries

### AI Integration

Uses Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/google`). AI functions live in `actions/ai.ts` and are called from Server Actions or API routes.

### Agent Documentation

The `agent/` directory contains role-specific instructions (excluded from TypeScript compilation). These files define multi-agent collaboration rules for Developer, Designer, and Planner roles — consult them when working on cross-functional features.
