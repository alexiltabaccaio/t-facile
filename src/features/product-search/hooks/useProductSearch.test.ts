import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProductSearch } from './useProductSearch';
import { Product, SortOption } from '@/entities/product';

const mockProducts: Product[] = [
  {
    identity: { code: '100', name: 'Marlboro Gold', category: 'SIGARETTE', brand: 'Marlboro', packageInfo: '20pz' },
    pricing: { currentPrice: 6.00 },
    lifecycle: { status: 'Attivo' },
  },
  {
    identity: { code: '200', name: 'Camel Blue', category: 'SIGARETTE', brand: 'Camel', packageInfo: '20pz' },
    pricing: { currentPrice: 5.50 },
    lifecycle: { status: 'Attivo' },
  }
] as Product[];

const defaultSort: SortOption = { key: 'smart', order: 'desc' };

describe('useProductSearch', () => {
  it('should return all products when search is empty', () => {
    const { result } = renderHook(() => useProductSearch({
      products: mockProducts,
      searchTerm: '',
      sortOption: defaultSort,
      showRetired: false,
      showOutOfCatalog: false
    }));

    expect(result.current.displayedProducts).toHaveLength(2);
  });

  it('should filter products by search term', () => {
    const { result } = renderHook(() => useProductSearch({
      products: mockProducts,
      searchTerm: 'marlboro',
      sortOption: defaultSort,
      showRetired: false,
      showOutOfCatalog: false
    }));

    expect(result.current.displayedProducts).toHaveLength(1);
    expect(result.current.displayedProducts[0].identity.name).toBe('MARLBORO GOLD');
  });

  it('should move exact code match to the top', () => {
    const { result } = renderHook(() => useProductSearch({
      products: mockProducts,
      searchTerm: '200',
      sortOption: defaultSort,
      showRetired: false,
      showOutOfCatalog: false
    }));

    expect(result.current.displayedProducts[0].identity.code).toBe('200');
  });

  it('should handle retired products search', () => {
    const productsWithRetired = [
      ...mockProducts,
      {
        identity: { code: '300', name: 'Retired Item', category: 'SIGARETTE', packageInfo: 'Test' },
        lifecycle: { status: 'Radiato' },
        pricing: { currentPrice: 0 }
      }
    ] as Product[];

    const { result } = renderHook(() => useProductSearch({
      products: productsWithRetired,
      searchTerm: 'radiato',
      sortOption: defaultSort,
      showRetired: false,
      showOutOfCatalog: false
    }));

    expect(result.current.displayedProducts).toHaveLength(1);
    expect(result.current.displayedProducts[0].identity.name).toBe('RETIRED ITEM');
  });
});
