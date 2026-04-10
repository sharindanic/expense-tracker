import { test, expect } from '@playwright/test';

const testPassword = 'password123';

test.describe('Budget Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByPlaceholder('Email').fill(`budget_${Date.now()}@example.com`);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();
  });

  test('shows empty state initially', async ({ page }) => {
    await expect(page.getByText('No budgets set. Add one above to start tracking.')).toBeVisible();
  });

  test('can set a budget', async ({ page }) => {
    await page.getByPlaceholder('Budget limit ($)').fill('500');
    await page.getByRole('button', { name: 'Set Budget' }).click();

    await expect(page.getByText('$0.00 / $500.00')).toBeVisible();
  });

  test('budget progress updates when expense is added', async ({ page }) => {
    // Set a food budget
    await page.getByPlaceholder('Budget limit ($)').fill('200');
    await page.getByRole('button', { name: 'Set Budget' }).click();
    await expect(page.getByText('$0.00 / $200.00')).toBeVisible();

    // Add a food expense
    await page.locator('form').getByPlaceholder('Description').fill('Groceries');
    await page.locator('form').getByPlaceholder('Amount').fill('80');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Groceries')).toBeVisible();

    await expect(page.getByText('$80.00 / $200.00')).toBeVisible();
  });

  test('can remove a budget', async ({ page }) => {
    await page.getByPlaceholder('Budget limit ($)').fill('300');
    await page.getByRole('button', { name: 'Set Budget' }).click();
    await expect(page.getByText('$0.00 / $300.00')).toBeVisible();

    await page.getByRole('button', { name: 'remove' }).click();
    await expect(page.getByText('No budgets set. Add one above to start tracking.')).toBeVisible();
  });
});
