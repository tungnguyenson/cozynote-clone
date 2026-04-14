/**
 * Visual diff audit — compares note.cozyroad.com (original) against localhost:3000 (ours).
 * Produces screenshots + pixel-diff images in docs/diff/ and writes docs/diff/report.md.
 *
 * Run:  npx playwright test tests/visual-diff.spec.ts --project=chromium
 */

import { test, chromium, type Browser, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const ORIGINAL_BASE = "https://note.cozyroad.com";
const OURS_BASE = "http://localhost:3000";
const EMAIL = "nstung@gmail.com";
const PASSWORD = "5TlHi&G^v$";
const DIFF_DIR = path.resolve("docs/diff");
const VIEWPORT = { width: 1440, height: 900 };

interface PageSpec {
  name: string;
  path: string;
  auth: boolean;
  /** Optional sidebar navigation for SPA sub-views */
  spaNav?: string;
}

const PAGE_SPECS: PageSpec[] = [
  { name: "landing", path: "/", auth: false },
  { name: "login", path: "/login", auth: false },
  { name: "register", path: "/register", auth: false },
  { name: "app-all-notes", path: "/app", auth: true },
  { name: "app-shared", path: "/app", auth: true, spaNav: "Shared" },
  { name: "app-trash", path: "/app", auth: true, spaNav: "Trash" },
  { name: "profile", path: "/profile", auth: true },
];

// ─── helpers ────────────────────────────────────────────────────────────────


async function capture(
  context: BrowserContext,
  base: string,
  spec: PageSpec,
  outPath: string
) {
  const page = await context.newPage();
  await page.setViewportSize(VIEWPORT);

  try {
    await page.goto(`${base}${spec.path}`, { waitUntil: "networkidle", timeout: 30000 });

    if (spec.spaNav) {
      // Try to click a sidebar nav item matching the label
      const navItem = page.locator(
        `nav >> text="${spec.spaNav}", aside >> text="${spec.spaNav}"`
      );
      const fallback = page.getByText(spec.spaNav, { exact: false });
      const target = (await navItem.count()) > 0 ? navItem.first() : fallback.first();
      await target.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(600);
    }

    // Dismiss any modals / overlays
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    await page.screenshot({ path: outPath, fullPage: true });
  } finally {
    await page.close();
  }
}

function diff(
  originalPath: string,
  oursPath: string,
  diffPath: string
): number {
  const orig = PNG.sync.read(fs.readFileSync(originalPath));
  const ours = PNG.sync.read(fs.readFileSync(oursPath));

  // Resize ours to match original dimensions if they differ
  const width = orig.width;
  const height = orig.height;

  let oursData = ours.data;
  if (ours.width !== width || ours.height !== height) {
    // Pad or crop ours to match original size
    const normalised = new PNG({ width, height });
    const copyW = Math.min(ours.width, width);
    const copyH = Math.min(ours.height, height);
    for (let y = 0; y < copyH; y++) {
      for (let x = 0; x < copyW; x++) {
        const srcIdx = (y * ours.width + x) * 4;
        const dstIdx = (y * width + x) * 4;
        normalised.data[dstIdx] = ours.data[srcIdx];
        normalised.data[dstIdx + 1] = ours.data[srcIdx + 1];
        normalised.data[dstIdx + 2] = ours.data[srcIdx + 2];
        normalised.data[dstIdx + 3] = ours.data[srcIdx + 3];
      }
    }
    oursData = normalised.data;
  }

  const diffPng = new PNG({ width, height });
  const mismatch = pixelmatch(orig.data, oursData, diffPng.data, width, height, {
    threshold: 0.1,
  });
  fs.writeFileSync(diffPath, PNG.sync.write(diffPng));

  const totalPixels = width * height;
  return Math.round((mismatch / totalPixels) * 10000) / 100;
}

// ─── main test ───────────────────────────────────────────────────────────────

test("visual-diff audit", async () => {
  fs.mkdirSync(DIFF_DIR, { recursive: true });

  const browser: Browser = await chromium.launch();

  // Build two persistent contexts (original + ours), each with auth cookie
  const originalCtx = await browser.newContext({ viewport: VIEWPORT });
  const oursCtx = await browser.newContext({ viewport: VIEWPORT });

  // Log into both sites
  const origLoginPage = await originalCtx.newPage();
  await origLoginPage.setViewportSize(VIEWPORT);
  await origLoginPage.goto(`${ORIGINAL_BASE}/login`, { waitUntil: "networkidle" });
  await origLoginPage.fill('input[type="email"]', EMAIL);
  await origLoginPage.fill('input[type="password"]', PASSWORD);
  await origLoginPage.click('button[type="submit"]');
  await origLoginPage.waitForURL(/\/app/, { timeout: 20000 }).catch(() => {});
  await origLoginPage.close();

  const oursLoginPage = await oursCtx.newPage();
  await oursLoginPage.setViewportSize(VIEWPORT);
  await oursLoginPage.goto(`${OURS_BASE}/login`, { waitUntil: "networkidle" });
  await oursLoginPage.fill('input[type="email"]', EMAIL);
  await oursLoginPage.fill('input[type="password"]', PASSWORD);
  await oursLoginPage.click('button[type="submit"]');
  await oursLoginPage.waitForURL(/\/app/, { timeout: 20000 }).catch(() => {});
  await oursLoginPage.close();

  interface ReportRow {
    page: string;
    mismatch: number;
    notes: string;
  }
  const rows: ReportRow[] = [];

  for (const spec of PAGE_SPECS) {
    const ctx = spec.auth ? { orig: originalCtx, ours: oursCtx } : null;
    const origCtxToUse = ctx ? ctx.orig : await browser.newContext({ viewport: VIEWPORT });
    const oursCtxToUse = ctx ? ctx.ours : await browser.newContext({ viewport: VIEWPORT });

    const origOut = path.join(DIFF_DIR, `original-${spec.name}.png`);
    const oursOut = path.join(DIFF_DIR, `ours-${spec.name}.png`);
    const diffOut = path.join(DIFF_DIR, `diff-${spec.name}.png`);

    console.log(`Capturing: ${spec.name}`);
    await capture(origCtxToUse, ORIGINAL_BASE, spec, origOut);
    await capture(oursCtxToUse, OURS_BASE, spec, oursOut);

    if (!spec.auth) {
      await origCtxToUse.close();
      await oursCtxToUse.close();
    }

    let mismatchPct = 0;
    let notes = "";
    try {
      mismatchPct = diff(origOut, oursOut, diffOut);
      notes = "see diff image";
    } catch (e) {
      notes = `diff failed: ${e}`;
    }

    rows.push({ page: `${spec.path} (${spec.name})`, mismatch: mismatchPct, notes });
    console.log(`  → ${mismatchPct}% mismatch`);
  }

  await originalCtx.close();
  await oursCtx.close();
  await browser.close();

  // Sort descending by mismatch
  rows.sort((a, b) => b.mismatch - a.mismatch);

  // Write report.md
  const tableRows = rows
    .map((r) => `| \`${r.page}\` | ${r.mismatch}% | ${r.notes} |`)
    .join("\n");

  const report = `# Visual Diff Report

> Generated: ${new Date().toISOString().slice(0, 10)}
> Original: ${ORIGINAL_BASE}
> Ours: ${OURS_BASE}
> Viewport: ${VIEWPORT.width}×${VIEWPORT.height}

## Results

| Page | Mismatch % | Top issues observed |
|------|-----------|---------------------|
${tableRows}

## Files

Screenshots and diff images are in \`docs/diff/\`.
Red pixels in diff images indicate mismatches.
`;

  fs.writeFileSync(path.join(DIFF_DIR, "report.md"), report);
  console.log("\nReport written to docs/diff/report.md");
});
