import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/shared/lib/utils/storage';
import { Product } from './types';

interface CatalogDataState {
  products: Product[];
  actions: {
    setProducts: (products: Product[]) => void;
  };
}

// The cleanup script for 'catalog-data-storage-v2' and 'catalog-store' is kept
// to clean up the temporary stores we created earlier.
const DEPRECATED_STORES = ['catalog-data-storage-v2', 'catalog-store'];
DEPRECATED_STORES.forEach(store => {
  idbStorage.removeItem(store).catch((err: unknown) => console.warn(err));
});

/**
 * Store dedicated to the product catalog data.
 * Persisted in IndexedDB for performance with large datasets.
 */
export const useCatalogDataStore = create<CatalogDataState>()(
  persist(
    (set) => ({
      products: [],
      actions: {
        setProducts: (products) => set({ products }),
      },
    }),
    {
      name: 'catalog-data-storage',
      version: 1, // Incremented version to force cache invalidation
      migrate: (persistedState: any, version: number) => {
        // Se la versione in memoria è la 0 (quella di default prima che aggiungessimo 'version')
        // ignoriamo i vecchi dati corrotti e restituiamo lo stato iniziale vuoto
        if (version === 0) {
          return { products: [] };
        }
        return persistedState as CatalogDataState;
      },
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ products: state.products }),
    }
  )
);

export const useCatalogDataActions = () => useCatalogDataStore((state) => state.actions);
