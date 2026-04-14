# UI Specification — Simplanet Note Clone

> Based on: https://note.cozyroad.com  
> Captured: 2026-04-14

---

## 1. Design Tokens

### 1.1 Colors

| Token | Value | Usage |
|-------|-------|-------|
| `evernote-green` | `rgb(0, 168, 45)` / `#00a82d` | Primary CTA, active nav item, links, logo text, button bg |
| `evernote-sidebar` | `rgb(26, 26, 26)` / `#1a1a1a` (approx) | Sidebar background |
| `evernote-hover` | `rgb(45, 45, 45)` / `#2d2d2d` (approx) | Sidebar item hover/active bg |
| `evernote-dark` | `rgb(61, 61, 61)` / `#3d3d3d` (approx) | Sidebar inputs background |
| White | `#ffffff` | Main content background, cards |
| `gray-50` | `rgb(249, 250, 251)` | Auth page background, note list bg |
| `gray-100` | `rgb(243, 244, 246)` | Profile page background |
| `gray-200` | `rgb(229, 231, 235)` | Borders, dividers |
| `gray-300` | `rgb(209, 213, 219)` | Sidebar inactive text, input borders |
| `gray-400` | `rgb(156, 163, 175)` | Sidebar section labels (NOTEBOOKS, TAGS) |
| `gray-500` | `rgb(107, 114, 128)` | Subtitle text on landing |
| `gray-600` | `rgb(75, 85, 99)` | Badge bg, body text secondary |
| `gray-700` | `rgb(55, 65, 81)` | Sidebar border |
| `gray-900` | `rgb(17, 24, 39)` | Headings, primary text |
| `green-50` | `rgb(240, 253, 244)` | Landing feature badge bg |
| `green-600` | `rgb(22, 163, 74)` (approx) | Button hover |

### 1.2 Typography

**Font stack:** `-apple-system, "system-ui", "Segoe UI", Roboto, sans-serif`  
No custom web fonts loaded.

| Context | Size | Weight | Color |
|---------|------|--------|-------|
| Landing H1 | 60px (clamp ~3rem–5xl) | bold | gray-900 |
| Landing H2 | 30px | bold | gray-900 |
| Landing H3 (feature) | 18px | semibold | gray-900 |
| Profile H1 | 24px | bold | gray-900 |
| Profile H2 | 18px | semibold | gray-900 |
| Body | 16px | normal | gray-700 |
| Small / labels | 14px | normal | gray-400 / gray-500 |
| XS (badges, sidebar meta) | 12px (text-xs) | normal | gray-300 / gray-600 |
| Button | 16px | medium | white |
| Note list title | 14px | semibold | white or dark |
| Note list preview | 12px | normal | gray-400 |

### 1.3 Spacing

Tailwind scale — most common values observed:

| Usage | Value |
|-------|-------|
| Sidebar width | `w-64` = 256px |
| Note list width | `w-80` = 320px (hidden on mobile) |
| Sidebar padding | `p-4` = 16px |
| Note card padding | `p-4` = 16px |
| Section gap | `mt-4` = 16px |
| Button padding | `py-2 px-4` |
| Input padding | `p-3` = 12px |
| Card padding (profile) | `p-6` = 24px |
| Page horizontal padding | `px-4` on mobile, `px-4–px-8` on landing |

### 1.4 Border Radius

| Element | Radius |
|---------|--------|
| Primary button | `rounded` = 4px |
| Note card / form card | `rounded-lg` = 8px |
| Landing hero mock | `rounded-2xl` = 16px |
| Feature badge (landing) | `rounded-full` |
| Plan badge (sidebar) | `rounded` = 4px |
| Sidebar toggle button | `rounded-lg` |

### 1.5 Shadows

| Element | Shadow |
|---------|--------|
| Auth form card | `shadow-sm` |
| Profile card | `shadow` |
| Landing mock preview | `shadow-2xl` |
| Sidebar mobile toggle | `shadow-lg` |

---

## 2. Layout

### 2.1 Landing Page (`/`)

