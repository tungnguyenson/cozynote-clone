# Product Requirements Document — Simplanet Note Clone

> Based on: https://note.cozyroad.com  
> Captured: 2026-04-14

---

## 1. Overview

Simplanet Note is a web-based note-taking workspace modeled after Evernote. It provides a three-panel layout (sidebar navigation, note list, note editor) for creating, organizing, searching, and sharing rich-text notes. It is primarily aimed at individuals and small teams.

---

## 2. User Roles

| Role | Description |
|------|-------------|
| Guest | Unauthenticated — can view landing page, login, register |
| User | Authenticated — owns notes, notebooks, tags; can share |
| Shared-note recipient | A user who receives a shared note from another user |

---

## 3. Features

### 3.1 Authentication

| Feature | Details |
|---------|---------|
| Register | Name, work email, password (min 6 chars), optional workspace name. Terms of Service acceptance. |
| Login | Email + password. Submit button disabled while loading (disabled:opacity-50). |
| Logout | Button in sidebar header. Clears session, redirects to `/login`. |
| Profile | Update display name. Change password (current + new). Accessible at `/profile`. |
| Auth guard | `/app` and `/profile` require auth. Unauthenticated redirects to `/login`. |

### 3.2 Notes

| Feature | Details |
|---------|---------|
| Create note | "+ New Note" button in sidebar. Creates untitled note; opens editor immediately. |
| Title | Inline input at top of editor, placeholder "Note title". |
| Content | Quill rich-text editor (ql-snow theme). Supports headings, bold, italic, underline, strikethrough, ordered/unordered lists, links, images, blockquotes, code blocks. |
| Save | Auto-save (no explicit save button observed). |
| Delete (soft) | Notes move to Trash. |
| Delete (permanent) | From Trash view. |
| Pin note | Pin icon 📌 shown on pinned notes in list. Pinned notes appear at top. |
| Note list item | Shows: pin indicator, title, content preview, last updated date (e.g. "Apr 13, 2026"). |
| Note list empty | Shows "Select a note or create a new one" placeholder in editor pane. |

### 3.3 Notebooks

| Feature | Details |
|---------|---------|
| List | Shown in sidebar under NOTEBOOKS section (collapsible ▼). |
| Create | Inline input "New notebook" with + button. | 
| Filter | Clicking a notebook shows notes in that notebook. |

### 3.4 Tags

| Feature | Details |
|---------|---------|
| List | Shown in sidebar under TAGS section (collapsible ▼). |
| Create | Inline input "New tag" with + button. |
| Filter | Clicking a tag shows notes with that tag. |

### 3.5 Search

| Feature | Details |
|---------|---------|
| Search input | Present in the note list panel, placeholder "Search notes...". |
| Behavior | Full-text search across note titles and content. Results update inline. |

### 3.6 Shared Notes

| Feature | Details |
|---------|---------|
| Shared with me | SPA view accessible from sidebar nav. Shows notes other users have shared with the current user. |
| Public sharing | Referenced on landing page as a feature ("Public Sharing"). Share modal likely opens from the note editor. |

### 3.7 Trash

| Feature | Details |
|---------|---------|
| Trash view | SPA view accessible from sidebar nav (🗑️ Trash). |
| Contents | Soft-deleted notes. |
| Actions | Restore note; permanently delete. |

### 3.8 Import

| Feature | Details |
|---------|---------|
| Evernote import | Button "📥 Import from Evernote" in sidebar. Accepts `.enex` file upload. |

### 3.9 Plan/Billing

| Feature | Details |
|---------|---------|
| Plan badge | "FREE" badge shown next to workspace name in sidebar. |
| Pricing | Landing page shows "Simple pricing" section with multiple tiers. No in-app upgrade UI observed (may redirect externally). |

---

## 4. User Flows

### 4.1 New User Registration → First Note

1. Visit `/` → click "Get started free" → `/register`
2. Fill name, email, password, optional workspace name
3. Click "Create Free Account" → redirect to `/app`
4. Click "+ New Note"
5. Enter title, write content in Quill editor
6. Note auto-saves

### 4.2 Returning User: Edit Note

1. Visit `/login` → enter email + password → submit
2. `/app` loads with note list
3. Click a note in the middle panel
4. Editor loads note content
5. Edit in Quill → auto-save

### 4.3 Organize: Notebooks & Tags

1. In sidebar NOTEBOOKS section, type name + click +
2. In sidebar TAGS section, type name + click +
3. When editing a note, assign to notebook or tag (mechanism not fully observed — likely dropdown in note editor header)
4. Click notebook/tag in sidebar to filter note list

### 4.4 Trash Flow

1. Delete a note (mechanism from editor — likely context menu or toolbar button)
2. Note disappears from All Notes
3. Click 🗑️ Trash in sidebar
4. View deleted notes; restore or permanently delete

### 4.5 Profile Update

1. Click username in sidebar → opens `/profile`
2. Update display name → "Update Profile"
3. Or enter current + new password → "Change Password"
4. Click "← Back to Notes" to return

---

## 5. API Endpoints (Observed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/notes` | List user's notes |
| POST | `/api/notes` | Create a new note |
| GET | `/api/notebooks` | List user's notebooks |
| GET | `/api/tags` | List user's tags |

Additional endpoints (inferred, not directly observed):
- `PATCH /api/notes/:id` — Update note
- `DELETE /api/notes/:id` — Soft-delete note
- `POST /api/notebooks` — Create notebook
- `POST /api/tags` — Create tag
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register
- `POST /api/auth/logout` — Logout
- `PATCH /api/profile` — Update profile
- `POST /api/profile/password` — Change password
- `POST /api/import` — Import Evernote .enex

---

## 6. Edge Cases & Constraints

| Case | Behaviour |
|------|-----------|
| Empty note list | Shows "No notes found" message |
| No note selected | Right panel shows "Select a note or create a new one" |
| Unauthenticated route access | Redirect to `/login` |
| `/signup` → `/register` | `/signup` actually renders the landing page — the real register route is `/register` |
| Evernote import format | Accepts `.enex` files only |
| Plan gating | UI shows FREE badge; feature limits not fully audited |
| Mobile | Sidebar hidden by default; ☰ button toggles it. Note list hidden when editor open (← Back to notes). |

---

## 7. Non-Goals (Original Site Limitations)

- No proprietary fonts — uses system font stack
- No payment/billing UI observed in-app
- Pricing section on landing page appears to be informational only
