# TODO.md — Website Clone Project

We're going to clone this web: https://note.cozyroad.com

See crendentials at the end of the document

### Stack
- Framework: Next.js (App Router), TypeScript
- Styling: Tailwind CSS
- Auth: Supabase Auth
- DB: Supabase (Postgres)
- Package manager: pnpm
- Deployment: Vercel

---

## Phase 1 — Explore

**Goal:** Understand the site's structure, pages, and features before writing any spec.

### Steps

1. Use Playwright to visit all accessible pages (public + authenticated).
   - For authenticated pages, sign in using the credentials above.
   - Capture a screenshot of every distinct page/state to `docs/screenshots/`.
2. Record all routes and produce `docs/sitemap.md` with:
   - URL path
   - Page title
   - Auth required? (yes/no)
   - Brief description (1 sentence)
3. For each page, audit and note:
   - Layout structure (header, sidebar, main, footer)
   - Key UI components (forms, tables, modals, cards, navs)
   - Interactive features (filters, search, drag-drop, etc.)
   - Data displayed and its likely schema
   - Auth/permission behaviour

### Outputs
- `docs/screenshots/` — one screenshot per page/state
- `docs/sitemap.md` — full route map
- `docs/PRD.md` — product requirements (features, user flows, edge cases)
- `docs/UI-spec.md` — component inventory, layout rules, spacing, colors, typography

> **Stop here. Do not proceed to Phase 2 until the outputs are reviewed and approved.**

---

## Phase 2 — Review & Solution

**Goal:** Propose a concrete technical plan before writing any code.

### Steps

1. Read `docs/PRD.md` and `docs/UI-spec.md`.
2. Design the data model (tables, relationships, RLS policies for Supabase).
3. Define the Next.js route structure (file-based, App Router).
4. Identify any third-party integrations, API routes, or edge cases.
5. Flag any parts of the original site that cannot be reproduced faithfully
   (e.g. proprietary fonts, licensed media) and propose open alternatives.

### Outputs
- `docs/architecture.md` — data model, route map, auth flow, component tree
- `docs/plan.md` — ordered task list with file paths and acceptance criteria per task

> **Stop here. Do not write any application code until the plan is approved.**

---

## Phase 3 — Build & Test

**Goal:** Implement the clone and verify it end-to-end.

### Setup
```bash
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add -D playwright @playwright/test
```

### Rules
- Follow `docs/plan.md` task by task in order.
- Do not skip or reorder tasks.
- Commit after each completed task.

### Acceptance criteria (e2e Playwright tests must verify all of these)
- All routes in `docs/sitemap.md` return HTTP 200 (or the correct redirect).
- Unauthenticated users are redirected to the login page for protected routes.
- Supabase Auth sign-up, sign-in, and sign-out flows complete without errors.
- All forms submit successfully and reflect the correct DB state.
- UI layout matches `docs/UI-spec.md` — spot-check with Playwright screenshots vs `docs/screenshots/`.

### Test command
```bash
pnpm exec playwright test
```

### Outputs
- `/app` — Next.js application
- `/tests` — Playwright e2e test suite
- `docs/test-report.md` — pass/fail summary with any known deviations from the original site


## Credentials

### Website
- Login email: xxxxxx
- Login password: xxxxxx

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_xxxxxx
DATABASE_URL=postgresql://xxxxx
```
---

