import { create } from 'zustand';
import { Product, SortOption } from './types';

interface CatalogFilterState {
  searchTerm: string;
  sortOption: SortOption;
  showRetired: boolean;
  showOutOfCatalog: boolean;
  selectedProduct: Product | null;
  listScrollPosition: number;
  maxNicotine: number;
  maxTar: number;
  maxCo: number;
  minNicotine: number;
  minTar: number;
  minCo: number;
  showEmissions: boolean;
  actions: {
    setSearchTerm: (term: string) => void;
    setSortOption: (option: SortOption) => void;
    setShowRetired: (show: boolean) => void;
    setShowOutOfCatalog: (show: boolean) => void;
    setSelectedProduct: (product: Product | null) => void;
    setListScrollPosition: (position: number) => void;
    setMaxNicotine: (max: number) => void;
    setMaxTar: (max: number) => void;
    setMaxCo: (max: number) => void;
    setMinNicotine: (min: number) => void;
    setMinTar: (min: number) => void;
    setMinCo: (min: number) => void;
    setShowEmissions: (show: boolean) => void;
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
  maxNicotine: 1.0,
  maxTar: 10,
  maxCo: 10,
  minNicotine: 0.1,
  minTar: 1,
  minCo: 1,
  showEmissions: false,
  actions: {
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setSortOption: (sortOption) => set({ sortOption }),
    setShowRetired: (showRetired) => set({ showRetired }),
    setShowOutOfCatalog: (showOutOfCatalog) => set({ showOutOfCatalog }),
    setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
    setListScrollPosition: (listScrollPosition) => set({ listScrollPosition }),
    setMaxNicotine: (maxNicotine) => set({ maxNicotine }),
    setMaxTar: (maxTar) => set({ maxTar }),
    setMaxCo: (maxCo) => set({ maxCo }),
    setMinNicotine: (minNicotine) => set({ minNicotine }),
    setMinTar: (minTar) => set({ minTar }),
    setMinCo: (minCo) => set({ minCo }),
    setShowEmissions: (showEmissions) => set({ showEmissions }),
  },
}));

export const useCatalogFilterActions = () => useCatalogFilterStore((state) => state.actions);
