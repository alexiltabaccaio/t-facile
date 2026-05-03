import { test, expect } from '@playwright/test';

test.describe('Settings & i18n', () => {
  test.beforeEach(async ({ page }) => {
    // Start at settings page
    await page.goto('/settings');
    // Ensure the page is hydrated
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
  });

  test('should toggle theme between light and dark', async ({ page }) => {
    // 1. Change to Dark Theme
    // Label: settings.theme.dark -> "Scuro" (IT) or "Dark" (EN)
    await page.getByRole('button', { name: /Scuro|Dark/i }).click();
    // Check if the html tag has the 'dark' class
    await expect(page.locator('html')).toHaveClass(/dark/);

    // 2. Change to Light Theme
    // Label: settings.theme.light -> "Chiaro" (IT) or "Light" (EN)
    await page.getByRole('button', { name: /Chiaro|Light/i }).click();
    // Check if the html tag does NOT have the 'dark' class
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should toggle language between Italian and English', async ({ page }) => {
    // 1. Switch to Italian
    await page.getByRole('button', { name: /Italiano|Italian/i }).click();
    // Check for an Italian specific string: settings.theme.title -> "Tema Applicazione"
    await expect(page.getByText('Tema Applicazione')).toBeVisible();

    // 2. Switch to English
    await page.getByRole('button', { name: /Inglese|English/i }).click();
    // Check for the English version: settings.theme.title -> "App Theme"
    await expect(page.getByText('App Theme')).toBeVisible();
  });
});
