import { test, expect } from '@playwright/test';

test.describe('Admin Access Control', () => {
  test('should deny access to unauthorized guest users', async ({ page }) => {
    // Navigate directly to the admin route
    await page.goto('/admin');
    
    // The page should render the "Access Denied" view
    // admin.denied -> "Accesso Negato" (IT) or "Access Denied" (EN)
    await expect(page.getByText(/Accesso Negato|Access Denied/i)).toBeVisible();
    
    // Verify that the actual admin tools are NOT rendered
    // e.g., the "Auto Pilot" tab label should not be visible
    await expect(page.getByText(/Pilota Auto|Auto Pilot/i)).not.toBeVisible();
  });

  test('should not show admin button in settings for regular users', async ({ page }) => {
    // Navigate to the settings page
    await page.goto('/settings');
    // Ensure the page is hydrated and content is visible
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
    
    // The admin button is conditionally rendered: {globalIsAdmin && (...)}
    // It should not be present for a default (non-logged in) session
    // We use a regex to match "Admin" label (settings.admin)
    const adminButton = page.getByRole('button', { name: /^Admin$/i });
    await expect(adminButton).not.toBeVisible();
  });
});
