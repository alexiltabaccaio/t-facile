import { describe, it, expect } from 'vitest';
import { mapFirestoreDocToProduct } from './productMapper';

describe('productMapper', () => {
  it('should map standard nested firestore data', () => {
    const mockData = {
      identity: {
        code: '123',
        name: 'Test Product',
        category: 'CAT1',
        packageInfo: '20pz'
      },
      pricing: {
        currentPrice: 5.50,
        pricePerKg: 275.00
      },
      lifecycle: {
        status: 'Attivo'
      },
      emissions: {
        nicotine: 0.5,
        tar: 10,
        co: 10
      }
    };
    
    const mockSnapshot = {
      id: 'doc123',
      data: () => mockData
    };

    const product = mapFirestoreDocToProduct(mockSnapshot);
    
    expect(product.identity.code).toBe('123');
    expect(product.identity.name).toBe('Test Product');
    expect(product.pricing.currentPrice).toBe(5.50);
    expect(product.emissions?.nicotine).toBe(0.5);
  });

  it('should map flattened firestore data', () => {
    const mockData = {
      'identity.code': '456',
      'identity.name': 'Flat Product',
      'pricing.currentPrice': 6.00,
      'emissions.nicotine': 0.8
    };
    
    const mockSnapshot = {
      id: 'doc456',
      data: () => mockData
    };

    const product = mapFirestoreDocToProduct(mockSnapshot);
    
    expect(product.identity.code).toBe('456');
    expect(product.identity.name).toBe('Flat Product');
    expect(product.pricing.currentPrice).toBe(6.00);
    expect(product.emissions?.nicotine).toBe(0.8);
  });

  it('should use defaults for missing values', () => {
    const mockSnapshot = {
      id: 'default-id',
      data: () => ({})
    };

    const product = mapFirestoreDocToProduct(mockSnapshot);
    
    expect(product.identity.code).toBe('default-id');
    expect(product.identity.name).toBe('Senza nome');
    expect(product.pricing.currentPrice).toBe(0);
    expect(product.emissions).toBeUndefined();
  });

  it('should parse legacy packageInfo strings', () => {
    const testCases = [
      { info: 'astuccio da 20 pezzi', expected: { type: 'ASTUCCIO', quantity: 20, unit: 'PIECES' } },
      { info: 'da 30 grammi', expected: { type: 'GENERIC', quantity: 30, unit: 'GRAMS' } },
      { info: 'cartoccio da 20 pezzi', expected: { type: 'CARTOCCIO', quantity: 20, unit: 'PIECES' } },
      { info: 'da 1 pezzo', expected: { type: 'GENERIC', quantity: 1, unit: 'PIECES' } },
      { info: 'da 1000 grammi', expected: { type: 'GENERIC', quantity: 1000, unit: 'GRAMS' } },
      { info: 'da 10 ml', expected: { type: 'GENERIC', quantity: 10, unit: 'ML' } },
    ];

    testCases.forEach(({ info, expected }) => {
      const mockData = { identity: { packageInfo: info } };
      const mockSnapshot = { id: 'test', data: () => mockData } as any;
      const product = mapFirestoreDocToProduct(mockSnapshot);
      expect(product.identity.package).toEqual(expected);
    });
  });

  it('should prioritize new structured package field over legacy string', () => {
    const mockData = {
      identity: {
        packageInfo: 'astuccio da 20 pezzi',
        package: { type: 'SCATOLA', quantity: 50, unit: 'GRAMS' }
      }
    };
    const mockSnapshot = { id: 'test', data: () => mockData } as any;
    const product = mapFirestoreDocToProduct(mockSnapshot);
    expect(product.identity.package).toEqual({ type: 'SCATOLA', quantity: 50, unit: 'GRAMS' });
  });
});
