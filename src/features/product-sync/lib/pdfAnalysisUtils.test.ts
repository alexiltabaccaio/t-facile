import { describe, it, expect } from 'vitest';
import { extractDateFromFilename, normalizeUpdateDate, mergeSessionProducts } from './pdfAnalysisUtils';
import { ParsedProduct } from '@/entities/product/lib/syncUtils';

describe('pdfAnalysisUtils', () => {
  describe('extractDateFromFilename', () => {
    it('should extract date from standard filename', () => {
      expect(extractDateFromFilename('att_sigarette_200524.pdf')).toBe('2024-05-20');
      expect(extractDateFromFilename('news_tabacchi_151223_v1.pdf')).toBe('2023-12-15');
    });

    it('should return null for _nodata filenames', () => {
      expect(extractDateFromFilename('att_sigari_nodata.pdf')).toBeNull();
    });

    it('should return null if no date pattern found', () => {
      expect(extractDateFromFilename('random_file.pdf')).toBeNull();
    });
  });

  describe('normalizeUpdateDate', () => {
    it('should return valid ISO date', () => {
      expect(normalizeUpdateDate('2024-05-20')).toBe('2024-05-20');
    });

    it('should return empty string for invalid dates', () => {
      expect(normalizeUpdateDate('Non disponibile')).toBe('');
      expect(normalizeUpdateDate('20/05/2024')).toBe('');
      expect(normalizeUpdateDate(null)).toBe('');
    });
  });

  describe('mergeSessionProducts', () => {
    it('should merge products with same code', () => {
      const products: ParsedProduct[] = [
        { code: 'A01', name: 'Product A', price: 5.00 },
        { code: 'A01', tar: 0.5 },
        { code: 'B02', name: 'Product B' }
      ];
      
      const merged = mergeSessionProducts(products);
      expect(merged).toHaveLength(2);
      expect(merged.find(p => p.code === 'A01')).toEqual({
        code: 'A01',
        name: 'Product A',
        price: 5.00,
        tar: 0.5
      });
    });

    it('should keep products without code separate', () => {
      const products: ParsedProduct[] = [
        { code: '', name: 'No Code 1' },
        { code: '', name: 'No Code 2' }
      ];
      
      const merged = mergeSessionProducts(products);
      expect(merged).toHaveLength(2);
    });
  });
});
