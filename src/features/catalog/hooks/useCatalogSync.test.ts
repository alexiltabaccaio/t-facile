import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCatalogSync } from './useCatalogSync';
import { useCatalogStore, catalogService } from '@/entities/product';

// Mocking catalogService
vi.mock('@/entities/product', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    catalogService: {
      subscribeToConfig: vi.fn(),
      fetchCatalogInChunks: vi.fn(),
    },
    // We'll use the real store but we might need to mock some parts if needed
    // or just use setState to control it.
  };
});

vi.mock('@/shared/api', () => ({
  testConnection: vi.fn(),
  db: {},
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
    const { actions } = useCatalogStore.getState();
    actions.setProducts([]);
    actions.setLastUpdateDate('');
    actions.setLastSyncId(0);
    actions.setIsInitialLoading(true);
    actions.setSyncError(null);
  });

  it('should trigger full sync when cache is empty', async () => {
    let configCallback: any;
    (catalogService.subscribeToConfig as any).mockImplementation((onUpdate: any) => {
      configCallback = onUpdate;
      return vi.fn(); // unsubscribe
    });

    (catalogService.fetchCatalogInChunks as any).mockResolvedValue([
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

    const state = useCatalogStore.getState();
    expect(state.products).toHaveLength(1);
    expect(state.lastSyncId).toBe(100);
    expect(state.isInitialLoading).toBe(false);
  });

  it('should NOT sync when cache is already updated', async () => {
    // Pre-fill store
    const { actions } = useCatalogStore.getState();
    actions.setProducts([{ identity: { code: '1' } }] as any);
    actions.setLastUpdateDate('2024-05-01');
    actions.setLastSyncId(100);

    let configCallback: any;
    (catalogService.subscribeToConfig as any).mockImplementation((onUpdate: any) => {
      configCallback = onUpdate;
      return vi.fn();
    });

    renderHook(() => useCatalogSync());

    // Simulate config update with SAME data
    await act(async () => {
      configCallback(mockConfig);
    });

    expect(catalogService.fetchCatalogInChunks).not.toHaveReturned();
    
    const state = useCatalogStore.getState();
    expect(state.isInitialLoading).toBe(false);
  });

  it('should handle sync errors gracefully', async () => {
    let configCallback: any;
    (catalogService.subscribeToConfig as any).mockImplementation((onUpdate: any) => {
      configCallback = onUpdate;
      return vi.fn();
    });

    (catalogService.fetchCatalogInChunks as any).mockRejectedValue(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useCatalogSync());

    await act(async () => {
      configCallback(mockConfig);
    });


    await waitFor(() => {
      expect(useCatalogStore.getState().syncError).toBe('Errore di sincronizzazione dati.');
    });

    expect(useCatalogStore.getState().isInitialLoading).toBe(false);
    consoleSpy.mockRestore();
  });

  it('should set isOnline to false when config subscription fails', async () => {
    let errorCallback: any;
    (catalogService.subscribeToConfig as any).mockImplementation((_onUpdate: any, onError: any) => {
      errorCallback = onError;
      return vi.fn();
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useCatalogSync());

    // Simulate Firestore error
    await act(async () => {
      errorCallback(new Error('Permission denied'));
    });

    expect(useCatalogStore.getState().isOnline).toBe(false);
    expect(useCatalogStore.getState().syncError).toBe('Connessione assente o limitata.');
    
    consoleSpy.mockRestore();
  });
});

