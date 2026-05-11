import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import Header from './Header';
import { useNotificationStore } from '@/entities/notification';
import { useCatalogSyncStore, useCatalogDataStore, useADMSyncStore, useADMSyncActions } from '@/entities/product';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Mock the stores
vi.mock('@/entities/notification', () => ({
  useNotificationStore: vi.fn(),
  useNotificationActions: vi.fn(() => ({ handleMarkAllAsRead: vi.fn(), handleDeleteAllNotifications: vi.fn() })),
}));

vi.mock('@/entities/product', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useCatalogSyncStore: vi.fn(),
    useCatalogSyncActions: vi.fn(() => ({ 
      setLastSyncId: vi.fn(), 
      setLastUpdateDate: vi.fn(), 
      setCategoryDates: vi.fn(), 
      setSyncError: vi.fn() 
    })),
    useCatalogDataStore: vi.fn(),
    useCatalogDataActions: vi.fn(() => ({ setProducts: vi.fn() })),
    useADMSyncStore: vi.fn(),
    useADMSyncActions: vi.fn(() => ({ setAiModel: vi.fn() })),
    catalogService: {
      fetchCatalogInChunks: vi.fn(),
    },
  };
});

// Mock @shared/api
vi.mock('@/shared/api', () => ({
  productRepository: {
    getGlobalConfig: vi.fn(),
  },
}));

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

// Mock useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Header Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    
    // Default store implementations
    (useNotificationStore as unknown as Mock).mockImplementation((selector: (state: unknown) => unknown) => selector ? selector({ hasUnread: false }) : { hasUnread: false });
    (useCatalogSyncStore as unknown as Mock).mockImplementation((selector: (state: unknown) => unknown) => selector ? selector({ isOnline: true, lastUpdateDate: '01/01/2026' }) : { isOnline: true, lastUpdateDate: '01/01/2026' });
    (useCatalogDataStore as unknown as Mock).mockImplementation((selector: (state: unknown) => unknown) => selector ? selector({ products: [] }) : { products: [] });
    (useADMSyncStore as unknown as Mock).mockImplementation((selector: (state: unknown) => unknown) => selector ? selector({ aiModel: 'gemini-3-flash-preview' }) : { aiModel: 'gemini-3-flash-preview' });
    (useADMSyncActions as Mock).mockReturnValue({ setAiModel: vi.fn() });
    
    // Default API mocks
    const { productRepository } = await import('@/shared/api');
    (productRepository.getGlobalConfig as Mock).mockResolvedValue({
      syncId: 'test-sync',
      lastUpdateDate: '01/01/2026',
      totalChunks: 1,
      categoryDates: {}
    });
    const { catalogService } = await import('@/entities/product');
    (catalogService.fetchCatalogInChunks as Mock).mockResolvedValue([{ id: '1' }]);
  });

  it('renders correctly with title T-Facile on catalog view', () => {
    render(
      <MemoryRouter initialEntries={['/catalog']}>
        <Header />
      </MemoryRouter>
    );
    
    expect(screen.getByText('T-Facile')).toBeDefined();
    expect(screen.getByLabelText('Impostazioni')).toBeDefined();
  });

  it('renders back button instead of settings when not on catalog view', () => {
    render(
      <MemoryRouter initialEntries={['/catalog/123']}>
        <Header />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Dettaglio')).toBeDefined();
    expect(screen.getByLabelText('Indietro')).toBeDefined();
  });

  it('triggers manual refresh animation on click', async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/catalog']}>
        <Header />
      </MemoryRouter>
    );

    const refreshButton = screen.getByLabelText('Aggiorna');
    fireEvent.click(refreshButton);

    // Should have animate-spin class
    expect(refreshButton.closest('button')?.className).toContain('animate-spin');

    // After 1s it should stop
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(refreshButton.closest('button')?.className).not.toContain('animate-spin');
    vi.useRealTimers();
  });

  it('handles back navigation correctly with fallback', () => {
    render(
      <MemoryRouter initialEntries={['/catalog/123']}>
        <Header />
      </MemoryRouter>
    );

    const backButton = screen.getByLabelText('Indietro');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/catalog', { replace: true });
  });

});

