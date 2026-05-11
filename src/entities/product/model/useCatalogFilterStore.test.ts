import { describe, it, expect, beforeEach } from 'vitest';
import { useCatalogFilterStore } from './useCatalogFilterStore';
import { Product } from './types';

describe('useCatalogFilterStore', () => {
  beforeEach(() => {
    // Reset store to default values manually
    useCatalogFilterStore.setState({
      searchTerm: '',
      sortOption: { key: 'smart', order: 'desc' },
      showRetired: false,
      showOutOfCatalog: false,
      selectedProduct: null,
      listScrollPosition: 0,
    });
  });

  it('should have correct initial state', () => {
    const state = useCatalogFilterStore.getState();
    expect(state.searchTerm).toBe('');
    expect(state.sortOption).toEqual({ key: 'smart', order: 'desc' });
    expect(state.showRetired).toBe(false);
    expect(state.showOutOfCatalog).toBe(false);
  });

  it('should update search term', () => {
    useCatalogFilterStore.getState().actions.setSearchTerm('test query');
    expect(useCatalogFilterStore.getState().searchTerm).toBe('test query');
  });

  it('should update sort option', () => {
    const newSort = { key: 'price' as const, order: 'asc' as const };
    useCatalogFilterStore.getState().actions.setSortOption(newSort);
    expect(useCatalogFilterStore.getState().sortOption).toEqual(newSort);
  });

  it('should toggle showRetired', () => {
    useCatalogFilterStore.getState().actions.setShowRetired(true);
    expect(useCatalogFilterStore.getState().showRetired).toBe(true);
    
    useCatalogFilterStore.getState().actions.setShowRetired(false);
    expect(useCatalogFilterStore.getState().showRetired).toBe(false);
  });

  it('should toggle showOutOfCatalog', () => {
    useCatalogFilterStore.getState().actions.setShowOutOfCatalog(true);
    expect(useCatalogFilterStore.getState().showOutOfCatalog).toBe(true);
  });

  it('should set selected product', () => {
    const mockProduct = { identity: { code: '1' } } as unknown as Product;
    useCatalogFilterStore.getState().actions.setSelectedProduct(mockProduct);
    expect(useCatalogFilterStore.getState().selectedProduct).toEqual(mockProduct);
  });

  it('should update list scroll position', () => {
    useCatalogFilterStore.getState().actions.setListScrollPosition(150);
    expect(useCatalogFilterStore.getState().listScrollPosition).toBe(150);
  });
});
