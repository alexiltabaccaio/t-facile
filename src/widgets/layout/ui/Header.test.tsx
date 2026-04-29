import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import { useNotificationStore } from '@/entities/notification';
import { useCatalogStore } from '@/entities/product';
import { useADMSyncStore } from '@/features/admin';
import { MemoryRouter } from 'react-router-dom';

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

describe('Header Component', () => {
  it('renders correctly with title T-Facile on catalog view', () => {
    (useNotificationStore as any).mockImplementation((selector: any) => selector ? selector({ hasUnread: false }) : { hasUnread: false });
    (useCatalogStore as any).mockImplementation((selector: any) => selector ? selector({ isOnline: true, lastUpdateDate: '01/01/2026' }) : { isOnline: true, lastUpdateDate: '01/01/2026' });
    (useADMSyncStore as any).mockImplementation((selector: any) => selector ? selector({ aiModel: 'model', setAiModel: vi.fn() }) : { aiModel: 'model', setAiModel: vi.fn() });

    render(
      <MemoryRouter initialEntries={['/catalog']}>
        <Header />
      </MemoryRouter>
    );
    
    expect(screen.getByText('T-Facile')).toBeDefined();
    expect(screen.getByLabelText('Impostazioni')).toBeDefined();
  });

  it('renders back button instead of settings when not on catalog view', () => {
    (useNotificationStore as any).mockImplementation((selector: any) => selector ? selector({ hasUnread: false }) : { hasUnread: false });
    (useCatalogStore as any).mockImplementation((selector: any) => selector ? selector({ isOnline: true, lastUpdateDate: '01/01/2026' }) : { isOnline: true, lastUpdateDate: '01/01/2026' });
    (useADMSyncStore as any).mockImplementation((selector: any) => selector ? selector({ aiModel: 'model', setAiModel: vi.fn() }) : { aiModel: 'model', setAiModel: vi.fn() });

    render(
      <MemoryRouter initialEntries={['/catalog/123']}>
        <Header />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Dettaglio')).toBeDefined();
    expect(screen.getByLabelText('Indietro')).toBeDefined();
  });
});

