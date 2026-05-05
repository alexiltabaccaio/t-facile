import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/shared/lib';

interface CatalogSyncState {
  lastUpdateDate: string;
  categoryDates: Record<string, string>;
  lastSyncId: number;
  isOnline: boolean;
  isInitialLoading: boolean;
  syncError: string | null;
  actions: {
    setLastUpdateDate: (date: string) => void;
    setCategoryDates: (dates: Record<string, string>) => void;
    setLastSyncId: (id: number) => void;
    setIsOnline: (online: boolean) => void;
    setIsInitialLoading: (loading: boolean) => void;
    setSyncError: (error: string | null) => void;
  };
}

/**
 * Store for managing catalog synchronization status and metadata.
 * Persists sync identifiers to avoid redundant downloads.
 */
export const useCatalogSyncStore = create<CatalogSyncState>()(
  persist(
    (set) => ({
      lastUpdateDate: '01/04/2026',
      categoryDates: {},
      lastSyncId: 0,
      isOnline: false,
      isInitialLoading: true,
      syncError: null,
      actions: {
        setLastUpdateDate: (lastUpdateDate) => set({ lastUpdateDate }),
        setCategoryDates: (categoryDates) => set({ categoryDates }),
        setLastSyncId: (lastSyncId) => set({ lastSyncId }),
        setIsOnline: (isOnline) => set({ isOnline }),
        setIsInitialLoading: (isInitialLoading) => set({ isInitialLoading }),
        setSyncError: (syncError) => set({ syncError }),
      },
    }),
    {
      name: 'catalog-sync-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        lastUpdateDate: state.lastUpdateDate,
        categoryDates: state.categoryDates,
        lastSyncId: state.lastSyncId,
      }),
    }
  )
);

export const useCatalogSyncActions = () => useCatalogSyncStore((state) => state.actions);
