# Build Plan — Simplanet Note Clone

> Phase 3 task list  
> Date: 2026-04-14  
> Execute tasks in order. Commit after each completed task.

---

## Task 1 — Project Bootstrap

**Files:**
```
package.json
next.config.ts
tsconfig.json
tailwind.config.ts
postcss.config.mjs
.env.local
.gitignore
```

**Steps:**
```bash
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --eslint
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add react-quill-new fast-xml-parser
pnpm add -D playwright @playwright/test
```

**Acceptance criteria:**
- `pnpm dev` starts with no errors
- `pnpm build` succeeds
- `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## Task 2 — Tailwind Custom Theme

**File:** `tailwind.config.ts`

**Changes:**
```ts
colors: {
  'evernote-green':   '#00a82d',
  'evernote-sidebar': '#1a1a1a',
  'evernote-hover':   '#2d2d2d',
  'evernote-dark':    '#3d3d3d',
}
```

**Acceptance criteria:**
- `className="bg-evernote-green"` renders `#00a82d` green
- `className="bg-evernote-sidebar"` renders dark sidebar color

---

## Task 3 — Supabase Client Setup

**Files:**
```
lib/supabase/client.ts     # browser client (createBrowserClient)
lib/supabase/server.ts     # server client (createServerClient with cookies)
middleware.ts              # session refresh + auth redirects
```

**middleware.ts behaviour:**
- Refresh session on every request
- Redirect to `/login` if unauthenticated and path starts with `/app` or `/profile`
- Redirect to `/app` if authenticated and path is `/login` or `/register`

**Acceptance criteria:**
- Visiting `/app` unauthenticated redirects to `/login`
- Visiting `/login` while authenticated redirects to `/app`
- Session cookie is refreshed silently on each request

---

## Task 4 — Database Schema

**File:** `supabase/migrations/001_initial_schema.sql`

**Creates:**
- `profiles` table + trigger `on_auth_user_created`
- `notebooks` table
- `tags` table
- `notes` table with FTS index
- `note_tags` join table
- `shared_notes` table
- All RLS policies (see `docs/architecture.md` section 1.2)

**Acceptance criteria:**
- Running migration against the Supabase project succeeds with no errors
- Inserting a test auth user auto-creates a `profiles` row
- RLS prevents user A from reading user B's notes

---

## Task 5 — Landing Page (`/`)

**Files:**
```
app/page.tsx
app/components/landing/LandingNav.tsx
app/components/landing/HeroSection.tsx
app/components/landing/FeaturesGrid.tsx
app/components/landing/PricingSection.tsx
app/components/landing/CTASection.tsx
app/components/landing/LandingFooter.tsx
```

**Pixel targets (from `docs/UI-spec.md`):**
- Nav: `sticky top-0 bg-white/95 backdrop-blur z-50 border-b`, max-w-6xl
- H1: `text-5xl md:text-6xl font-bold text-gray-900 leading-tight`
- Badge: `bg-green-50 text-evernote-green px-3 py-1 rounded-full text-sm`
- Primary CTA: `bg-evernote-green text-white py-3 px-8 rounded-xl text-lg font-medium hover:bg-green-600`
- Secondary CTA: `border border-gray-300 text-gray-700 py-3 px-8 rounded-xl hover:bg-gray-50`
- Features: 3-col grid, each card has emoji + h3 + p
- Footer: `bg-gray-900` dark footer

**Acceptance criteria:**
- Screenshot at 1440px matches `docs/screenshots/01-home-public.png` within reason
- All links resolve (`/login`, `/register`)
- No layout overflow on mobile (320px)

---

## Task 6 — Auth Pages (`/login`, `/register`)

**Files:**
```
app/login/page.tsx
app/register/page.tsx
app/components/auth/AuthCard.tsx
app/components/auth/LoginForm.tsx
app/components/auth/RegisterForm.tsx
```

**LoginForm fields:** email, password. Button: "Sign In".  
**RegisterForm fields:** name, work email, password (min 6), workspace name (optional). Button: "Create Free Account".

