import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Gnosis Launchpad/);
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('button', { name: 'Connect' }).click();

  // Expects page to have a heading with the name of Select Wallet
  await expect(page.getByRole('heading', { name: 'Select Wallet' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Mock Connector' })).toBeVisible();

  await page.getByRole('button', { name: 'Mock Connector' }).click();

  await expect(page.getByRole('heading', { name: 'Select Wallet' })).toBeHidden();

  await expect(page.getByText('Your validators')).toBeVisible();
});

test.beforeEach(async ({ page }) => {
  page.on('console', msg => {
    console.log(`BROWSER ${msg.type()}: ${msg.text()}`);
  });
  page.on('request', request => {
    console.log(`➡️ REQUEST ${request.method()} ${request.url()}`);
    if (request.postData())  console.log(`   payload: ${request.postData()}`);
  });
  page.on('response', response => {
    console.log(`⬅️ RESPONSE ${response.status()} ${response.url()}`);
  });
});

test.describe('Depost', () => {
  test('should allow me to deposit', async ({ page }) => {

    await page.getByRole('button', { name: 'Add new' }).click();

    await expect(page.getByRole('heading', { name: 'Deposit' })).toBeVisible();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, "./", "deposit_data-1752613063.json");

    if (fs.existsSync(filePath)) {
      console.log("File exists");
    } else {
      console.log("File does not exist");
      throw new Error("File not found");
    }

    const input = page.getByRole('button', { name: 'Choose file' })
    const button = page.getByRole('button', { name: /^(?:Approve \d+ GNO|Deposit)$/i });
    await input.setInputFiles(filePath);
    await expect(page.getByText('deposit_data-1752613063.json')).toBeVisible();

    await expect(button).toHaveText('Approve 1 GNO');

    await button.click();

    await expect(button).toHaveText('Deposit');

    await button.click();
  });
});
