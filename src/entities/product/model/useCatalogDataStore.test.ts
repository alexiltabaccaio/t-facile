import { describe, it, expect, beforeEach } from 'vitest';
import { useCatalogDataStore } from './useCatalogDataStore';
import { Product } from './types';

describe('useCatalogDataStore', () => {
  beforeEach(() => {
    const { setState } = useCatalogDataStore;
    setState({
      products: [],
    });
  });

  it('should have empty products array initially', () => {
    const state = useCatalogDataStore.getState();
    expect(state.products).toEqual([]);
  });

  it('should set products correctly', () => {
    const mockProducts: Product[] = [
      {
        identity: {
          code: 'P1',
          name: 'Product 1',
          category: 'Cat 1',
          packageInfo: 'Pkg 1',
        },
        pricing: {
          currentPrice: 10,
        },
        lifecycle: {
          status: 'Attivo',
        },
      },
    ];

    useCatalogDataStore.getState().actions.setProducts(mockProducts);
    
    const state = useCatalogDataStore.getState();
    expect(state.products).toEqual(mockProducts);
    expect(state.products).toHaveLength(1);
  });

  it('should overwrite existing products when setProducts is called', () => {
    const initialProducts: Product[] = [
      {
        identity: { code: 'P1', name: 'P1', category: 'C1', packageInfo: '' },
        pricing: { currentPrice: 10 },
        lifecycle: { status: 'Attivo' }
      }
    ];
    useCatalogDataStore.setState({ products: initialProducts });

    const newProducts: Product[] = [
      {
        identity: { code: 'P2', name: 'P2', category: 'C2', packageInfo: '' },
        pricing: { currentPrice: 20 },
        lifecycle: { status: 'Attivo' }
      }
    ];
    
    useCatalogDataStore.getState().actions.setProducts(newProducts);
    
    const state = useCatalogDataStore.getState();
    expect(state.products).toEqual(newProducts);
    expect(state.products[0].identity.code).toBe('P2');
  });
});
