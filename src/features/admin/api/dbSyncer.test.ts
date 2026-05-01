import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveParsedDataToFirestore } from './dbSyncer';
import * as api from '@/shared/api';

vi.mock('@/shared/api', () => ({
  productRepository: {
    saveCatalogSync: vi.fn()
  },
  db: {}
}));

const mockProductRepository = vi.mocked(api.productRepository);

// Mock Zustand store
vi.mock('@/entities/product', () => ({
  useCatalogStore: {
    getState: vi.fn(() => ({ categoryDates: {} }))
  }
}));

describe('dbSyncer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveParsedDataToFirestore', () => {
    it('should split data into chunks correctly', async () => {
      // Create a dataset of 2000 products (CHUNK_SIZE in code is 1500)
      const mockProducts = Array.from({ length: 2000 }, (_, i) => ({
        code: `CODE_${i}`,
        name: `Product ${i}`,
        category: 'Sigari'
      }));

      const mockParsedData: any = {
        updateDate: '10/01/2026',
        products: mockProducts
      };

      const result = await saveParsedDataToFirestore(mockParsedData, '01/01/2026', []);

      expect(result.finalDate).toBe('10/01/2026');
      
      expect(mockProductRepository.saveCatalogSync).toHaveBeenCalledTimes(1);
      const callArgs = (mockProductRepository.saveCatalogSync as any).mock.calls[0][0];
      
      // Chunks
      expect(callArgs.chunks.length).toBe(2);
      const chunk0Data = JSON.parse(callArgs.chunks[0]);
      expect(chunk0Data.length).toBe(1500);
      const chunk1Data = JSON.parse(callArgs.chunks[1]);
      expect(chunk1Data.length).toBe(500);

      // Config
      expect(callArgs.config.totalChunks).toBe(2);
      expect(callArgs.config.lastUpdateDate).toBe('10/01/2026');
    });

    it('should handle case with no changes (no history entry)', async () => {
      const mockParsedData: any = {
        updateDate: '01/01/2026',
        products: []
      };

      await saveParsedDataToFirestore(mockParsedData, '01/01/2026', []);
      
      expect(mockProductRepository.saveCatalogSync).toHaveBeenCalledTimes(1);
      const callArgs = (mockProductRepository.saveCatalogSync as any).mock.calls[0][0];
      expect(callArgs.historyEntry).toBeUndefined();
      expect(callArgs.config.totalChunks).toBe(0);
    });
  });
});
