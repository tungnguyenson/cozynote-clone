import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('https://note.cozyroad.com/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'nstung@gmail.com');
  await page.fill('input[type="password"]', '5TlHi&G^v$');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click first note
  const firstNote = await page.$('.p-4.border-b.cursor-pointer');
  if (firstNote) {
    await firstNote.click();
    await page.waitForTimeout(2000);
  }

  const full = await page.evaluate(() => document.body.innerHTML);
  console.log(full.substring(0, 15000));

  await browser.close();
}
main().catch(console.error);
