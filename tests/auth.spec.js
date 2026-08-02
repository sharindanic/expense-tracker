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
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByLabel('メール')).toBeVisible();
  });

  test('can register a new account', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '新規登録' }).click();
    await expect(page.getByRole('button', { name: '新規登録' })).toBeVisible();

    await page.getByLabel('メール').fill(testEmail);
    await page.getByLabel('パスワード', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: '新規登録' }).click();

    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();
  });

  test('shows error for duplicate email', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '新規登録' }).click();

    await page.getByLabel('メール').fill(testEmail);
    await page.getByLabel('パスワード', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: '新規登録' }).click();

    await expect(page.getByText('メールアドレスは既に使用されています')).toBeVisible();
  });

  test('can login with existing account', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('メール').fill(testEmail);
    await page.getByLabel('パスワード', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('メール').fill(testEmail);
    await page.getByLabel('パスワード', { exact: true }).fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスまたはパスワードが違います')).toBeVisible();
  });

  test('can logout', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('メール').fill(testEmail);
    await page.getByLabel('パスワード', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.getByRole('heading', { name: 'Finance Tracker' })).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByLabel('メール')).toBeVisible();
  });
});
