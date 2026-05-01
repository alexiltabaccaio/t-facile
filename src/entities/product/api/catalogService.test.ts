import { describe, it, expect, vi, beforeEach } from 'vitest';
import { catalogService } from './catalogService';
import * as api from '@/shared/api';

vi.mock('@/shared/api', () => ({
  productRepository: {
    subscribeToConfig: vi.fn(),
    fetchCatalogChunk: vi.fn(),
  },
  db: {}
}));

const mockProductRepository = vi.mocked(api.productRepository);

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

      mockProductRepository.fetchCatalogChunk.mockImplementation((index: number) => {
        if (index === 0) return Promise.resolve(JSON.stringify(mockProductsChunk0));
        if (index === 1) return Promise.resolve(JSON.stringify(mockProductsChunk1));
        return Promise.resolve(null);
      });

      const products = await catalogService.fetchCatalogInChunks(2);

      expect(products).toHaveLength(3);
      expect(products[0].identity.code).toBe('1');
      expect(products[2].identity.code).toBe('3');
      expect(mockProductRepository.fetchCatalogChunk).toHaveBeenCalledTimes(2);
    });

    it('should handle missing chunks gracefully', async () => {
      mockProductRepository.fetchCatalogChunk.mockResolvedValue(null);

      const products = await catalogService.fetchCatalogInChunks(1);
      expect(products).toHaveLength(0);
    });

    it('should handle malformed JSON in chunks', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockProductRepository.fetchCatalogChunk.mockResolvedValue('invalid-json');

      const products = await catalogService.fetchCatalogInChunks(1);
      expect(products).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('subscribeToConfig', () => {
    it('should attach subscription and handle updates', () => {
      const onUpdate = vi.fn();
      const onError = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      mockProductRepository.subscribeToConfig.mockReturnValue(mockUnsubscribe);

      const unsubscribe = catalogService.subscribeToConfig(onUpdate, onError);

      expect(mockProductRepository.subscribeToConfig).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);

      // Simulate an update
      const updateCallback = mockProductRepository.subscribeToConfig.mock.calls[0][0];
      const mockData = {
        lastUpdateDate: '2024-05-01',
        syncId: 123,
        totalChunks: 5,
        categoryDates: { 'Cat': 'Date' }
      };

      updateCallback(mockData);

      expect(onUpdate).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', () => {
      const onUpdate = vi.fn();
      const onError = vi.fn();
      
      catalogService.subscribeToConfig(onUpdate, onError);

      const errorCallback = mockProductRepository.subscribeToConfig.mock.calls[0][1];
      const mockError = new Error('Database Error') as api.DbError;
      
      errorCallback(mockError);
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });
});

