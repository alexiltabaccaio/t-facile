import { test, expect } from '@playwright/test';

test.describe('Catalog Happy Path', () => {
  test('should browse and search products using injected data', async ({ page }) => {
    // 1. Setup Mock Data in IndexedDB
    await page.addInitScript(() => {
      const mockData = {
        state: {
          products: [
            {
              identity: {
                code: 'PROD-001',
                name: 'Test Product Alpha',
                category: 'Electronics',
                packageInfo: 'Box 1kg',
                package: { quantity: 1, unit: 'kg', container: 'Box' }
              },
              pricing: { currentPrice: 29.99 },
              lifecycle: { status: 'Attivo' }
            }
          ],
          lastUpdateDate: '01/01/2026',
          categoryDates: {},
          lastSyncId: 123
        },
        version: 0
      };

      const request = indexedDB.open('keyval-store');
      request.onupgradeneeded = () => {
        request.result.createObjectStore('keyval');
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('keyval', 'readwrite');
        const store = transaction.objectStore('keyval');
        store.put(JSON.stringify(mockData), 'catalog-storage');
      };
    });

    // 2. Navigate to the app
    await page.goto('/');

    // 3. Wait for the catalog to load
    const productItem = page.locator('text=Test Product Alpha').first();
    await expect(productItem).toBeVisible({ timeout: 15000 });

    // 4. Test Search functionality
    const searchInput = page.locator('input[name="search-catalog-field"]');
    await expect(searchInput).toBeVisible();
    
    // Test filtering
    await searchInput.fill('Alpha');
    await expect(productItem).toBeVisible();

    await searchInput.fill('NonExistent');
    await expect(page.locator('text=Nessun prodotto trovato')).toBeVisible();

    // 5. Test Detail View navigation
    await searchInput.fill('Alpha');
    await productItem.click();

    // Verify detail view loads
    // Checking for the code and price using first() to handle duplicates in list/detail
    await expect(page.locator('text=PROD-001').first()).toBeVisible();
    await expect(page.locator('text=29,99').first()).toBeVisible();
  });
});
