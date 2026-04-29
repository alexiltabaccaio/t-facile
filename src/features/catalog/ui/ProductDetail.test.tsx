import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductDetail from './ProductDetail';
import { Product } from '@/entities/product';

describe('ProductDetail', () => {
  const mockProduct: Product = {
    identity: {
      code: '12345',
      name: 'Marlboro Gold',
      category: 'Sigarette',
      packageInfo: '20 pezzi',
      brand: 'Marlboro',
      manufacturer: 'Philip Morris'
    },
    pricing: {
      currentPrice: 6.00,
      pricePerKg: 300.00,
      conventionalPricePerKg: 310.00,
      fiscalValuePer1000Pieces: 250.00
    },
    lifecycle: {
      status: 'Attivo',
    },
    emissions: {
      tar: 10,
      nicotine: 0.8,
      co: 10
    }
  };

  it('renders base information correctly', () => {
    render(<ProductDetail product={mockProduct} />);
    
    expect(screen.getByText('Marlboro Gold')).toBeDefined();
    expect(screen.getByText('Informazioni Base')).toBeDefined();
    expect(screen.getByText('Prezzo')).toBeDefined();
    expect(screen.getByText(/6,00/)).toBeDefined();
    expect(screen.getByText('Codice')).toBeDefined();
    expect(screen.getByText('12345')).toBeDefined();
    expect(screen.getByText('Tipologia')).toBeDefined();
    expect(screen.getByText('Sigarette')).toBeDefined();
    expect(screen.getByText('Confezione')).toBeDefined();
    expect(screen.getByText('20 pezzi')).toBeDefined();
  });

  it('renders advanced information correctly', () => {
    render(<ProductDetail product={mockProduct} />);
    
    expect(screen.getByText('Informazioni Avanzate')).toBeDefined();
    expect(screen.getByText('Marca')).toBeDefined();
    expect(screen.getByText('Marlboro')).toBeDefined();
    expect(screen.getByText('Produttore')).toBeDefined();
    expect(screen.getByText('Philip Morris')).toBeDefined();
  });

  it('renders emissions information correctly', () => {
    render(<ProductDetail product={mockProduct} />);
    
    expect(screen.getByText('Dati su Emissioni')).toBeDefined();
    expect(screen.getByText('Nicotina (mg)')).toBeDefined();
    expect(screen.getByText('0.8')).toBeDefined();
    expect(screen.getByText('Catrame (mg)')).toBeDefined();
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getByText('Monossido di C. (mg)')).toBeDefined();
  });

  it('shows retired status message', () => {
    const retiredProduct = {
      ...mockProduct,
      lifecycle: { status: 'Radiato' as const, radiationDate: '2023-01-01' }
    };
    render(<ProductDetail product={retiredProduct} />);
    
    expect(screen.getByText('Prodotto non più in commercio')).toBeDefined();
    expect(screen.getByText('Stato')).toBeDefined();
    expect(screen.getByText('Radiato')).toBeDefined();
    expect(screen.getByText('Data Radiazione')).toBeDefined();
  });

  it('shows out of catalog status message', () => {
    const oocProduct = {
      ...mockProduct,
      lifecycle: { status: 'Fuori Catalogo' as const }
    };
    render(<ProductDetail product={oocProduct} />);
    
    expect(screen.getByText('Prodotto Fuori Catalogo')).toBeDefined();
  });
});
