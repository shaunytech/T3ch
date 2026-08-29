import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://playwright.dev/docs/intro');
  await expect(page).toHaveTitle(/Playwright/);
});

test('click a link', async ({ page }) => {
  await page.goto('https://playwright.dev/docs/intro#installing-playwright');
  await page.getByRole('link', { name: 'How to Install Playwright' }).click();
  await expect(page).toHaveURL('https://playwright.dev/docs/intro#installing-playwright');
});