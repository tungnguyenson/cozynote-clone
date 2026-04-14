# Optimistic Note Store

**Status:** Planned  
**Area:** Note list + Editor

---

## Problem

The current architecture has three UX issues:

1. **Selection lag** — selecting a note triggers `GET /api/notes/:id`, forcing a loading state before the editor renders.
2. **List update lag** — after an edit, `onNoteUpdated()` increments `refreshKey`, causing `NoteListPanel` to refetch the entire list. The updated title and sort order only appear after the round-trip completes.
3. **Edit misattribution race condition** — selecting notes quickly (A → B → C) can cause the editor to display stale data or save content to the wrong note. The current `useEffect` fetch has no abort, so whichever request resolves last wins.

---

## Goals

- Zero API lag on note selection (instant display from in-memory store)
- Edits appear in the note list immediately, with re-sort, without waiting for the server
- Background sync with per-note status indicator
- Safe note switching: edits are always attributed to the correct note, regardless of how fast the user switches

---

## Architecture

### Single Source of Truth: Client Note Store

A `useNoteStore` hook, used by `AppPage`, owns all note data for the current view. Both `NoteListPanel` and `NoteEditorPanel` read from this store via props — neither component fetches independently.

```
AppPage
  └── useNoteStore(view, search)
        ├── notes: NoteWithSync[]     includes content, _syncStatus
        ├── updateNoteOptimistic()    update + re-sort immediately
        ├── markSynced()              called after API succeeds
        ├── markSyncError()           called after API fails
        ├── addNote()                 used on create
        └── removeNote()             used on delete / trash

NoteListPanel   ← receives notes[] from parent, client-side search, no fetch
NoteEditorPanel ← receives note object from parent, no fetch
NoteCard        ← receives _syncStatus, renders indicator
```

---

## Data Model

```typescript
// lib/types.ts — addition
type SyncStatus = 'synced' | 'pending' | 'error';

interface NoteWithSync extends Note {
  _syncStatus: SyncStatus;
}
```

---

## useNoteStore

**File:** `hooks/useNoteStore.ts`

**Responsibilities:**
- Fetch all notes (including `content`) for the current `view` on mount and when `view` changes.
- Sort: pinned notes first, then by `updated_at` descending.
- Expose actions for optimistic mutations.

**Actions:**

| Action | Effect |
|--------|--------|
| `updateNoteOptimistic(id, patch)` | Merges patch, sets `updated_at = now`, `_syncStatus = 'pending'`, re-sorts list |
| `markSynced(id, serverNote)` | Replaces note with server response, `_syncStatus = 'synced'` |
| `markSyncError(id)` | Sets `_syncStatus = 'error'` |
| `addNote(note)` | Prepends note with `_syncStatus = 'synced'` |
| `removeNote(id)` | Removes note from list |

```typescript
function sortNotes(notes: NoteWithSync[]): NoteWithSync[] {
  return [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
```

---

## Edit Flow

```
User types
    ↓
Editor local state updates immediately (no waiting)
    ↓
Debounce fires (1s title / 1.5s content):
    ├─ updateNoteOptimistic(id, patch)
    │     → NoteList re-renders with new title
    │     → List re-sorts (edited note moves to top)
    │     → _syncStatus = 'pending' → NoteCard shows spinner
    │
    └─ Background: PATCH /api/notes/:id
          ├─ OK  → markSynced(id, serverNote) → spinner gone
          └─ ERR → markSyncError(id)          → warning icon shown
```

---

## Note Selection Flow

**Before:** `selectedId` changes → fetch → loading state → render  
**After:** `selectedId` changes → editor receives note object from store → render immediately

```typescript
// NoteEditorPanel — no fetch, sync from prop
useEffect(() => {
  if (!note) { setTitle(''); setContent(''); return; }
  setTitle(note.title);
  setContent(note.content);
  lastSavedTitle.current = note.title;
  lastSavedContent.current = note.content;
}, [note?.id]); // synchronous — note is already in memory
```

