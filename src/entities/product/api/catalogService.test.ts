import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catalogService } from './catalogService';
import { getDoc, onSnapshot } from 'firebase/firestore';

// Mock di Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: any, _collection: string, id: string) => ({ id })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
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
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
       (getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => ({ data: 'invalid-json' })
      });

      const products = await catalogService.fetchCatalogInChunks(1);
      expect(products).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('subscribeToConfig', () => {
    it('should attach onSnapshot listener and handle updates', () => {
      const onUpdate = vi.fn();
      const onError = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      (onSnapshot as any).mockReturnValue(mockUnsubscribe);

      const unsubscribe = catalogService.subscribeToConfig(onUpdate, onError);

      expect(onSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);

      // Simulate a snapshot update
      const snapshotCallback = (onSnapshot as any).mock.calls[0][1];
      const mockData = {
        lastUpdateDate: '2024-05-01',
        syncId: 123,
        totalChunks: 5,
        categoryDates: { 'Cat': 'Date' }
      };

      snapshotCallback({
        exists: () => true,
        data: () => mockData
      });

      expect(onUpdate).toHaveBeenCalledWith({
        lastUpdateDate: '2024-05-01',
        syncId: 123,
        totalChunks: 5,
        categoryDates: { 'Cat': 'Date' }
      });
    });

    it('should handle Firestore errors', () => {
      const onUpdate = vi.fn();
      const onError = vi.fn();
      
      catalogService.subscribeToConfig(onUpdate, onError);

      const errorCallback = (onSnapshot as any).mock.calls[0][2];
      const mockError = new Error('Firestore Error');
      
      errorCallback(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });
});

