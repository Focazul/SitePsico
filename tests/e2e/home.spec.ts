import { test, expect } from '@playwright/test';

test('homepage loads and has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Psicólogo|Psicologia/i);
  await expect(page.locator('main h1')).toContainText(/Psicologia|Psicólogo|Bem-vindo|escuta/i);
});

test('blog page loads', async ({ page }) => {
  await page.goto('/blog');
  // Check for search input
  await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible();
});
