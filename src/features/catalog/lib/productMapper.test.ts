import { describe, it, expect } from 'vitest';
import { mapFirestoreDocToProduct } from './productMapper';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

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
      data: () => mockData as DocumentData
    } as QueryDocumentSnapshot<DocumentData>;

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
      data: () => mockData as DocumentData
    } as QueryDocumentSnapshot<DocumentData>;

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
    } as QueryDocumentSnapshot<DocumentData>;

    const product = mapFirestoreDocToProduct(mockSnapshot);
    
    expect(product.identity.code).toBe('default-id');
    expect(product.identity.name).toBe('Senza nome');
    expect(product.pricing.currentPrice).toBe(0);
    expect(product.emissions).toBeUndefined();
  });
});
