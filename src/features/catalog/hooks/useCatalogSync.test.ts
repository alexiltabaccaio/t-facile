import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCatalogSync } from './useCatalogSync';
import { useCatalogSyncStore, useCatalogDataStore, catalogService, Product } from '@/entities/product';

// Mocking catalogService
vi.mock('@/entities/product', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    catalogService: {
      subscribeToConfig: vi.fn(),
      fetchCatalogInChunks: vi.fn(),
      fetchPendingScheduledSyncs: vi.fn(() => Promise.resolve([])),
    },
    // We'll use the real store but we might need to mock some parts if needed
    // or just use setState to control it.
  };
});

vi.mock('@/shared/api', () => ({
  testConnection: vi.fn(),
  db: {},
}));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

describe('useCatalogSync', () => {
  const mockConfig = {
    lastUpdateDate: '2024-05-01',
    syncId: 100,
    totalChunks: 2,
    categoryDates: { 'SIGARETTE': '2024-05-01' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset Zustand store state
    const { actions: syncActions } = useCatalogSyncStore.getState();
    const { actions: dataActions } = useCatalogDataStore.getState();
    dataActions.setProducts([]);
    syncActions.setLastUpdateDate('');
    syncActions.setLastSyncId(0);
    syncActions.setIsInitialLoading(true);
    syncActions.setSyncError(null);
  });

  it('should trigger full sync when cache is empty', async () => {
    let configCallback: (config: unknown) => void;
    (catalogService.subscribeToConfig as unknown as Mock).mockImplementation((onUpdate: (config: unknown) => void) => {
      configCallback = onUpdate;
      return vi.fn(); // unsubscribe
    });

    (catalogService.fetchCatalogInChunks as unknown as Mock).mockResolvedValue([
      { identity: { code: '1' }, pricing: { currentPrice: 10 } }
    ]);

    renderHook(() => useCatalogSync());

    // Simulate config update from server
    await act(async () => {
      configCallback(mockConfig);
    });

    await waitFor(() => {
      expect(catalogService.fetchCatalogInChunks).toHaveBeenCalledWith(2);
    });

    expect(useCatalogDataStore.getState().products).toHaveLength(1);
    expect(useCatalogSyncStore.getState().lastSyncId).toBe(100);
    expect(useCatalogSyncStore.getState().isInitialLoading).toBe(false);
  });

  it('should NOT sync when cache is already updated', async () => {
    // Pre-fill store
    useCatalogDataStore.getState().actions.setProducts([{ identity: { code: '1' } }] as unknown as Product[]);
    useCatalogSyncStore.getState().actions.setLastUpdateDate('2024-05-01');
    useCatalogSyncStore.getState().actions.setLastSyncId(100);

    let configCallback: (config: unknown) => void;
    (catalogService.subscribeToConfig as unknown as Mock).mockImplementation((onUpdate: (config: unknown) => void) => {
      configCallback = onUpdate;
      return vi.fn();
    });

    renderHook(() => useCatalogSync());

    // Simulate config update with SAME data
    await act(async () => {
      configCallback(mockConfig);
    });

    expect(catalogService.fetchCatalogInChunks).not.toHaveReturned();
    
    expect(useCatalogSyncStore.getState().isInitialLoading).toBe(false);
  });

  it('should handle sync errors gracefully', async () => {
    let configCallback: (config: unknown) => void;
    (catalogService.subscribeToConfig as unknown as Mock).mockImplementation((onUpdate: (config: unknown) => void) => {
      configCallback = onUpdate;
      return vi.fn();
    });

    (catalogService.fetchCatalogInChunks as unknown as Mock).mockRejectedValue(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useCatalogSync());

    await act(async () => {
      configCallback(mockConfig);
    });


    await waitFor(() => {
      expect(useCatalogSyncStore.getState().syncError).toBe('Errore di sincronizzazione dati.');
    });

    expect(useCatalogSyncStore.getState().isInitialLoading).toBe(false);
    consoleSpy.mockRestore();
  });

  it('should set isOnline to false when config subscription fails', async () => {
    let errorCallback: (error: unknown) => void;
    (catalogService.subscribeToConfig as unknown as Mock).mockImplementation((_onUpdate: unknown, onError: (error: unknown) => void) => {
      errorCallback = onError;
      return vi.fn();
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useCatalogSync());

    // Simulate Firestore error
    await act(async () => {
      errorCallback(new Error('Permission denied'));
    });

    expect(useCatalogSyncStore.getState().isOnline).toBe(false);
    expect(useCatalogSyncStore.getState().syncError).toBe('Connessione assente o limitata.');
    
    consoleSpy.mockRestore();
  });
});