```
┌─────────────────────── nav (sticky, border-b) ──────────────────────────┐
│  [Logo: Simplanet Note]          [Sign in]  [Get started free ▶]         │
└──────────────────────────────────────────────────────────────────────────┘
┌─────────────────────── hero (py-20, text-center) ────────────────────────┐
│  [Badge: WORKSPACE]                                                       │
│  <h1> Your notes, organized and shared </h1>                              │
│  <p> Subtitle copy </p>                                                   │
│  [Start for free ▶]  [Sign in]                                            │
│  [Mock UI screenshot — dark rounded card]                                 │
└──────────────────────────────────────────────────────────────────────────┘
┌─────────────────────── features grid ─────────────────────────────────────┐
│  <h2> Everything you need </h2>                                            │
│  3-col grid: Rich Text Editor | Notebooks & Tags | Full-Text Search        │
│              Collaboration    | Public Sharing   | Evernote Import          │
└───────────────────────────────────────────────────────────────────────────┘
┌─────────────────────── pricing section ───────────────────────────────────┐
│  <h2> Simple pricing </h2>                                                 │
│  (pricing tiers)                                                            │
└───────────────────────────────────────────────────────────────────────────┘
┌─────────────────────── CTA section ───────────────────────────────────────┐
│  <h2> Ready to get organized? </h2>                                        │
│  [Create your free account]  [Start free trial]                             │
└───────────────────────────────────────────────────────────────────────────┘
┌─────────────────────── footer ────────────────────────────────────────────┐
│  Logo  |  Privacy  Terms  Contact                                          │
└───────────────────────────────────────────────────────────────────────────┘
```

Nav: `sticky top-0 bg-white/95 backdrop-blur z-50 border-b`  
Max width: `max-w-6xl mx-auto`

### 2.2 Auth Pages (`/login`, `/register`)

```
┌──────────────────── min-h-screen bg-gray-50 flex items-center justify-center ────┐
│  ┌─────────────────── card (bg-white rounded-xl shadow-sm border p-8 max-w-md) ──┐│
│  │  [Logo text center]                                                             ││
│  │  <p> Sign in to your workspace </p>                                             ││
│  │  [email input]                                                                  ││
│  │  [password input]                                                               ││
│  │  [Sign In button]                                                               ││
│  │  Don't have an account? <a>Start for free</a>                                   ││
│  └─────────────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────────────┘
```

Register adds: name input, workspace name input, ToS disclaimer.

### 2.3 Main App (`/app`) — 3-column layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (w-64, bg-evernote-sidebar, text-white, fixed on mobile)             │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ [Tung ▸ username]                              [Logout]                   ││
│ │ Tung's Workspace  [FREE badge]                                            ││
│ │ [+ New Note ▶ green button full-width]                                    ││
│ ├──────────────────────────────────────────────────────────────────────────┤│
│ │ 📝 All Notes         (active: green text + hover bg)                      ││
│ │ 👥 Shared with me                                                         ││
│ │ 🗑️ Trash                                                                  ││
│ ├──────────────────────────────────────────────────────────────────────────┤│
│ │ NOTEBOOKS ▼                                                               ││
│ │   [New notebook input] [+]                                                ││
│ │   (list of notebooks)                                                     ││
│ ├──────────────────────────────────────────────────────────────────────────┤│
│ │ TAGS ▼                                                                    ││
│ │   [New tag input] [+]                                                     ││
│ │   (list of tags)                                                          ││
│ ├──────────────────────────────────────────────────────────────────────────┤│
│ │ 📥 Import from Evernote                                                   ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│ NOTE LIST (w-80, bg-gray-50, border-r)                                        │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ [Search notes... 🔍 input]                                                ││
│ ├──────────────────────────────────────────────────────────────────────────┤│
│ │ 📌 Hello World                        (pinned note)                       ││
│ │    Preview of content...                                                  ││
│ │    Apr 13, 2026                                                           ││
│ ├──────────────────────────────────────────────────────────────────────────┤│
│ │ Untitled                                                                  ││
│ │    No content                                                             ││
│ │    Apr 14, 2026                                                           ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│ EDITOR (flex-1, min-w-0)                                                      │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ [← Back to notes] (mobile only)                                           ││
│ ├──────────────────────────────────────────────────────────────────────────┤│
│ │ [Note title input — placeholder "Note title"]                             ││
│ ├──────────────────────────────────────────────────────────────────────────┤│
│ │ [Quill toolbar: H1/H2/H3 | B I U ~~  | list | link | img | ...]          ││
│ │                                                                           ││
│ │ [Quill editor content area — ql-editor contenteditable]                  ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Profile Page (`/profile`)

