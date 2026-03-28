import { test, expect } from '@playwright/test';

const testEmail = `auth_${Date.now()}@example.com`;
const testPassword = 'password123';

test.describe.serial('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Sign in').first()).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });

  test('can register a new account', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByText('Create account').first()).toBeVisible();

    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();
  });

  test('shows error for duplicate email', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText('Email already in use')).toBeVisible();
  });

  test('can login with existing account', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('can logout', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });
});
