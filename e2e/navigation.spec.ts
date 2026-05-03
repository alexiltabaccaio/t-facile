import { test, expect } from '@playwright/test';

test.describe('Navigation - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/catalog/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
  });

  test('should navigate between pages', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // 1. Navigate to Notifications (Aggiornamenti / Updates)
    await sidebar.getByRole('button', { name: /Aggiornamenti|Updates/i }).click();
    await expect(page).toHaveURL(/\/notifications/);
    
    // 2. Navigate to Settings (Impostazioni / Settings)
    await sidebar.getByRole('button', { name: /Impostazioni|Settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);

    // 3. Navigate back to Catalog (Catalogo / Catalog)
    await sidebar.getByRole('button', { name: /Catalogo|Catalog/i }).click();
    await expect(page).toHaveURL(/\/catalog/);
  });
});

test.describe('Navigation - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/catalog/);
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
  });

  test('should navigate between pages', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 1. Navigate to Notifications (Notifiche / Notifications)
    const bellButton = header.locator('button[title="Notifiche"], button[title="Notifications"]');
    await expect(bellButton).toBeVisible();
    await bellButton.click();
    await expect(page).toHaveURL(/\/notifications/);

    // 2. Go back (Indietro / Back)
    const backButton = header.locator('button[aria-label="Indietro"], button[aria-label="Back"]');
    await expect(backButton).toBeVisible();
    await backButton.click();
    await expect(page).toHaveURL(/\/catalog/);

    // 3. Navigate to Settings (Impostazioni / Settings)
    const settingsButton = header.locator('button[aria-label="Impostazioni"], button[aria-label="Settings"]');
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
