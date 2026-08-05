import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('login page renders in English', async ({ page }) => {
    await page.goto('/en/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('login page renders in Portuguese', async ({ page }) => {
    await page.goto('/pt-BR/login');
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
  });

  test('unauthenticated dashboard redirects to login', async ({ page }) => {
    await page.goto('/en/dashboard');
    await expect(page).toHaveURL(/\/en\/login/);
  });

  test('seed user can sign in and reach dashboard', async ({ page }) => {
    test.skip(process.env.E2E_AUTH !== 'true', 'Set E2E_AUTH=true after db:seed to run auth flow');

    const email = process.env.SEED_USER_EMAIL ?? 'admin@jobhunter.local';
    const password = process.env.SEED_USER_PASSWORD ?? 'ChangeMe123!';

    await page.goto('/en/login', { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: /sign in/i })).toBeEnabled();
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
