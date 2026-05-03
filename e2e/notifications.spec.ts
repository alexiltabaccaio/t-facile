import { test, expect } from '@playwright/test';

test.describe('Notifications System', () => {
  test.beforeEach(async ({ page }) => {
    // Set a fresh install date to ensure no old real notifications show up during the test
    await page.addInitScript(() => {
      localStorage.setItem('appInstallDate', Date.now().toString());
      localStorage.removeItem('deletedNotificationIds');
      localStorage.removeItem('lastReadUpdateId');
    });
    
    await page.goto('/notifications');
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
  });

  test('should show empty state when no notifications are available', async ({ page }) => {
    // Check for empty state title: notifications.emptyTitle
    // "Nessuna Notifica" (IT) or "No Notifications" (EN)
    await expect(page.getByRole('heading', { name: /Nessuna Notifica|No Notifications/i })).toBeVisible();
    
    // Check for empty state subtitle: notifications.emptySubtitle
    // "Non ci sono aggiornamenti da mostrare" (IT) or "There are no updates to show" (EN)
    await expect(page.getByText(/aggiornamenti|no updates/i)).toBeVisible();
  });

  test('should navigate back to catalog from notifications page', async ({ page }) => {
    // On mobile, use the back button in the header
    await page.setViewportSize({ width: 375, height: 667 });
    
    const backButton = page.locator('header button[aria-label="Indietro"], header button[aria-label="Back"]');
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    await expect(page).toHaveURL(/\/catalog/);
  });
});
