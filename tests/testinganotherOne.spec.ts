import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://google.com');
  await expect(page).toHaveTitle(/Google/);
});

test('click and verify', async ({ page }) => {
  await page.goto('https://google.com');
  await page.getByRole('link', { name: 'Images' }).click();
  await expect(page).toHaveURL(/https:\/\/www\.google\.com\/imghp(\?.*)?/);
});