**Supabase calls:**
- Login: `supabase.auth.signInWithPassword({ email, password })`
- Register: `supabase.auth.signUp({ email, password, options: { data: { name, workspace_name } } })`
- On success: `router.push('/app')`
- On error: show error message inline

**Acceptance criteria:**
- Can sign in with `nstung@gmail.com` / `5TlHi&G^v$`
- Can register a new user (generates real Supabase account)
- Error message shown for invalid credentials
- Inputs match spec: `p-3 border rounded-lg focus:ring-2 focus:ring-evernote-green`
- Screenshots match `docs/screenshots/02-login.png` and `docs/screenshots/23-register.png`

---

## Task 7 — API Routes — Auth

**Files:**
```
app/api/auth/me/route.ts
app/api/auth/logout/route.ts
```

**`GET /api/auth/me`**
- Creates server Supabase client
- Calls `supabase.auth.getUser()`
- Joins with `profiles` table
- Returns `{ user: { id, email }, profile: { name, workspace_name } }`

**`POST /api/auth/logout`**
- Calls `supabase.auth.signOut()`
- Returns `{ ok: true }`

**Acceptance criteria:**
- `GET /api/auth/me` with valid cookie returns user JSON
- `GET /api/auth/me` with no cookie returns 401
- `POST /api/auth/logout` clears session cookie

---

## Task 8 — API Routes — Notes

**Files:**
```
app/api/notes/route.ts
app/api/notes/[id]/route.ts
```

**`GET /api/notes`**  
Query params: `view` (`all`|`trash`|`shared`), `notebook_id`, `tag_id`, `q`

Logic:
- `view=all` (default): `is_deleted = false`, ordered by `is_pinned DESC, updated_at DESC`
- `view=trash`: `is_deleted = true`
- `view=shared`: join `shared_notes` where `shared_with = user_id`
- `notebook_id`: filter by notebook
- `tag_id`: join `note_tags`
- `q`: FTS — `to_tsvector(...) @@ plainto_tsquery(q)`

**`POST /api/notes`**  
Creates note with `{ title: 'Untitled', content: '', user_id: auth_user_id }`.

**`PATCH /api/notes/:id`**  
Updates any subset of: `title`, `content`, `content_text`, `is_pinned`, `is_deleted`, `deleted_at`, `notebook_id`, `is_public`. Always updates `updated_at`.

**`DELETE /api/notes/:id`**  
Hard-deletes. Only allowed if `is_deleted = true` (note is in trash).

**Acceptance criteria:**
- Creating a note returns note with `id`
- Listing returns notes sorted pinned-first then by date
- Soft delete sets `is_deleted=true`; note no longer appears in `view=all`
- Note appears in `view=trash` after soft delete
- Hard delete removes row entirely
- Search `?q=hello` returns notes containing "hello"

---

## Task 9 — API Routes — Notebooks, Tags, Profile, Import

**Files:**
```
app/api/notebooks/route.ts
app/api/notebooks/[id]/route.ts
app/api/tags/route.ts
app/api/tags/[id]/route.ts
app/api/profile/route.ts
app/api/import/route.ts
```

**Notebooks:** GET list, POST create, DELETE by id (sets `notebook_id = null` on orphaned notes).  
**Tags:** GET list, POST create (unique per user), DELETE by id.  
**Profile PATCH:** `{ name }` → updates `profiles.name`; `{ current_password, new_password }` → `supabase.auth.updateUser({ password })` (Supabase handles re-auth via session).  
**Import POST:** Accepts `multipart/form-data` with `.enex` file. Parses XML with `fast-xml-parser`, extracts `<note>` elements (title, content), strips ENML tags to plain HTML, batch-inserts into `notes`.

**Acceptance criteria:**
- Creating a notebook returns `{ id, name }`
- Deleting a notebook does not delete its notes (sets `notebook_id = null`)
- Creating a duplicate tag returns 409
- Profile name update persists across page reload
- Uploading a valid `.enex` file imports notes with correct titles

---

## Task 10 — App Shell (`/app` page, Sidebar)

