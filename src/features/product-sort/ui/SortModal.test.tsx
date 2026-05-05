import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SortModal from './SortModal';
import { useCatalogFilterStore, useCatalogFilterActions } from '@/entities/product';

// Mock dello store
vi.mock('@/entities/product', () => ({
  useCatalogFilterStore: vi.fn(),
  useCatalogFilterActions: vi.fn(),
}));

describe('SortModal', () => {
  const mockSetSortOption = vi.fn();
  const mockSetShowRetired = vi.fn();
  const mockSetShowOutOfCatalog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCatalogFilterStore as any).mockReturnValue({
      sortOption: { key: 'smart', order: 'desc' },
      showRetired: false,
      showOutOfCatalog: false,
    });
    (useCatalogFilterActions as any).mockReturnValue({
      setSortOption: mockSetSortOption,
      setShowRetired: mockSetShowRetired,
      setShowOutOfCatalog: mockSetShowOutOfCatalog,
    });
  });

  it('renders correctly with default options', () => {
    render(<SortModal onClose={vi.fn()} />);
    
    expect(screen.getByText('Filtra e Ordina')).toBeDefined();
    expect(screen.getByText('Mostra prodotti radiati')).toBeDefined();
    expect(screen.getByText('Rilevanza')).toBeDefined();
  });

  it('calls setShowRetired when retired toggle is clicked', () => {
    render(<SortModal onClose={vi.fn()} />);
    
    const retiredToggle = screen.getByLabelText('Mostra prodotti radiati');
    fireEvent.click(retiredToggle);
    
    expect(mockSetShowRetired).toHaveBeenCalledWith(true);
  });

  it('calls setSortOption when a sort key is clicked', () => {
    render(<SortModal onClose={vi.fn()} />);
    
    const nameSortButton = screen.getByText('Nome');
    fireEvent.click(nameSortButton);
    
    expect(mockSetSortOption).toHaveBeenCalledWith({
      key: 'name',
      order: 'asc'
    });
  });

  it('calls setSortOption with toggled order when order button is clicked', () => {
     (useCatalogFilterStore as any).mockReturnValue({
      sortOption: { key: 'name', order: 'asc' },
      showRetired: false,
      showOutOfCatalog: false,
    });

    render(<SortModal onClose={vi.fn()} />);
    
    const orderButton = screen.getByText('Crescente');
    fireEvent.click(orderButton);
    
    expect(mockSetSortOption).toHaveBeenCalledWith({
      key: 'name',
      order: 'desc'
    });
  });
});
