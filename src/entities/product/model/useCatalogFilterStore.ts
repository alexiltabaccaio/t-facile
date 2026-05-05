import { create } from 'zustand';
import { Product, SortOption } from './types';

interface CatalogFilterState {
  searchTerm: string;
  sortOption: SortOption;
  showRetired: boolean;
  showOutOfCatalog: boolean;
  selectedProduct: Product | null;
  listScrollPosition: number;
  actions: {
    setSearchTerm: (term: string) => void;
    setSortOption: (option: SortOption) => void;
    setShowRetired: (show: boolean) => void;
    setShowOutOfCatalog: (show: boolean) => void;
    setSelectedProduct: (product: Product | null) => void;
    setListScrollPosition: (position: number) => void;
  };
}

/**
 * Store for catalog filters and navigation state.
 * Not persisted by default to ensure a clean state on page reload.
 */
export const useCatalogFilterStore = create<CatalogFilterState>((set) => ({
  searchTerm: '',
  sortOption: { key: 'smart', order: 'desc' },
  showRetired: false,
  showOutOfCatalog: false,
  selectedProduct: null,
  listScrollPosition: 0,
  actions: {
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setSortOption: (sortOption) => set({ sortOption }),
    setShowRetired: (showRetired) => set({ showRetired }),
    setShowOutOfCatalog: (showOutOfCatalog) => set({ showOutOfCatalog }),
    setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
    setListScrollPosition: (listScrollPosition) => set({ listScrollPosition }),
  },
}));

export const useCatalogFilterActions = () => useCatalogFilterStore((state) => state.actions);