**Files:**
```
app/app/page.tsx                        # Client component — root SPA state
app/components/app/AppShell.tsx         # 3-column layout wrapper
app/components/app/Sidebar.tsx
app/components/app/SidebarHeader.tsx
app/components/app/SidebarNav.tsx
app/components/app/CollapsibleSection.tsx
app/components/app/NotebookList.tsx
app/components/app/TagList.tsx
app/components/app/ImportEvernoteButton.tsx
```

**State managed in `app/app/page.tsx`:**
```ts
type AppView = 'all' | 'trash' | 'shared' | { notebook_id: string } | { tag_id: string }
const [view, setView] = useState<AppView>('all')
const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
const [sidebarOpen, setSidebarOpen] = useState(false)   // mobile
```

**Sidebar layout:** Exact match of `docs/UI-spec.md` section 2.3.  
- Width: `w-64`
- bg: `bg-evernote-sidebar text-white`
- Active nav item: `bg-evernote-hover text-evernote-green`
- Mobile: `-translate-x-full` / `translate-x-0` toggled by ☰ button

**Acceptance criteria:**
- Sidebar renders with all sections (nav, notebooks, tags, import)
- Clicking All Notes / Shared / Trash changes active view state
- NOTEBOOKS section collapses/expands on header click
- TAGS section collapses/expands on header click
- On mobile (<768px), sidebar is hidden by default; ☰ shows it
- Logout button calls `POST /api/auth/logout` and redirects to `/login`
- Username in header links to `/profile`

---

## Task 11 — Note List Panel

**Files:**
```
app/components/app/NoteListPanel.tsx
app/components/app/SearchInput.tsx
app/components/app/NoteCard.tsx
app/components/app/NoteListEmpty.tsx
```

**Behaviour:**
- Fetches `GET /api/notes?view=...&notebook_id=...&tag_id=...&q=...` based on current `view` state
- Search: debounced 300ms, appends `?q=` to fetch
- Note card: `p-4 border-b cursor-pointer hover:bg-gray-100`
  - Pin icon 📌 if `is_pinned`
  - Title (semibold, truncated)
  - Content preview (2 lines, text-xs text-gray-400)
  - Date (text-xs, formatted as "Apr 13, 2026")
- Selected note highlighted
- Empty state: "No notes found" when list is empty
- On mobile: panel is hidden when a note is selected

**Acceptance criteria:**
- Notes render with correct title, preview, date
- Pinned notes appear first
- Search filters list in real-time
- Clicking a note sets `selectedNoteId`
- View changes (All/Trash/Shared) reload the list
- Empty state shown when list is empty

---

## Task 12 — Note Editor Panel (Quill)

**Files:**
```
app/components/app/NoteEditorPanel.tsx
app/components/app/NoteTitleInput.tsx
app/components/app/QuillEditor.tsx      # dynamic import (SSR disabled)
app/components/app/NoteEditorEmpty.tsx
```

**QuillEditor:**
- `import dynamic from 'next/dynamic'` with `{ ssr: false }`
- `import ReactQuill from 'react-quill-new'`
- Theme: `snow`
- Toolbar: `[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['blockquote', 'code-block'], ['link', 'image']`
- Import `react-quill-new/dist/quill.snow.css` in layout or component
- `onChange` → debounced 1500ms → `PATCH /api/notes/:id` with `{ content: html, content_text: quill.getText() }`

**NoteTitleInput:**
- `<input placeholder="Note title">` 
- `onChange` → debounced 1000ms → `PATCH /api/notes/:id` with `{ title }`

**Empty state (no note selected):**
- "Select a note or create a new one" centered text

**Mobile back button:**
- `className="md:hidden p-3 border-b text-left text-evernote-green"`
- Text: "← Back to notes"
- Click → `setSelectedNoteId(null)`

**Acceptance criteria:**
- Opening a note loads its title and content into the editor
- Editing title auto-saves after 1s debounce
- Editing content auto-saves after 1.5s debounce
- Creating a new note via "+ New Note" creates note via API and selects it
- Mobile: "← Back to notes" button visible; click returns to note list
- Empty state shown when no note is selected

---

## Task 13 — Notebooks & Tags (Create + Filter)

**Files:** (extend existing sidebar components)

