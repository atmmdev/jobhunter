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
});