---

## Race Condition Prevention

**Scenario:** User selects A, starts typing, then switches to B before the debounce fires.

**Problem with naive approach:** Debounce fires with `noteId` from closure pointing to B (the current selection), saving A's content to B.

**Fix: Capture `noteId` at edit time, not at save time.**

```typescript
// Each change captures which note it belongs to
const handleTitleChange = (newTitle: string) => {
  const targetId = noteId; // captured at this exact moment
  setTitle(newTitle);
  pendingSaveRef.current = { noteId: targetId, title: newTitle };
};

// Debounce save uses the captured id — independent of current selectedId
const flushPendingSave = () => {
  if (!pendingSaveRef.current) return;
  const { noteId: saveForId, ...patch } = pendingSaveRef.current;

  onNoteChanged(saveForId, patch);             // optimistic update for correct note

  api.updateNote(saveForId, patch)
    .then(n => onNoteSynced(saveForId, n))
    .catch(() => onNoteSyncError(saveForId));

  pendingSaveRef.current = null;
};
```

**Result:** No matter how fast the user switches between notes, each edit is always attributed to the note that was active when the user typed.

**On note switch:** The editor immediately reflects the new note (synchronous — data comes from store), so the user never sees stale content from a previous selection.

---

## Search

With all notes already in memory, search becomes a client-side filter — no API call, no debounce for network:

```typescript
const filtered = notes.filter(n =>
  n.title.toLowerCase().includes(query) ||
  n.content_text.toLowerCase().includes(query)
);
```

A 150ms debounce on the input is kept to avoid re-rendering on every keystroke.

---

## Sync Status Indicator (NoteCard)

A small icon in the bottom-right corner of each note card:

| Status | Indicator |
|--------|-----------|
| `synced` | Hidden (no noise in normal flow) |
| `pending` | Subtle gray spinner |
| `error` | Yellow ⚠ icon; clicking retries the save |

---

## AppPage Changes

| Remove | Replace with |
|--------|-------------|
| `refreshKey` state | Store handles re-renders reactively |
| `optimisticTitle` state | Store handles title updates |
| `onNoteUpdated()` callback | `onNoteChanged(id, patch)` + `onNoteSynced` |
| `onTitleChange()` callback | Removed |

`createNote` calls `addNote()` after API returns.  
`handleNoteDeleted` calls `removeNote()`.  
View changes trigger store refetch via `useEffect([view])`.

---

## NoteListPanel Changes

- Receives `notes: NoteWithSync[]` and `loading: boolean` from parent
- Removes internal `notes` state and `fetchNotes` effect
- Removes `refreshKey` and `optimisticTitle` props
- Search filters `notes` client-side

---

## NoteEditorPanel Changes

**Props removed:**
- `onNoteUpdated: () => void`
- `onTitleChange: (id, title) => void`

**Props added:**
- `note: NoteWithSync | null` — full note object from store
- `onNoteChanged: (id: string, patch: Partial<Note>) => void`
- `onNoteSynced: (id: string, serverNote: Note) => void`
- `onNoteSyncError: (id: string) => void`

**Internal changes:**
- Remove `fetch(/api/notes/:id)` and loading state
- Add `pendingSaveRef` for edit attribution
- Debounced save reads from `pendingSaveRef`, not from component state closures

---

## Tradeoffs

### Full content loaded upfront

Notes include `content` (full HTML) in the initial list fetch. This increases the payload for the initial view load.

- Typical note: 5–50 KB HTML
- 100 notes: ~1–5 MB, acceptable for modern connections
- The UX gain (zero-latency selection) outweighs the larger initial payload
- Loading happens once per view change, not on every note selection

If content size becomes a concern in the future, a hybrid approach is possible: load a stub on list fetch, then prefetch content on hover.

### Client-side search scope

Client-side search only searches notes loaded for the current view. It does not search across all views (e.g., searching "all" won't find notes in trash). This matches expected behavior.
