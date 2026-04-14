# Architecture — Simplanet Note Clone

> Phase 2 design document  
> Date: 2026-04-14

---

## 1. Data Model (Supabase / Postgres)

### 1.1 Tables

#### `profiles`
Extends `auth.users`. Created via trigger on new user signup.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, FK → `auth.users.id` ON DELETE CASCADE | Matches Supabase Auth user ID |
| `name` | `text` | NOT NULL, DEFAULT '' | Display name |
| `workspace_name` | `text` | NOT NULL, DEFAULT 'My Workspace' | Optional at register |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

#### `notebooks`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users.id` ON DELETE CASCADE | Owner |
| `name` | `text` | NOT NULL | |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

#### `tags`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users.id` ON DELETE CASCADE | Owner |
| `name` | `text` | NOT NULL | |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| UNIQUE | `(user_id, name)` | | No duplicate tag names per user |

#### `notes`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users.id` ON DELETE CASCADE | Owner |
| `notebook_id` | `uuid` | NULLABLE, FK → `notebooks.id` ON DELETE SET NULL | |
| `title` | `text` | NOT NULL, DEFAULT 'Untitled' | |
| `content` | `text` | NOT NULL, DEFAULT '' | Raw Quill HTML string |
| `content_text` | `text` | NOT NULL, DEFAULT '' | Plain-text strip for full-text search |
| `is_pinned` | `boolean` | NOT NULL, DEFAULT false | |
| `is_deleted` | `boolean` | NOT NULL, DEFAULT false | Soft delete (trash) |
| `deleted_at` | `timestamptz` | NULLABLE | Set when moved to trash |
| `is_public` | `boolean` | NOT NULL, DEFAULT false | Public sharing |
| `public_slug` | `text` | NULLABLE, UNIQUE | URL-safe slug for public link |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

Full-text search index:
```sql
CREATE INDEX notes_fts_idx ON notes
  USING gin(to_tsvector('english', title || ' ' || content_text));
```

#### `note_tags`
| Column | Type | Constraints |
|--------|------|-------------|
| `note_id` | `uuid` | NOT NULL, FK → `notes.id` ON DELETE CASCADE |
| `tag_id` | `uuid` | NOT NULL, FK → `tags.id` ON DELETE CASCADE |
| PRIMARY KEY | `(note_id, tag_id)` | |

#### `shared_notes`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `note_id` | `uuid` | NOT NULL, FK → `notes.id` ON DELETE CASCADE | |
| `shared_by` | `uuid` | NOT NULL, FK → `auth.users.id` ON DELETE CASCADE | |
| `shared_with_email` | `text` | NOT NULL | Recipient email (may not be a user yet) |
| `shared_with` | `uuid` | NULLABLE, FK → `auth.users.id` ON DELETE SET NULL | Resolved after recipient signs up |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| UNIQUE | `(note_id, shared_with_email)` | | |

### 1.2 RLS Policies

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- notebooks
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_notebooks" ON notebooks
  FOR ALL USING (auth.uid() = user_id);

-- tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

-- notes: owner full access
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_notes" ON notes
  FOR ALL USING (auth.uid() = user_id);
-- notes: shared recipients can read
CREATE POLICY "shared_recipients_read" ON notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_notes
      WHERE note_id = notes.id AND shared_with = auth.uid()
    )
  );
-- notes: public notes readable by all (even anon)
CREATE POLICY "public_notes_readable" ON notes
  FOR SELECT USING (is_public = true AND is_deleted = false);

-- note_tags: follow note ownership
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "note_tags_via_note" ON note_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid())
  );

-- shared_notes: owner can manage, recipient can read
ALTER TABLE shared_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared_by_owner" ON shared_notes
  FOR ALL USING (auth.uid() = shared_by);
CREATE POLICY "shared_with_recipient" ON shared_notes
  FOR SELECT USING (auth.uid() = shared_with);
```

### 1.3 Database Trigger (auto-create profile)

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, workspace_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'workspace_name', 'My Workspace')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 2. Next.js Route Structure (App Router)

```
app/
├── layout.tsx                    # Root layout (fonts, global CSS)
├── page.tsx                      # Landing /
│
├── login/
│   └── page.tsx                  # /login
├── register/
│   └── page.tsx                  # /register
│
├── app/
│   └── page.tsx                  # /app — main SPA (auth guarded)
│
├── profile/
│   └── page.tsx                  # /profile (auth guarded)
│
├── notes/
│   └── [slug]/
│       └── page.tsx              # /notes/:slug — public shared note view
│
└── api/
    ├── auth/
    │   ├── me/route.ts           # GET — current user + profile
    │   └── logout/route.ts       # POST — sign out
    ├── notes/
    │   ├── route.ts              # GET (list), POST (create)
    │   └── [id]/
    │       ├── route.ts          # GET, PATCH, DELETE
    │       └── share/route.ts    # POST (share note), DELETE (unshare)
    ├── notebooks/
    │   ├── route.ts              # GET, POST
    │   └── [id]/route.ts         # PATCH, DELETE
    ├── tags/
    │   ├── route.ts              # GET, POST
    │   └── [id]/route.ts         # DELETE
    ├── profile/
    │   └── route.ts              # PATCH (name), POST password change
    └── import/
        └── route.ts              # POST — Evernote .enex import
```

### 2.1 Auth Guard Strategy

Use Next.js Middleware (`middleware.ts`) with `@supabase/ssr`:

```
middleware.ts               # Runs on every request
  - refreshes session cookie
  - redirects /app and /profile → /login if no session
  - redirects /login and /register → /app if session exists
