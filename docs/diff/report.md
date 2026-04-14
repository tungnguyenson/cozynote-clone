# Visual Diff Report

> Generated: 2026-04-14
> Original: https://note.cozyroad.com
> Ours: http://localhost:3000
> Viewport: 1440×900
> Tool: pixelmatch (threshold 0.1)

## Results

| Page | Mismatch % | Top issues observed |
|------|-----------|---------------------|
| `/profile` | 16.73% | Dark left sidebar persists in ours; original uses a full-width dark top bar instead. "Current Password" field present in original, missing in ours (only "New Password" shown). Cards are wider in ours due to the changed layout. |
| `/` (landing) | 11.81% | Above-hero label differs: original shows "Free to start · No credit card required"; ours shows "WORKSPACE". App mockup preview at bottom: original has a note open with visible body content; ours shows an empty note panel. |
| `/app` (all notes) | 1.26% | Content-only delta — different notes in the list (original has "Hello World" with a pinned flag; ours has "E2E Test Note" entries). Sidebar and 3-panel layout are structurally identical. |
| `/app` (trash) | 1.19% | Content-only delta — different items in trash list. Layout identical. |
| `/app` (shared) | 1.11% | Content-only delta — shared notes list differs. Layout identical. |
| `/register` | 1.05% | Card border: original uses a faint light border; ours uses a dark/high-contrast visible border stroke. A floating "N" avatar badge appears in the bottom-left corner of ours but not the original. |
| `/login` | 0.67% | Same dark card border vs faint border difference as /register. "N" avatar badge in bottom-left of ours. Font weight on "Simplanet Note" heading appears slightly heavier in ours. |

## Summary

Two real structural bugs:

1. **`/profile`** — layout is wrong. The original wraps the profile page in a standalone view with a dark top bar and no sidebar. Our implementation keeps the persistent sidebar visible, which shifts the card layout and eats 16% of pixels. Additionally, the "Current Password" field is missing from the Change Password section.

2. **`/` (landing)** — the above-hero microcopy label is wrong ("WORKSPACE" instead of "Free to start · No credit card required"), and the hero app mockup screenshot shows an empty note panel instead of an open note with content.

The `/app` views (~1.1–1.3% each) are data noise — same structure, different note content. The auth form differences (~0.7–1%) are minor: a dark card border instead of a light one, and a stray "N" avatar badge in the bottom-left corner of every auth page.

## Files

Screenshots and diff images are in `docs/diff/`.
Red pixels in diff images indicate mismatches.
