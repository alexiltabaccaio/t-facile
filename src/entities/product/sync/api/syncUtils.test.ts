import { describe, it, expect } from 'vitest';
import { normalizeCategory, mapParsedProductToFirestore, detectProductVariations } from './syncUtils';
import { ParsedProduct } from '../api/pdfAnalyzer';
import { Product } from '../../index';

describe('syncUtils', () => {
  describe('normalizeCategory', () => {
    it('should return default for undefined/empty', () => {
      expect(normalizeCategory(undefined)).toBe('Altri Tabacchi');
      expect(normalizeCategory('')).toBe('Altri Tabacchi');
    });

    it('should normalize known categories', () => {
      expect(normalizeCategory('SIGARETTE ESTERE')).toBe('Sigarette');
      expect(normalizeCategory('TRINCIATI PER PIPE')).toBe('Trinciati');
      expect(normalizeCategory('SIGARI DI TUTTI I GENERI')).toBe('Sigari');
      expect(normalizeCategory('SIGARETTI')).toBe('Sigaretti');
    });

    it('should handle specialized inhalation products', () => {
      expect(normalizeCategory('PRODOTTI LIQUIDI DA INALAZIONE')).toBe('Prodotti da inalazione senza combustione');
      expect(normalizeCategory('TABACCO DA INALAZIONE SENZA COMBUSTIONE')).toBe('Prodotti da inalazione senza combustione');
    });

    it('should handle snuff/chewing tobacco', () => {
      expect(normalizeCategory('TABACCO DA FIUTO')).toBe('Fiuto e Mastico');
      expect(normalizeCategory('TABACCO DA MASTICO')).toBe('Fiuto e Mastico');
    });
  });

  describe('mapParsedProductToFirestore', () => {
    it('should map a standard product', () => {
      const parsed: ParsedProduct = {
        code: '123',
        name: 'Test',
        category: 'Sigarette',
        price: 5.00,
        packageInfo: '20pz'
      };
      const result = mapParsedProductToFirestore(parsed, true);
      expect(result.identity.code).toBe('123');
      expect(result.pricing.currentPrice).toBe(5.00);
      expect(result.lifecycle.status).toBe('Attivo');
    });

    it('should handle emission-only products for new documents', () => {
      const parsed: ParsedProduct = {
        code: '123',
        name: 'Test',
        tar: 10,
        nicotine: 0.8
      };
      const result = mapParsedProductToFirestore(parsed, true);
      expect(result.lifecycle.status).toBe('Fuori Catalogo');
      expect(result.emissions.tar).toBe(10);
    });
  });

  describe('detectProductVariations', () => {
    it('should identify new products', () => {
      const parsed: ParsedProduct = { code: '123', name: 'New Item', price: 6.00 };
      const result = detectProductVariations(parsed, undefined);
      expect(result.type).toBe('new');
      expect(result.variations[0]).toContain('NUOVO');
    });

    it('should detect price changes', () => {
      const parsed: ParsedProduct = { code: '123', name: 'Item', price: 6.00 };
      const existing = { 
        pricing: { currentPrice: 5.80 }, 
        identity: { name: 'Item' },
        lifecycle: { status: 'Attivo' }
      } as Product;
      
      const result = detectProductVariations(parsed, existing);
      expect(result.type).toBe('update');
      expect(result.variations[0]).toContain('€5.80 → €6.00');
    });

    it('should detect status changes', () => {
      const parsed: ParsedProduct = { code: '123', name: 'Item', status: 'Radiato' };
      const existing = { 
        pricing: { currentPrice: 5.80 }, 
        identity: { name: 'Item' },
        lifecycle: { status: 'Attivo' }
      } as Product;
      
      const result = detectProductVariations(parsed, existing);
      expect(result.type).toBe('update');
      expect(result.variations[0]).toContain('Stato Attivo → Radiato');
    });

    it('should detect emission changes', () => {
      const parsed: ParsedProduct = { code: '123', name: 'Item', nicotine: 0.6 };
      const existing = { 
        pricing: { currentPrice: 5.80 }, 
        identity: { name: 'Item' },
        lifecycle: { status: 'Attivo' },
        emissions: { nicotine: 0.5, tar: 10, co: 10 }
      } as Product;
      
      const result = detectProductVariations(parsed, existing);
      expect(result.type).toBe('update');
      expect(result.variations[0]).toContain('NIC: 0.5 → 0.6');
    });

    it('should return none when no changes', () => {
      const parsed: ParsedProduct = { code: '123', name: 'Item', price: 5.80 };
      const existing = { 
        pricing: { currentPrice: 5.80 }, 
        identity: { name: 'Item' },
        lifecycle: { status: 'Attivo' }
      } as Product;
      
      const result = detectProductVariations(parsed, existing);
      expect(result.type).toBe('none');
      expect(result.variations).toHaveLength(0);
    });
  });
});
