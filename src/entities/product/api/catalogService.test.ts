import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catalogService } from './catalogService';
import { getDoc } from 'firebase/firestore';

// Mock di Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: any, _collection: string, id: string) => ({ id })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('@/shared/api/firebase/firebase', () => ({
  db: {}
}));

describe('catalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCatalogInChunks', () => {
    it('should fetch and merge products from multiple chunks', async () => {
      const mockProductsChunk0 = [
        { identity: { code: '1', name: 'Product 1' }, pricing: { currentPrice: 10 } },
        { identity: { code: '2', name: 'Product 2' }, pricing: { currentPrice: 20 } }
      ];
      const mockProductsChunk1 = [
        { identity: { code: '3', name: 'Product 3' }, pricing: { currentPrice: 30 } }
      ];

      (getDoc as any).mockImplementation((ref: any) => {
        if (ref.id === 'catalog_chunk_0') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ data: JSON.stringify(mockProductsChunk0) })
          });
        }
        if (ref.id === 'catalog_chunk_1') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({ data: JSON.stringify(mockProductsChunk1) })
          });
        }
        return Promise.resolve({ exists: () => false });
      });

      const products = await catalogService.fetchCatalogInChunks(2);

      expect(products).toHaveLength(3);
      expect(products[0].identity.code).toBe('1');
      expect(products[2].identity.code).toBe('3');
      expect(getDoc).toHaveBeenCalledTimes(2);
    });

    it('should handle missing chunks gracefully', async () => {
      (getDoc as any).mockResolvedValue({
        exists: () => false
      });

      const products = await catalogService.fetchCatalogInChunks(1);
      expect(products).toHaveLength(0);
    });

    it('should handle malformed JSON in chunks', async () => {
       (getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => ({ data: 'invalid-json' })
      });

      const products = await catalogService.fetchCatalogInChunks(1);
      expect(products).toHaveLength(0);
    });
  });
});
