# Sitemap — note.cozyroad.com

> Captured: 2026-04-14

## Route Map

| Path | Page Title | Auth Required | Description |
|------|-----------|--------------|-------------|
| `/` | Landing | No | Marketing page: hero, features, pricing, CTA. Shows brand name "Simplanet Note". |
| `/login` | Login | No | Email + password sign-in form with link to register. |
| `/register` | Register | No | Sign-up form: name, work email, password, optional workspace name. |
| `/app` | Main Workspace | Yes | 3-panel SPA: left sidebar nav, middle note list, right note editor. Entry point after login. |
| `/profile` | Profile Settings | Yes | Update display name; change password (current + new). Separate from main SPA layout. |

## SPA Navigation (within `/app`)

These views are rendered inside the `/app` shell based on sidebar selection. They are **not** separate routes — the URL stays `/app`:

| View | Nav Label | Description |
|------|-----------|-------------|
| All Notes | 📝 All Notes | Lists all user notes sorted by updated date. Default view. |
| Shared with me | 👥 Shared with me | Notes shared with the authenticated user by others. |
| Trash | 🗑️ Trash | Soft-deleted notes pending permanent removal. |
| Notebook | (notebook name) | Notes filtered to a specific notebook. |
| Tag | (tag name) | Notes filtered by a specific tag. |

## Redirect Behavior

Routes `/notes`, `/dashboard`, `/workspace`, `/home`, `/editor`, `/archive`, `/search`, `/tags`, `/folders` all render the main `/app` SPA without a distinct route change — they load the same shell.

## Auth Flow

- Unauthenticated access to `/app` or `/profile` redirects to `/login`.
- After login, user is sent to `/app`.
- Logout clears session and returns to `/login`.

## Public Access

- `/login` and `/register` accessible without auth.
- `/` accessible to all — redirects authenticated users or just shows marketing.
- No publicly-shared note URLs were discovered during exploration (feature exists per landing copy, URLs unknown).
