import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/shared/lib';
import { Product } from './types';

interface CatalogDataState {
  products: Product[];
  actions: {
    setProducts: (products: Product[]) => void;
  };
}

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
      name: 'catalog-store',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ products: state.products }),
    }
  )
);

export const useCatalogDataActions = () => useCatalogDataStore((state) => state.actions);