```

---

## 3. Auth Flow

```
Register:
  POST /register (client) →
    supabase.auth.signUp({ email, password, options: { data: { name, workspace_name } } }) →
    trigger creates profiles row →
    redirect /app

Login:
  POST /login (client) →
    supabase.auth.signInWithPassword({ email, password }) →
    redirect /app

Logout:
  Click Logout →
    supabase.auth.signOut() →
    redirect /login

Session refresh:
  middleware.ts runs createServerClient, calls getUser() →
  rotates cookie automatically

Password change:
  POST /api/profile →
    supabase.auth.updateUser({ password: newPassword })
    (requires verifying current password first via re-auth)
```

---

## 4. Component Tree

```
app/
├── layout.tsx
│   └── <html> <body>
│
├── page.tsx (Landing)
│   ├── LandingNav
│   ├── HeroSection
│   ├── FeaturesGrid
│   │   └── FeatureCard × 6
│   ├── PricingSection
│   ├── CTASection
│   └── LandingFooter
│
├── login/page.tsx
│   └── AuthCard
│       └── LoginForm
│
├── register/page.tsx
│   └── AuthCard
│       └── RegisterForm
│
├── app/page.tsx  (client component — manages all SPA state)
│   ├── MobileMenuButton
│   ├── Sidebar
│   │   ├── SidebarHeader          (user name, logout, plan badge)
│   │   ├── NewNoteButton
│   │   ├── SidebarNavItem × 3     (All Notes, Shared, Trash)
│   │   ├── CollapsibleSection     (NOTEBOOKS)
│   │   │   ├── NotebookItem × n
│   │   │   └── CreateNotebookInput
│   │   ├── CollapsibleSection     (TAGS)
│   │   │   ├── TagItem × n
│   │   │   └── CreateTagInput
│   │   └── ImportEvernoteButton
│   ├── NoteListPanel
│   │   ├── SearchInput
│   │   ├── NoteListEmpty          (conditional)
│   │   └── NoteCard × n
│   └── NoteEditorPanel
│       ├── MobileBackButton       (mobile only)
│       ├── NoteTitleInput
│       ├── QuillEditor
│       └── NoteEditorEmpty        (no note selected state)
│
└── profile/page.tsx
    ├── BackButton
    ├── AccountInfoCard
    │   └── UpdateProfileForm
    └── ChangePasswordCard
        └── ChangePasswordForm
```

---

## 5. API Route Contracts

### `GET /api/auth/me`
Response: `{ user: { id, email }, profile: { name, workspace_name } }`

### `GET /api/notes`
Query params: `view` (`all` | `trash` | `shared`), `notebook_id`, `tag_id`, `q` (search)  
Response: `{ notes: Note[] }`  
Note type: `{ id, title, content, content_text, is_pinned, is_deleted, notebook_id, created_at, updated_at }`

### `POST /api/notes`
Body: `{ title?, content?, notebook_id? }`  
Response: `{ note: Note }`

### `PATCH /api/notes/:id`
Body: Partial `{ title, content, content_text, is_pinned, is_deleted, deleted_at, notebook_id, is_public }`  
Response: `{ note: Note }`

### `DELETE /api/notes/:id`
Permanent delete (only for notes already in trash).  
Response: `{ ok: true }`

### `GET /api/notebooks`
Response: `{ notebooks: Notebook[] }`

### `POST /api/notebooks`
Body: `{ name }`  
Response: `{ notebook: Notebook }`

### `DELETE /api/notebooks/:id`
Response: `{ ok: true }`

### `GET /api/tags`
Response: `{ tags: Tag[] }`

### `POST /api/tags`
Body: `{ name }`  
Response: `{ tag: Tag }`

### `DELETE /api/tags/:id`
Response: `{ ok: true }`

### `PATCH /api/profile`
Body: `{ name? }` or `{ current_password, new_password }`  
Response: `{ ok: true }`

### `POST /api/import`
Body: `FormData` with `.enex` file  
Response: `{ imported: number, errors: string[] }`

---

## 6. Third-Party Integrations

| Library | Purpose | Package |
|---------|---------|---------|
| Supabase JS | Auth + DB client | `@supabase/supabase-js` |
| Supabase SSR | Cookie-based auth for Next.js | `@supabase/ssr` |
| React Quill | Rich text editor (Quill ql-snow) | `react-quill-new` (React 19 compatible fork) |
| xml2js or fast-xml-parser | Parse Evernote .enex XML | `fast-xml-parser` |

No paid or proprietary APIs required.

---

## 7. Faithful Reproduction Notes

| Feature | Status | Notes |
|---------|--------|-------|
| Quill ql-snow theme | ✅ Exact match possible | Use `react-quill-new` with `theme="snow"` |
| System font stack | ✅ Exact match | No web fonts to license |
| Evernote .enex import | ⚠️ Approximate | .enex is XML; parse with `fast-xml-parser`, strip ENML tags, map to plain HTML |
| Public note sharing | ✅ Via `public_slug` on notes | Route: `/notes/[slug]` |
| Plan badge "FREE" | ✅ Hardcoded for now | No billing integration needed for clone |
| "Shared with me" by email | ⚠️ Simplified | Will share by email; recipient lookup by email on login |
| Note auto-save | ✅ Debounced PATCH | 1-2s debounce on title/content change |
| Pinning | ✅ | `is_pinned` flag, pinned notes sorted first |
| Trash / soft delete | ✅ | `is_deleted + deleted_at` flags |
| Mobile responsive | ✅ | Matches sidebar toggle and back button behavior |
