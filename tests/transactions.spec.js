import { test, expect } from '@playwright/test';

const testPassword = 'password123';

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Register a fresh user before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByPlaceholder('Email').fill(`txn_${Date.now()}@example.com`);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();
  });

  test('shows empty state initially', async ({ page }) => {
    await expect(page.getByText('No transactions found.')).toBeVisible();
  });

  test('can add an income transaction', async ({ page }) => {
    await page.locator('form').getByPlaceholder('Description').fill('Freelance payment');
    await page.getByPlaceholder('Amount').fill('1500');

    await page.locator('form').getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Income' }).click();

    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByText('Freelance payment')).toBeVisible();
    await expect(page.getByText('+$1500.00')).toBeVisible();
  });

  test('can add an expense transaction', async ({ page }) => {
    await page.locator('form').getByPlaceholder('Description').fill('Grocery run');
    await page.getByPlaceholder('Amount').fill('85');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByText('Grocery run')).toBeVisible();
    await expect(page.getByText('-$85.00')).toBeVisible();
  });

  test('summary updates when transaction is added', async ({ page }) => {
    await page.locator('form').getByPlaceholder('Description').fill('Salary');
    await page.getByPlaceholder('Amount').fill('3000');

    await page.locator('form').getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Income' }).click();

    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByText('$3000.00').first()).toBeVisible();
  });

  test('can delete a transaction', async ({ page }) => {
    await page.locator('form').getByPlaceholder('Description').fill('To be deleted');
    await page.getByPlaceholder('Amount').fill('50');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('To be deleted')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).last().click();

    await expect(page.getByText('To be deleted')).not.toBeVisible();
  });

  test('can filter by type', async ({ page }) => {
    // Add income
    await page.locator('form').getByPlaceholder('Description').fill('My Salary');
    await page.getByPlaceholder('Amount').fill('2000');
    await page.locator('form').getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Income' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('My Salary')).toBeVisible();

    // Add expense
    await page.locator('form').getByPlaceholder('Description').fill('My Rent');
    await page.getByPlaceholder('Amount').fill('800');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('My Rent')).toBeVisible();

    // Filter to income only
    await page.getByTestId('filters').getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Income' }).click();

    await expect(page.getByText('My Salary')).toBeVisible();
    await expect(page.getByText('My Rent')).not.toBeVisible();
  });
});
