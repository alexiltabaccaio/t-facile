import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductItem from './ProductItem';
import { Product } from '../model/types';

describe('ProductItem', () => {
  const mockProduct: Product = {
    identity: {
      code: '12345',
      name: 'Marlboro Gold',
      category: 'Sigarette',
      packageInfo: '20 pezzi',
    },
    pricing: {
      currentPrice: 6.00,
    },
    lifecycle: {
      status: 'Attivo',
    },
  };

  const defaultProps = {
    product: mockProduct,
    onClick: vi.fn(),
    searchKeywords: [],
    sortKey: 'smart' as any,
  };

  it('renders product information correctly', () => {
    render(<ProductItem {...defaultProps} />);
    
    expect(screen.getByText('Marlboro Gold')).toBeDefined();
    expect(screen.getByText('Sigarette')).toBeDefined();
    expect(screen.getByText('da 20 pezzi')).toBeDefined();
    expect(screen.getByText(/6,00/)).toBeDefined();
    expect(screen.getByText('12345')).toBeDefined();
  });

  it('shows RADIATO badge when status is Radiato', () => {
    const retiredProduct = {
      ...mockProduct,
      lifecycle: { status: 'Radiato' as const }
    };
    render(<ProductItem {...defaultProps} product={retiredProduct} />);
    
    expect(screen.getByText('RADIATO')).toBeDefined();
  });

  it('shows FUORI CATALOGO badge when status is Fuori Catalogo', () => {
    const oocProduct = {
      ...mockProduct,
      lifecycle: { status: 'Fuori Catalogo' as const }
    };
    render(<ProductItem {...defaultProps} product={oocProduct} />);
    
    expect(screen.getByText('FUORI CATALOGO')).toBeDefined();
  });

  it('highlights search keywords', () => {
    render(<ProductItem {...defaultProps} searchKeywords={['Gold']} />);
    
    const highlight = screen.getByText('Gold');
    expect(highlight.tagName).toBe('MARK');
    expect(highlight).toHaveClass('text-blue-600');
  });

  it('shows emissions when sortKey is nicotine', () => {
    const productWithEmissions = {
        ...mockProduct,
        emissions: { tar: 10, nicotine: 0.8, co: 10 }
    };
    render(<ProductItem {...defaultProps} product={productWithEmissions} sortKey="nicotine" />);
    
    expect(screen.getByText(/NIC/)).toBeDefined();
    expect(screen.getByText('0.8')).toBeDefined();
  });

  it('handles regex special characters in search keywords safely', () => {
    render(<ProductItem {...defaultProps} searchKeywords={['(', '*', '+', '[']} />);
    
    // Should render without crashing
    expect(screen.getByText('Marlboro Gold')).toBeDefined();
  });

  it('handles zero price correctly', () => {
    const zeroPriceProduct = {
      ...mockProduct,
      pricing: { currentPrice: 0 }
    };
    render(<ProductItem {...defaultProps} product={zeroPriceProduct} />);
    
    expect(screen.getByText(/0,00/)).toBeDefined();
  });

  it('handles very long names without crashing', () => {
    const longNameProduct = {
      ...mockProduct,
      identity: { ...mockProduct.identity, name: 'A'.repeat(500) }
    };
    render(<ProductItem {...defaultProps} product={longNameProduct} />);
    
    expect(screen.getByText('A'.repeat(500))).toBeDefined();
  });
});
