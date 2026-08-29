import { test, expect } from '@playwright/test';

test('playwright docs navigation', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Testing documentation' }).click();
  await page.getByRole('tab', { name: 'yarn' }).first().click();
  await page.getByRole('tab', { name: 'pnpm' }).first().click();
  await page.getByRole('link', { name: 'How to run the example test' }).click();

  // simple assertion to ensure we reached the expected content
  await expect(page).toHaveURL(/.*playwright.dev.*/);
});