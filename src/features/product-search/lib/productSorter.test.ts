import { describe, it, expect } from 'vitest';
import { calculateRelevance, sortProducts } from './productSorter';
import { Product, SortOption } from '@/entities/product';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  identity: {
    code: '123',
    name: 'Test Product',
    category: 'Test',
    packageInfo: 'Test',
    ...overrides.identity
  },
  pricing: {
    currentPrice: 10.00,
    ...overrides.pricing
  },
  lifecycle: {
    status: 'Attivo',
    ...overrides.lifecycle
  },
  ...overrides
}) as Product;

describe('productSorter', () => {
  describe('calculateRelevance', () => {
    it('should return 0 for empty searches', () => {
      const p = mockProduct();
      expect(calculateRelevance(p, [], [])).toBe(0);
    });

    it('should give higher score to names starting with keyword', () => {
      const p = mockProduct({ identity: { ...mockProduct().identity, name: 'Marlboro Gold' } });
      const score = calculateRelevance(p, ['marl'], []);
      expect(score).toBeGreaterThan(0);
      
      const p2 = mockProduct({ identity: { ...mockProduct().identity, name: 'Gold Marlboro' } });
      const score2 = calculateRelevance(p2, ['marl'], []);
      expect(score).toBeGreaterThan(score2);
    });

    it('should boost score for code matches', () => {
      const p = mockProduct({ identity: { ...mockProduct().identity, code: '1234' } });
      const score = calculateRelevance(p, ['123'], []);
      expect(score).toBeGreaterThan(0);
    });

    it('should boost score for price matches', () => {
      const p = mockProduct({ pricing: { currentPrice: 5.50 } });
      const score = calculateRelevance(p, ['5.50'], []);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('sortProducts', () => {
    it('should sort by name asc', () => {
      const p1 = mockProduct({ identity: { ...mockProduct().identity, name: 'B' } });
      const p2 = mockProduct({ identity: { ...mockProduct().identity, name: 'A' } });
      const products = [p1, p2];
      const sortOption: SortOption = { key: 'name', order: 'asc' };
      
      sortProducts(products, sortOption, { searchKeywords: [], isRetiredSearch: false, emissionFilters: [] });
      
      expect(products[0].identity.name).toBe('A');
      expect(products[1].identity.name).toBe('B');
    });

    it('should sort by price desc', () => {
      const p1 = mockProduct({ pricing: { currentPrice: 5.00 } });
      const p2 = mockProduct({ pricing: { currentPrice: 10.00 } });
      const products = [p1, p2];
      const sortOption: SortOption = { key: 'price', order: 'desc' };
      
      sortProducts(products, sortOption, { searchKeywords: [], isRetiredSearch: false, emissionFilters: [] });
      
      expect(products[0].pricing.currentPrice).toBe(10.00);
      expect(products[1].pricing.currentPrice).toBe(5.00);
    });

    it('should use smart sorting with relevance', () => {
      const p1 = mockProduct({ identity: { ...mockProduct().identity, name: 'Other Item' } });
      const p2 = mockProduct({ identity: { ...mockProduct().identity, name: 'Target Item' } });
      const products = [p1, p2];
      const sortOption: SortOption = { key: 'smart', order: 'asc' };
      
      sortProducts(products, sortOption, { 
        searchKeywords: ['target'], 
        isRetiredSearch: false, 
        emissionFilters: [] 
      });
      
      expect(products[0].identity.name).toBe('Target Item');
    });
  });
});
