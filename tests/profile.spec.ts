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

test.describe("Profile", () => {
  test("/profile returns HTTP 200 when authenticated", async ({ page }) => {
    await signIn(page);
    const res = await page.goto("/profile");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1:has-text('Profile Settings')")).toBeVisible();
  });

  test("profile shows email", async ({ page }) => {
    await signIn(page);
    await page.goto("/profile");
    await expect(page.locator(`text=${EMAIL}`)).toBeVisible();
  });

  test("update name persists", async ({ page }) => {
    await signIn(page);
    await page.goto("/profile");
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill("Tung Updated");
    await page.click("text=Update Profile");
    await expect(page.locator("text=Profile updated.")).toBeVisible({ timeout: 5000 });
    // Reload and verify
    await page.reload();
    await expect(page.locator('input[type="text"]').first()).toHaveValue("Tung Updated");
  });

  test("back button returns to /app", async ({ page }) => {
    await signIn(page);
    await page.goto("/profile");
    await page.click("text=← Back to Notes");
    await expect(page).toHaveURL(/\/app/);
  });
});
