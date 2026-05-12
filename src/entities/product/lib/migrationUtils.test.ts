import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migratePackageData } from './migrationUtils';
import { productRepository } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  productRepository: {
    getGlobalConfig: vi.fn(),
    fetchCatalogChunk: vi.fn(),
    executeBatch: vi.fn()
  }
}));

describe('migrationUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('migratePackageData', () => {
    it('should migrate data correctly', async () => {
      vi.mocked(productRepository.getGlobalConfig).mockResolvedValue({ totalChunks: 1 } as any);
      vi.mocked(productRepository.fetchCatalogChunk).mockResolvedValue(JSON.stringify([
        {
          identity: { code: '1', packageInfo: 'Astuccio 20 pz' }
        }
      ]));
      
      vi.mocked(productRepository.executeBatch).mockImplementation(async (callback) => {
        const batch = {
          update: vi.fn()
        };
        await callback(batch as any);
      });

      const result = await migratePackageData();
      
      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
    });

    it('should return error if config is missing', async () => {
      vi.mocked(productRepository.getGlobalConfig).mockResolvedValue(null);
      const result = await migratePackageData();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Config not found');
    });
  });
});
