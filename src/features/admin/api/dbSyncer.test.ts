import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveParsedDataToFirestore } from './dbSyncer';

// Mock Firebase Firestore
const mockSet = vi.fn();
const mockCommit = vi.fn(() => Promise.resolve());
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: any, _coll: string, id: string) => ({ id })),
  collection: vi.fn((_db: any, coll: string) => ({ coll })),
  writeBatch: vi.fn(() => ({
    set: mockSet,
    commit: mockCommit
  })),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

vi.mock('@/shared/api', () => ({
  db: {}
}));

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
      
      // Verify that 2 chunks were created (2000 / 1500 = 2)
      // One for catalog_chunk_0 and one for catalog_chunk_1
      const setCalls = mockSet.mock.calls as any[][];
      
      // Expected calls: 2 chunks + 1 config + 1 history = 4 set calls
      expect(setCalls.length).toBe(4);
      
      // Verifica chunk 0
      const chunk0Call = setCalls.find(call => call[0].id === 'catalog_chunk_0');
      expect(chunk0Call).toBeDefined();
      const chunk0Data = JSON.parse(chunk0Call![1].data);
      expect(chunk0Data.length).toBe(1500);

      // Verifica chunk 1
      const chunk1Call = setCalls.find(call => call[0].id === 'catalog_chunk_1');
      expect(chunk1Call).toBeDefined();
      const chunk1Data = JSON.parse(chunk1Call![1].data);
      expect(chunk1Data.length).toBe(500);

      // Verifica config
      const configCall = setCalls.find(call => call[0].id === 'config');
      expect(configCall).toBeDefined();
      expect(configCall![1].totalChunks).toBe(2);

      expect(mockCommit).toHaveBeenCalledTimes(1);
    });

    it('should handle case with no changes (no history entry)', async () => {
      const mockParsedData: any = {
        updateDate: '01/01/2026',
        products: []
      };

      await saveParsedDataToFirestore(mockParsedData, '01/01/2026', []);
      
      // Only 1 call for config (totalChunks: 0)
      // History is not written if allVariations is empty
      expect(mockSet).toHaveBeenCalledTimes(1);
      const setCalls = mockSet.mock.calls as any[][];
      expect(setCalls[0][0].id).toBe('config');
    });
  });
});

