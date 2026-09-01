import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});

test('click a link', async ({ page }) => {
  await page.goto('https://www.yahoo.com/');
  const [page2] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: /check your mail/i }).click(),
  ]);

  await expect(page2).toHaveURL(/https:\/\/mail\.yahoo\.com\//);
  await page2.waitForURL(/https:\/\/mail\.yahoo\.com\//, { timeout: 60000 });
});