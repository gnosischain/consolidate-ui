import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Gnosis Launchpad/);
});

test('get connect wallet', async ({ page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('button', { name: 'Connect' }).click();

  // Expects page to have a heading with the name of Select Wallet
  await expect(page.getByRole('heading', { name: 'Select Wallet' })).toBeVisible();
  
  await expect(page.getByRole('button', { name: 'Mock Connector' })).toBeVisible();
});
