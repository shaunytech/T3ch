import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});

test('click a link', async ({ page }) => {
  await page.goto('https://example.com');
  await page.locator('a').first().click();
  await expect(page).toHaveURL(/https:\/\/www\.iana\.org\//);
});