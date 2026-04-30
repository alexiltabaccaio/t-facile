import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Product, SortOption } from './types';

// Custom storage object for IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export interface CatalogState {
  searchTerm: string;
  sortOption: SortOption;
  showRetired: boolean;
  showOutOfCatalog: boolean;
  selectedProduct: Product | null;
  listScrollPosition: number;
  lastUpdateDate: string;
  categoryDates: Record<string, string>;
  lastSyncId: number;
  isOnline: boolean;
  isInitialLoading: boolean;
  syncError: string | null;
  products: Product[];

  actions: {
    setSearchTerm: (term: string) => void;
    setSortOption: (option: SortOption) => void;
    setShowRetired: (show: boolean) => void;
    setShowOutOfCatalog: (show: boolean) => void;
    setSelectedProduct: (product: Product | null) => void;
    setListScrollPosition: (position: number) => void;
    setLastUpdateDate: (date: string) => void;
    setCategoryDates: (dates: Record<string, string>) => void;
    setLastSyncId: (id: number) => void;
    setIsOnline: (online: boolean) => void;
    setIsInitialLoading: (loading: boolean) => void;
    setSyncError: (error: string | null) => void;
    setProducts: (products: Product[]) => void;
  };
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      searchTerm: '',
      sortOption: { key: 'smart', order: 'desc' },
      showRetired: false,
      showOutOfCatalog: false,
      selectedProduct: null,
      listScrollPosition: 0,
      lastUpdateDate: '01/04/2026',
      categoryDates: {},
      lastSyncId: 0,
      isOnline: false,
      isInitialLoading: true,
      syncError: null,
      products: [],

      actions: {
        setSearchTerm: (term) => set({ searchTerm: term }),
        setSortOption: (option) => set({ sortOption: option }),
        setShowRetired: (show) => set({ showRetired: show }),
        setShowOutOfCatalog: (show) => set({ showOutOfCatalog: show }),
        setSelectedProduct: (product) => set({ selectedProduct: product }),
        setListScrollPosition: (position) => set({ listScrollPosition: position }),
        setLastUpdateDate: (date) => set({ lastUpdateDate: date }),
        setCategoryDates: (categoryDates) => set({ categoryDates }),
        setLastSyncId: (id) => set({ lastSyncId: id }),
        setIsOnline: (online) => set({ isOnline: online }),
        setIsInitialLoading: (loading) => set({ isInitialLoading: loading }),
        setSyncError: (error) => set({ syncError: error }),
        setProducts: (products) => set({ products }),
      }
    }),
    {
      name: 'catalog-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        products: state.products, 
        lastUpdateDate: state.lastUpdateDate,
        categoryDates: state.categoryDates,
        lastSyncId: state.lastSyncId
      }),
    }
  )
);

export const useCatalogActions = () => useCatalogStore((state) => state.actions);
