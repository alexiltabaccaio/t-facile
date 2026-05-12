import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './ui/AdminPage';
import { SessionProvider } from '@/entities/session';

// 1. Mock dependencies
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));

const mockOnAuthStateChanged = vi.fn();
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    mockOnAuthStateChanged(callback);
    return () => {};
  },
  getRedirectResult: vi.fn(() => Promise.resolve(null)),
}));

const mockGetDoc = vi.fn();
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((_db: unknown, _coll: string, id: string) => ({ id })),
  getDoc: (ref: unknown) => mockGetDoc(ref),
  onSnapshot: vi.fn(() => () => {}),
  collection: vi.fn((_db: unknown, coll: string) => ({ coll })),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

// Mock the virtual PWA module
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  })),
}));

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

// Mock the split features to avoid complex side effects
vi.mock('@/features/pdf-upload', () => ({
  PDFUploader: () => <div data-testid="pdf-uploader">PDF Uploader Component</div>,
}));

vi.mock('@/features/system-update', () => ({
  ADMAutoUpdater: () => <div data-testid="auto-updater">Auto Updater Component</div>,
  ADMNewsScanner: () => <div data-testid="news-scanner">News Scanner Component</div>,
}));

// Mock the product-sync feature logic
vi.mock('@/features/product-sync', () => ({
  useADMSyncStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) => selector({ aiModel: 'gemini-3-flash-preview' })),
  useADMSyncActions: vi.fn(() => ({ setAiModel: vi.fn() })),
  PDFPreviewTable: () => <div data-testid="pdf-preview-table">PDF Preview Table</div>,
}));

describe('Admin Page Smoke Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate an ADMIN user logged in for all tests in this file
    mockOnAuthStateChanged.mockImplementation((callback) => callback({ uid: 'admin123', email: 'admin@test.com' }));
    mockGetDoc.mockResolvedValue({ exists: () => true });
  });

  it('renders the Admin Page with default "News Scanner" tab', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <SessionProvider>
          <AdminPage />
        </SessionProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('news-scanner')).toBeDefined();
    });
  });

  it('switches to "Lettore PDF" tab when clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <SessionProvider>
          <AdminPage />
        </SessionProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('news-scanner')).toBeDefined();
    });

    const pdfTabButton = screen.getByText(/Lettore PDF/i);
    fireEvent.click(pdfTabButton);

    await waitFor(() => {
      expect(screen.getByTestId('pdf-uploader')).toBeDefined();
      expect(screen.queryByTestId('news-scanner')).toBeNull();
    });
  });
});
