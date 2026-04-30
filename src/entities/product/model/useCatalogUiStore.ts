import { create } from 'zustand';

interface CatalogUiState {
  showSortModal: boolean;
  actions: {
    setShowSortModal: (show: boolean) => void;
  };
}

export const useCatalogUiStore = create<CatalogUiState>((set) => ({
  showSortModal: false,
  actions: {
    setShowSortModal: (show) => set({ showSortModal: show }),
  },
}));

export const useCatalogUiActions = () => useCatalogUiStore((state) => state.actions);
