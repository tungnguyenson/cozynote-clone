import { test, expect, type Page } from "@playwright/test";

const EMAIL = "nstung@gmail.com";
const PASSWORD = "5TlHi&G^v$";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/, { timeout: 15000 });
}

test.describe("Notes", () => {
  test("/app returns HTTP 200 when authenticated", async ({ page }) => {
    await signIn(page);
    const res = await page.goto("/app");
    expect(res?.status()).toBe(200);
  });

  test("app shell renders sidebar and note list", async ({ page }) => {
    await signIn(page);
    await expect(page.locator("text=All Notes")).toBeVisible();
    await expect(page.locator("text=Shared with me")).toBeVisible();
    await expect(page.locator("text=Trash")).toBeVisible();
    await expect(page.locator("text=+ New Note")).toBeVisible();
  });

  test("creating a new note opens editor", async ({ page }) => {
    await signIn(page);
    await page.click("text=+ New Note");
    await expect(page.locator('input[placeholder="Note title"]')).toBeVisible({
      timeout: 8000,
    });
  });

  test("typing a title auto-saves", async ({ page }) => {
    await signIn(page);
    await page.click("text=+ New Note");
    const titleInput = page.locator('input[placeholder="Note title"]');
    await titleInput.fill("E2E Test Note");
    // Wait for debounce + save
    await page.waitForTimeout(2000);
    // Navigate away and back — title should persist in note list
    await page.reload();
    await expect(page.locator("text=E2E Test Note")).toBeVisible({ timeout: 8000 });
  });

  test("search filters note list", async ({ page }) => {
    await signIn(page);
    const searchInput = page.locator('input[placeholder="Search notes…"]');
    await searchInput.fill("E2E Test Note");
    await page.waitForTimeout(600);
    await expect(page.locator("text=E2E Test Note")).toBeVisible();
  });

  test("deleting a note moves it to trash", async ({ page }) => {
    await signIn(page);
    // Select a note
    const noteCard = page.locator(".cursor-pointer").filter({ hasText: "E2E Test Note" }).first();
    await noteCard.click({ timeout: 8000 });
    await expect(page.locator('input[placeholder="Note title"]')).toBeVisible();
    // Click trash button
    await page.click("button[title*='trash'], button:has-text('🗑️')");
    await page.waitForTimeout(500);
    // Note should no longer appear in All Notes
    await expect(page.locator("text=E2E Test Note")).not.toBeVisible({ timeout: 5000 });
    // Appears in Trash
    await page.click("text=Trash");
    await page.waitForTimeout(500);
    await expect(page.locator("text=E2E Test Note")).toBeVisible();
  });

  test("restoring from trash returns note to All Notes", async ({ page }) => {
    await signIn(page);
    await page.click("text=Trash");
    await page.waitForTimeout(500);
    const restoreBtn = page.locator("text=Restore").first();
    await restoreBtn.click({ timeout: 8000 });
    await page.waitForTimeout(500);
    await page.click("text=All Notes");
    await page.waitForTimeout(500);
    await expect(page.locator("text=E2E Test Note")).toBeVisible();
  });
});