**Create notebook:**
- Input in sidebar: `placeholder="New notebook"` + `+` button
- On submit: `POST /api/notebooks` → add to list → clear input

**Create tag:**
- Input in sidebar: `placeholder="New tag"` + `+` button
- On submit: `POST /api/tags` → add to list → clear input

**Filter:**
- Clicking notebook in sidebar → `setView({ notebook_id: id })`
- Clicking tag in sidebar → `setView({ tag_id: id })`
- Note list re-fetches with new filter param

**Note–notebook assignment** (in editor):
- Dropdown or button in note editor header area
- Shows current notebook (if any)
- Click to assign/change → `PATCH /api/notes/:id` with `{ notebook_id }`

**Acceptance criteria:**
- Creating a notebook adds it to sidebar list
- Clicking a notebook filters note list to its notes
- Creating a tag adds it to sidebar list
- Clicking a tag filters note list
- Assigning a note to a notebook persists across reload

---

## Task 14 — Trash & Soft Delete

**Files:** (extend existing components)

**Soft delete from editor:**
- Delete button in note editor (e.g. toolbar or context menu)
- Calls `PATCH /api/notes/:id` with `{ is_deleted: true, deleted_at: new Date().toISOString() }`
- Removes note from current view
- Sets `selectedNoteId(null)`

**Trash view:**
- Clicking 🗑️ Trash in sidebar → `setView('trash')`
- Note list fetches `GET /api/notes?view=trash`
- Note cards show "Restore" and "Delete Forever" actions instead of normal click

**Restore:**
- `PATCH /api/notes/:id` with `{ is_deleted: false, deleted_at: null }`
- Remove from trash list

**Delete forever:**
- Confirm prompt → `DELETE /api/notes/:id`
- Remove from trash list

**Acceptance criteria:**
- Deleting a note from editor removes it from All Notes and Trash view shows it
- Restore returns note to All Notes
- Delete Forever removes the row (not recoverable)
- Trash view shows empty state when no deleted notes

---

## Task 15 — Profile Page (`/profile`)

**Files:**
```
app/profile/page.tsx
app/components/profile/AccountInfoCard.tsx
app/components/profile/ChangePasswordCard.tsx
```

**Layout:** Matches `docs/UI-spec.md` section 2.4.
- `bg-gray-100 min-h-screen`
- Left sidebar strip with "← Back to Notes" button
- Main: `max-w-xl mx-auto py-8 px-4`
- Two white cards: Account Info, Change Password

**AccountInfoCard:**
- Shows email (read-only)
- Name input (pre-filled from profile)
- "Update Profile" button → `PATCH /api/profile` with `{ name }` → success toast or message

**ChangePasswordCard:**
- Current Password input
- New Password input
- "Change Password" button → `PATCH /api/profile` with `{ current_password, new_password }` → success/error message

**Acceptance criteria:**
- Profile name is pre-filled with current name from DB
- Updating name persists (re-visit page shows new name)
- Password change succeeds for correct current password
- Error shown for wrong current password
- "← Back to Notes" button navigates to `/app`

---

## Task 16 — Search

**Files:** (extend `SearchInput.tsx` and `NoteListPanel.tsx`)

Full-text search is already handled by `GET /api/notes?q=` (Task 8). This task wires the UI:

- Search input at top of note list panel
- Debounced 300ms on change
- Passes `q` param to note list fetch
- Clears to show all notes when input is cleared

**Acceptance criteria:**
- Typing in search filters note list in real-time
- Search matches title and content
- Clearing search restores full list
- Screenshots match `docs/screenshots/21-search-results.png`

---

## Task 17 — Shared Notes (Receive)

**Files:**
```
app/components/app/SharedNotesList.tsx
app/api/notes/route.ts   # already handles view=shared
```

**Behaviour:**
- Clicking "👥 Shared with me" → `setView('shared')`
- Fetches notes via `GET /api/notes?view=shared` (joins `shared_notes`)
- Notes are read-only (no edit in editor)

*Note: The share-out mechanism (sharing your note with someone else) is deferred to a later task as it requires a share modal UI not fully observed in the original.*