```
┌──────────── min-h-screen bg-gray-100 ─────────────────────────────────────┐
│  [← Back to Notes button]        (bg-evernote-sidebar sidebar strip)        │
│  ┌──────────── max-w-xl mx-auto py-8 px-4 ──────────────────────────────┐  │
│  │ <h1> Profile Settings </h1>                                             │  │
│  │ ┌─── Account Info card (bg-white rounded-lg shadow p-6 mb-6) ────────┐ │  │
│  │ │ <h2> Account Info </h2>                                              │ │  │
│  │ │ Email: nstung@gmail.com                                              │ │  │
│  │ │ [Name input]                                                         │ │  │
│  │ │ [Update Profile button]                                              │ │  │
│  │ └──────────────────────────────────────────────────────────────────────┘ │  │
│  │ ┌─── Change Password card (bg-white rounded-lg shadow p-6) ──────────┐ │  │
│  │ │ <h2> Change Password </h2>                                           │ │  │
│  │ │ [Current Password input]                                             │ │  │
│  │ │ [New Password input]                                                 │ │  │
│  │ │ [Change Password button]                                             │ │  │
│  │ └──────────────────────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Inventory

### 3.1 Button (Primary)

```
bg-evernote-green text-white py-2 px-4 rounded hover:bg-green-600 transition
disabled: opacity-50
full-width variant: w-full
```

### 3.2 Input (Text / Email / Password)

```
w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evernote-green
```

Register/profile also uses `rounded` (not `rounded-lg`).

### 3.3 Sidebar Nav Item

```
px-4 py-2 cursor-pointer hover:bg-evernote-hover text-gray-300
Active: bg-evernote-hover text-evernote-green
```

### 3.4 Note Card (in list)

```
p-4 border-b cursor-pointer hover:bg-gray-100
Selected: bg-white or highlighted
Pin indicator: 📌 prepended to title
Title: font-semibold text-sm
Preview: text-gray-400 text-xs (truncated)
Date: text-xs text-gray-400
```

### 3.5 Sidebar Section Header (NOTEBOOKS, TAGS)

```
px-4 py-2 text-gray-400 text-sm flex justify-between cursor-pointer
[SECTION NAME]  [▼ collapse icon]
```

### 3.6 Sidebar Inline Input (create notebook/tag)

```
flex-1 bg-evernote-dark text-white px-2 py-1 rounded text-sm
+ button: text-evernote-green
```

### 3.7 Plan Badge

```
text-xs px-1.5 py-0.5 rounded bg-gray-600 text-gray-300
Content: "FREE"
```

### 3.8 Rich Text Editor (Quill)

- Theme: `ql-snow`
- Toolbar: headings dropdown (H1/H2/H3/Normal), Bold, Italic, Underline, Strikethrough, lists (ordered/unordered), links, images, blockquote, code block
- Editor div: `ql-editor contenteditable="true"`
- Blank state: `ql-blank` class

### 3.9 Logo / Brand

```
text-xl font-bold text-evernote-green
Content: "Simplanet Note"
```

---

## 4. Responsive / Mobile Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md/768px) | Sidebar hidden; ☰ toggle button (fixed top-left) shows/hides sidebar |
| Mobile | Note list hidden when editor is open; ← Back to notes button returns to list |
| md+ | Sidebar always visible (md:translate-x-0); note list always visible (md:flex) |

Sidebar toggle button:
```
md:hidden fixed top-4 left-4 z-50 bg-evernote-green text-white p-2 rounded-lg shadow-lg
```

Sidebar:
```
-translate-x-full md:translate-x-0 md:relative fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out
```

---

## 5. Tailwind Config (Custom Tokens Required)

The original site uses Tailwind with custom theme extensions:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'evernote-green': '#00a82d',
        'evernote-sidebar': '#1a1a1a',   // ~rgb(26,26,26)
        'evernote-hover':  '#2d2d2d',    // ~rgb(45,45,45)
        'evernote-dark':   '#3d3d3d',    // ~rgb(61,61,61)
      },
    },
  },
}
```

---

## 6. Third-Party Libraries

| Library | Evidence | Notes |
|---------|----------|-------|
| Quill.js | `ql-editor`, `ql-snow`, `ql-toolbar` classes | Rich-text editor |
| Tailwind CSS | Utility classes throughout | All styling |
| Next.js | App Router, API routes at `/api/*` | Framework |
| Supabase | Auth, database (inferred from TODO) | Backend |

---

## 7. Interaction States

| Element | Hover | Focus | Active | Disabled |
|---------|-------|-------|--------|---------|
| Primary button | `bg-green-600` | — | — | `opacity-50` |
| Nav item | `bg-evernote-hover` | — | `bg-evernote-hover text-evernote-green` | — |
| Note card | `bg-gray-100` | — | selected state | — |
| Input | — | `ring-2 ring-evernote-green` | — | — |
| Logo/username | — | — | — | — |
| Sidebar section | `hover:text-evernote-green` | — | — | — |

---

## 8. Empty States

| View | Message |
|------|---------|
| No note selected | "Select a note or create a new one" (right panel) |
| Empty note list | "No notes found" (note list panel) |
| Empty editor content | Quill blank placeholder (no visible text) |
