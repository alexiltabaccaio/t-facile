import { describe, it, expect, beforeEach } from 'vitest';
import { useCatalogStore } from './useCatalogStore';

describe('useCatalogStore', () => {
  beforeEach(() => {
    const { setState } = useCatalogStore;
    // Reset to default state
    setState({
      searchTerm: '',
      sortOption: { key: 'smart', order: 'desc' },
      showRetired: false,
      showOutOfCatalog: false,
      selectedProduct: null,
      products: [],
    });
  });

  it('should update search term', () => {
    const searchTerm = useCatalogStore.getState().searchTerm;
    const { setSearchTerm } = useCatalogStore.getState().actions;
    expect(searchTerm).toBe('');
    
    setSearchTerm('marlboro');
    expect(useCatalogStore.getState().searchTerm).toBe('marlboro');
  });

  it('should update products', () => {
    const mockProducts = [{ identity: { code: '1' } }] as any;
    const { setProducts } = useCatalogStore.getState().actions;
    
    setProducts(mockProducts);
    expect(useCatalogStore.getState().products).toEqual(mockProducts);
  });

  it('should toggle showRetired', () => {
    const { setShowRetired } = useCatalogStore.getState().actions;
    expect(useCatalogStore.getState().showRetired).toBe(false);
    
    setShowRetired(true);
    expect(useCatalogStore.getState().showRetired).toBe(true);
  });

  describe('persistence', () => {
    it('should partialize only specific fields for storage', () => {
      const state = useCatalogStore.getState();
      const persistOptions = (useCatalogStore as any).persist.getOptions();
      
      const partial = persistOptions.partialize(state);
      
      expect(partial).toHaveProperty('products');
      expect(partial).toHaveProperty('lastUpdateDate');
      expect(partial).toHaveProperty('categoryDates');
      expect(partial).toHaveProperty('lastSyncId');
      
      // Should NOT include transient UI state
      expect(partial).not.toHaveProperty('searchTerm');
      expect(partial).not.toHaveProperty('selectedProduct');
      expect(partial).not.toHaveProperty('isInitialLoading');
    });
  });
});
