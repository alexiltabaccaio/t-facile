import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from './Header';
import { useNotificationStore } from '@/entities/notification';
import { useCatalogStore } from '@/entities/product';
import { useADMSyncStore, useADMSyncActions } from '@/features/admin';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Mock the stores
vi.mock('@/entities/notification/model/useNotificationStore', () => ({
  useNotificationStore: vi.fn(),
  useNotificationActions: vi.fn(() => ({ handleMarkAllAsRead: vi.fn(), handleDeleteAllNotifications: vi.fn() })),
}));
vi.mock('@/entities/product/model/useCatalogStore', () => ({
  useCatalogStore: vi.fn(),
  useCatalogActions: vi.fn(() => ({})),
}));
vi.mock('@/features/admin/store/useADMSyncStore', () => ({
  useADMSyncStore: vi.fn(),
  useADMSyncActions: vi.fn(() => ({ setAiModel: vi.fn() })),
}));
vi.mock('@/features/admin/services/pdfExtractor', () => ({
  extractTextFromPDF: vi.fn(),
}));

// Mock useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Header Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    
    // Default store implementations
    (useNotificationStore as any).mockImplementation((selector: any) => selector ? selector({ hasUnread: false }) : { hasUnread: false });
    (useCatalogStore as any).mockImplementation((selector: any) => selector ? selector({ isOnline: true, lastUpdateDate: '01/01/2026' }) : { isOnline: true, lastUpdateDate: '01/01/2026' });
    (useADMSyncStore as any).mockImplementation((selector: any) => selector ? selector({ aiModel: 'gemini-3-flash-preview' }) : { aiModel: 'gemini-3-flash-preview' });
    (useADMSyncActions as any).mockReturnValue({ setAiModel: vi.fn() });
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

  it('allows changing AI model in admin view', () => {
    const setAiModelMock = vi.fn();
    (useADMSyncActions as any).mockReturnValue({ setAiModel: setAiModelMock });
    (useADMSyncStore as any).mockImplementation((selector: any) => selector ? selector({ aiModel: 'gemini-3-flash-preview' }) : { aiModel: 'gemini-3-flash-preview' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Header />
      </MemoryRouter>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'gemini-3.1-flash-lite-preview' } });

    expect(setAiModelMock).toHaveBeenCalledWith('gemini-3.1-flash-lite-preview');
  });
});

