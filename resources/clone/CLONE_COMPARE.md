## Visual diff audit

Use Playwright to do a full screenshot comparison between the original site
and our implementation. Run this as a single automated audit.

### Steps

1. For every route in `docs/sitemap.md`, capture two screenshots side by side:
   - Original: load the live URL (use stored auth state if needed)
   - Ours: load the local dev server (`http://localhost:3000`)
   - Save as `docs/diff/original-{page}.png` and `docs/diff/ours-{page}.png`

2. For each page pair, generate a pixel diff image:
   - Use `pixelmatch` or Playwright's built-in `toHaveScreenshot` with a diff output
   - Save diff to `docs/diff/diff-{page}.png` (red = mismatch)
   - Record the mismatch pixel % in `docs/diff/report.md`

3. In `docs/diff/report.md`, output a table:

   | Page | Mismatch % | Top issues observed |
   |------|-----------|---------------------|
   | /home | 12% | font size, shadow missing on card |
   | /pricing | 34% | 3 plans vs 2, wrong default highlight |

   For each row, look at the diff image and describe the visible differences
   in plain English. Do not guess — only report what the diff shows.

4. Sort the table by mismatch % descending (worst first).

### Setup (if not already installed)
```bash
pnpm add -D pixelmatch pngjs
```

### Output
- `docs/diff/` — all screenshots and diff images
- `docs/diff/report.md` — ranked table of pages with mismatch % and notes

Do not fix anything yet. Report only.