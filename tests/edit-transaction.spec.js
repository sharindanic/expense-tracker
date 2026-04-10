import { test, expect } from '@playwright/test';

const testPassword = 'password123';

test.describe('Edit Transaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByPlaceholder('Email').fill(`edit_${Date.now()}@example.com`);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();

    // Add a transaction to edit
    await page.locator('form').getByPlaceholder('Description').fill('Original description');
    await page.locator('form').getByPlaceholder('Amount').fill('100');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Original description')).toBeVisible();
  });

  test('can edit a transaction description', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByPlaceholder('Description').fill('Updated description');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Updated description')).toBeVisible();
    await expect(page.getByText('Original description')).not.toBeVisible();
  });

  test('can edit a transaction amount', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByPlaceholder('Amount').fill('250');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('-$250.00')).toBeVisible();
  });

  test('shows error when saving empty description', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByPlaceholder('Description').fill('');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Description cannot be empty.')).toBeVisible();
  });

  test('shows error when saving invalid amount', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByPlaceholder('Amount').fill('0');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Enter a valid amount.')).toBeVisible();
  });
});
