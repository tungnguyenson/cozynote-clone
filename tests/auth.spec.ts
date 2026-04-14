import { test, expect } from "@playwright/test";

const EMAIL = "nstung@gmail.com";
const PASSWORD = "5TlHi&G^v$";

test.describe("Auth flows", () => {
  test("/login returns HTTP 200", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.status()).toBe(200);
    await expect(page.locator("text=Sign in to your workspace")).toBeVisible();
  });

  test("/register returns HTTP 200", async ({ page }) => {
    const res = await page.goto("/register");
    expect(res?.status()).toBe(200);
    await expect(page.locator("text=Create your free workspace")).toBeVisible();
  });

  test("unauthenticated /app redirects to /login", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /profile redirects to /login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login with valid credentials redirects to /app", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid")).toBeVisible({ timeout: 8000 });
  });

  test("logout redirects to /login", async ({ page }) => {
    // Sign in first
    await page.goto("/login");
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/, { timeout: 15000 });

    // Logout
    await page.click("text=Logout");
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});
