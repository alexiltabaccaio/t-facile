import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductList from './ProductList';
import { Product } from '@/entities/product';

// Mock AutoSizer to render children immediately with fixed dimensions
vi.mock('react-virtualized-auto-sizer', () => ({
  AutoSizer: ({ renderProp }: any) => renderProp({ height: 800, width: 400 }),
}));

describe('ProductList', () => {
  const mockProducts: Product[] = [
    {
      identity: {
        code: '1',
        name: 'Product 1',
        category: 'Cat 1',
        packageInfo: 'Pkg 1',
      },
      pricing: { currentPrice: 5.00 },
      lifecycle: { status: 'Attivo' },
    },
    {
      identity: {
        code: '2',
        name: 'Product 2',
        category: 'Cat 2',
        packageInfo: 'Pkg 2',
      },
      pricing: { currentPrice: 6.00 },
      lifecycle: { status: 'Attivo' },
    }
  ];

  const defaultProps = {
    products: mockProducts,
    onProductClick: vi.fn(),
    searchKeywords: [],
    sortOption: { key: 'smart' as any, order: 'desc' as const },
  };

  it('renders a list of products', () => {
    render(<ProductList {...defaultProps} />);
    
    expect(screen.getByText('Product 1')).toBeDefined();
    expect(screen.getByText('Product 2')).toBeDefined();
  });

  it('renders NoResults when product list is empty', () => {
    render(<ProductList {...defaultProps} products={[]} />);
    
    expect(screen.getByText('Nessun prodotto trovato')).toBeDefined();
    expect(screen.getByText(/Prova a modificare i termini di ricerca/)).toBeDefined();
  });

  it('calls onProductClick when a product is clicked', () => {
    const onProductClick = vi.fn();
    const { getByText } = render(<ProductList {...defaultProps} onProductClick={onProductClick} />);
    
    const productItem = getByText('Product 1');
    productItem.click();
    
    expect(onProductClick).toHaveBeenCalledWith(mockProducts[0]);
  });
});
