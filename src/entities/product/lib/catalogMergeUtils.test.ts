import { describe, it, expect } from 'vitest';
import { mergeParsedCatalog } from './catalogMergeUtils';
import { Product } from '../model/types';
import { ParsedPDFResult } from '../sync/api/pdfAnalyzer';

describe('catalogMergeUtils', () => {
  const existingProducts: Product[] = [
    {
      identity: { code: '101', name: 'Camel Blue', category: 'Sigarette', packageInfo: '20' },
      pricing: { currentPrice: 5.00 },
      lifecycle: { status: 'Attivo' }
    },
    {
      identity: { code: '102', name: 'Marlboro Red', category: 'Sigarette', packageInfo: '20' },
      pricing: { currentPrice: 6.00 },
      lifecycle: { status: 'Attivo' }
    },
    {
      identity: { code: '201', name: 'Toscanello', category: 'Sigari', packageInfo: '5' },
      pricing: { currentPrice: 4.50 },
      lifecycle: { status: 'Attivo' }
    }
  ];

  describe('mergeParsedCatalog', () => {
    it('should mark missing products as Fuori Catalogo when isDeltaUpdate is FALSE (Full Update)', () => {
      const parsedData: ParsedPDFResult = {
        updateDate: '2026-05-01',
        products: [
          { code: '101', name: 'Camel Blue', category: 'Sigarette', price: 5.20, status: 'Attivo' }
          // Marlboro Red (102) is missing
        ]
      };

      const result = mergeParsedCatalog(parsedData, existingProducts, false);
      
      const camel = result.mergedProducts.find(p => p.identity.code === '101');
      const marlboro = result.mergedProducts.find(p => p.identity.code === '102');
      const toscanello = result.mergedProducts.find(p => p.identity.code === '201');

      expect(camel?.pricing.currentPrice).toBe(5.20);
      expect(camel?.lifecycle.status).toBe('Attivo');
      
      // CRITICAL: Marlboro should be Fuori Catalogo because it's a Full Update for 'Sigarette'
      expect(marlboro?.lifecycle.status).toBe('Fuori Catalogo');
      
      // Toscanello should stay Attivo because its category was NOT in the PDF
      expect(toscanello?.lifecycle.status).toBe('Attivo');
    });

    it('should KEEP missing products as Attivo when isDeltaUpdate is TRUE (Delta Update)', () => {
      const parsedData: ParsedPDFResult = {
        updateDate: '2026-05-01',
        products: [
          { code: '101', name: 'Camel Blue', category: 'Sigarette', price: 5.20, status: 'Attivo' }
          // Marlboro Red (102) is missing
        ]
      };

      const result = mergeParsedCatalog(parsedData, existingProducts, true);
      
      const camel = result.mergedProducts.find(p => p.identity.code === '101');
      const marlboro = result.mergedProducts.find(p => p.identity.code === '102');

      expect(camel?.pricing.currentPrice).toBe(5.20);
      expect(camel?.lifecycle.status).toBe('Attivo');
      
      // FIX VERIFIED: Marlboro should stay Attivo because it's a Delta Update
      expect(marlboro?.lifecycle.status).toBe('Attivo');
      expect(marlboro?.pricing.currentPrice).toBe(6.00);
    });

    it('should add new products correctly even in Delta Update', () => {
      const parsedData: ParsedPDFResult = {
        updateDate: '2026-05-01',
        products: [
          { code: '999', name: 'New Entry', category: 'Sigarette', price: 10.00, status: 'Attivo' }
        ]
      };

      const result = mergeParsedCatalog(parsedData, existingProducts, true);
      
      const newEntry = result.mergedProducts.find(p => p.identity.code === '999');
      expect(newEntry).toBeDefined();
      expect(newEntry?.pricing.currentPrice).toBe(10.00);
      expect(newEntry?.lifecycle.status).toBe('Attivo');
      
      // Camel should still be there and Attivo
      const camel = result.mergedProducts.find(p => p.identity.code === '101');
      expect(camel?.lifecycle.status).toBe('Attivo');
    });
  });
});
