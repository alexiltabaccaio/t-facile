import { describe, it, expect, beforeEach } from 'vitest';
import { useCatalogSyncStore } from './useCatalogSyncStore';

describe('useCatalogSyncStore', () => {
  beforeEach(() => {
    useCatalogSyncStore.setState({
      lastUpdateDate: '01/04/2026',
      categoryDates: {},
      lastSyncId: 0,
      isOnline: false,
      isInitialLoading: true,
      syncError: null,
    });
  });

  it('should update lastUpdateDate', () => {
    useCatalogSyncStore.getState().actions.setLastUpdateDate('05/05/2026');
    expect(useCatalogSyncStore.getState().lastUpdateDate).toBe('05/05/2026');
  });

  it('should update categoryDates', () => {
    const dates = { 'cat-1': '2026-05-01' };
    useCatalogSyncStore.getState().actions.setCategoryDates(dates);
    expect(useCatalogSyncStore.getState().categoryDates).toEqual(dates);
  });

  it('should update sync error', () => {
    useCatalogSyncStore.getState().actions.setSyncError('Network Error');
    expect(useCatalogSyncStore.getState().syncError).toBe('Network Error');
    
    useCatalogSyncStore.getState().actions.setSyncError(null);
    expect(useCatalogSyncStore.getState().syncError).toBeNull();
  });

  it('should update online status', () => {
    useCatalogSyncStore.getState().actions.setIsOnline(true);
    expect(useCatalogSyncStore.getState().isOnline).toBe(true);
  });

  it('should update initial loading status', () => {
    useCatalogSyncStore.getState().actions.setIsInitialLoading(false);
    expect(useCatalogSyncStore.getState().isInitialLoading).toBe(false);
  });

  it('should update lastSyncId', () => {
    useCatalogSyncStore.getState().actions.setLastSyncId(12345);
    expect(useCatalogSyncStore.getState().lastSyncId).toBe(12345);
  });
});
