import { describe, it, expect } from 'vitest';
import { filterProducts, checkTextMatch } from './productFilters';
import { Product } from '@/entities/product';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  identity: {
    code: '1234',
    name: 'Marlboro Gold',
    category: 'SIGARETTE',
    brand: 'Marlboro',
    packageInfo: '20pz',
  },
  pricing: {
    currentPrice: 6.00,
    previousPrice: 5.80,
    lastUpdate: '2024-01-01',
  },
  lifecycle: {
    status: 'Attivo',
  },
  emissions: {
    nicotine: 0.5,
    tar: 6,
    co: 7
  },
  ...overrides,
} as Product);

describe('productFilters', () => {
  describe('checkTextMatch', () => {
    it('should match name', () => {
      const p = mockProduct();
      expect(checkTextMatch(p, 'marl')).toBe(true);
      expect(checkTextMatch(p, 'gold')).toBe(true);
      expect(checkTextMatch(p, 'camel')).toBe(false);
    });

    it('should match code', () => {
      const p = mockProduct({ identity: { ...mockProduct().identity, code: '007' } });
      expect(checkTextMatch(p, '007')).toBe(true);
    });

    it('should match category even with synonyms', () => {
      const p = mockProduct({ identity: { ...mockProduct().identity, category: 'SIGARETTE' } });
      expect(checkTextMatch(p, 'sigaretta')).toBe(true); // Assuming SYNONYM_MAP handles this
    });
  });

  describe('filterProducts', () => {
    const products = [
      mockProduct({ identity: { ...mockProduct().identity, name: 'Prod A', code: 'A1' }, lifecycle: { status: 'Attivo' } }),
      mockProduct({ identity: { ...mockProduct().identity, name: 'Prod B', code: 'B1' }, lifecycle: { status: 'Radiato' } }),
      mockProduct({ identity: { ...mockProduct().identity, name: 'Prod C', code: 'C1' }, lifecycle: { status: 'Fuori Catalogo' } }),
    ];

    it('should filter by retired status when isRetiredSearch is true', () => {
      const result = filterProducts(products, {
        isRetiredSearch: true,
        showRetired: false,
        showOutOfCatalog: true,
        emissionFilters: [],
        searchKeywords: []
      });
      expect(result).toHaveLength(1);
      expect(result[0].identity.name).toBe('Prod B');
    });

    it('should respect showRetired and showOutOfCatalog flags', () => {
      const result = filterProducts(products, {
        isRetiredSearch: false,
        showRetired: false,
        showOutOfCatalog: false,
        emissionFilters: [],
        searchKeywords: []
      });
      expect(result).toHaveLength(1);
      expect(result[0].identity.name).toBe('Prod A');

      const resultWithRetired = filterProducts(products, {
        isRetiredSearch: false,
        showRetired: true,
        showOutOfCatalog: false,
        emissionFilters: [],
        searchKeywords: []
      });
      expect(resultWithRetired).toHaveLength(2);
    });

    it('should filter with emission filters', () => {
      const p1 = mockProduct({ emissions: { nicotine: 0.1, tar: 1, co: 1 } });
      const p2 = mockProduct({ emissions: { nicotine: 0.8, tar: 10, co: 10 } });
      
      const productsEm = [p1, p2];
      
      const result = filterProducts(productsEm, {
        isRetiredSearch: false,
        showRetired: true,
        showOutOfCatalog: true,
        emissionFilters: [{ key: 'nicotine', operator: '<', value: 0.5 }],
        searchKeywords: []
      });
      expect(result).toHaveLength(1);
      expect(result[0].emissions?.nicotine).toBe(0.1);
    });

    it('should filter by multiple search keywords', () => {
      const p1 = mockProduct({ identity: { ...mockProduct().identity, name: 'Marlboro Gold' } });
      const p2 = mockProduct({ identity: { ...mockProduct().identity, name: 'Marlboro Red' } });
      
      const result = filterProducts([p1, p2], {
        isRetiredSearch: false,
        showRetired: true,
        showOutOfCatalog: true,
        emissionFilters: [],
        searchKeywords: ['marlboro', 'gold']
      });
      expect(result).toHaveLength(1);
      expect(result[0].identity.name).toBe('Marlboro Gold');
    });

    it('should handle numeric keywords as price startsWith', () => {
      const p1 = mockProduct({ pricing: { ...mockProduct().pricing, currentPrice: 5.80 } });
      const p2 = mockProduct({ pricing: { ...mockProduct().pricing, currentPrice: 6.20 } });
      
      const result = filterProducts([p1, p2], {
        isRetiredSearch: false,
        showRetired: true,
        showOutOfCatalog: true,
        emissionFilters: [],
        searchKeywords: ['5']
      });
      expect(result).toHaveLength(1);
      expect(result[0].pricing.currentPrice).toBe(5.80);
    });

    it('should handle explicit price search with €', () => {
      const p1 = mockProduct({ pricing: { ...mockProduct().pricing, currentPrice: 6.00 } });
      const p2 = mockProduct({ pricing: { ...mockProduct().pricing, currentPrice: 6.20 } });
      
      const result = filterProducts([p1, p2], {
        isRetiredSearch: false,
        showRetired: true,
        showOutOfCatalog: true,
        emissionFilters: [],
        searchKeywords: ['6,20€']
      });
      expect(result).toHaveLength(1);
      expect(result[0].pricing.currentPrice).toBe(6.20);
    });
  });
});