**Acceptance criteria:**
- Shared view loads without error
- Notes shared with the current user appear in the list
- Empty state when no notes have been shared

---

## Task 18 — Import from Evernote

**Files:**
```
app/api/import/route.ts
app/components/app/ImportEvernoteButton.tsx
```

**ImportEvernoteButton:**
- Hidden `<input type="file" accept=".enex">`
- Visible button "📥 Import from Evernote" triggers file dialog
- On file select: `POST /api/import` with `FormData`
- Show loading state; show success ("Imported N notes") or error toast

**`POST /api/import` logic:**
1. Parse `.enex` XML with `fast-xml-parser`
2. Extract `<note>` elements: `<title>`, `<content>` (ENML)
3. Strip `<?xml...?>`, `<!DOCTYPE...>`, `<en-note>` wrapper tags
4. Keep inner HTML-like content
5. Batch insert into `notes` (user_id, title, content, content_text)
6. Return `{ imported: N }`

**Acceptance criteria:**
- Uploading a valid `.enex` file imports notes
- Imported notes appear in All Notes list
- Non-.enex file shows error
- Invalid XML shows error

---

## Task 19 — Public Note Sharing

**Files:**
```
app/notes/[slug]/page.tsx           # Public read-only view
app/api/notes/[id]/share/route.ts   # POST toggle public, return slug
app/components/app/ShareNoteButton.tsx
```

**Share toggle in editor:**
- Button in note editor toolbar/header
- `POST /api/notes/:id/share` → sets `is_public=true`, generates `public_slug` (nanoid 8 chars) if not set
- Returns `{ url: '/notes/[slug]' }`
- Show copyable link in a small inline popover
- Second click unshares: `DELETE /api/notes/:id/share` → `is_public=false`

**Public page `/notes/[slug]`:**
- Server component — no auth required
- Fetches note by `public_slug` where `is_public = true`
- Renders: note title as `<h1>`, Quill content as read-only HTML
- 404 if slug not found or note is private

**Acceptance criteria:**
- Clicking share generates a URL copyable to clipboard
- Visiting the URL without auth shows the note content
- Making note private returns 404 on the public URL
- Deleted notes are not publicly accessible (`is_deleted = false` required)

---

## Task 20 — E2E Tests

**Files:**
```
playwright.config.ts
tests/auth.spec.ts
tests/notes.spec.ts
tests/profile.spec.ts
tests/shared.spec.ts
```

**Test coverage (Playwright):**

### `auth.spec.ts`
- [ ] `/login` returns HTTP 200
- [ ] `/register` returns HTTP 200
- [ ] Login with valid credentials redirects to `/app`
- [ ] Login with invalid credentials shows error
- [ ] Unauthenticated access to `/app` redirects to `/login`
- [ ] Logout redirects to `/login`

### `notes.spec.ts`
- [ ] `/app` returns HTTP 200 (authenticated)
- [ ] "+ New Note" creates a note and opens editor
- [ ] Typing a title auto-saves (visible on re-select)
- [ ] Typing content auto-saves
- [ ] Deleting a note moves it to Trash
- [ ] Restoring from Trash returns note to All Notes
- [ ] Search filters note list
- [ ] Pinning a note moves it to top of list

### `profile.spec.ts`
- [ ] `/profile` returns HTTP 200
- [ ] Update name persists after page reload
- [ ] Wrong current password shows error on change password

### `shared.spec.ts`
- [ ] Shared view loads without error

**Playwright config:**
```ts
// playwright.config.ts
baseURL: 'http://localhost:3000'
use: { trace: 'on-first-retry' }
```

**Acceptance criteria:**
- `pnpm exec playwright test` passes all tests
- `docs/test-report.md` created with pass/fail summary

---

## Task 21 — Test Report

**File:** `docs/test-report.md`

**Contents:**
- Date of run
- Total tests: N passed / M failed
- Known deviations from original site
- Screenshots comparison notes

---

## Commit Strategy

Each task = one commit. Message format:
```
feat: task N — <short description>
```

Example:
```
feat: task 1 — project bootstrap
feat: task 2 — tailwind custom tokens
feat: task 3 — supabase client setup and middleware
...
```
