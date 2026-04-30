import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './ui/AdminPage';
import { SessionProvider } from '@/entities/session';

// 1. Mock delle dipendenze
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));

const mockOnAuthStateChanged = vi.fn();
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: (_auth: any, callback: (user: any) => void) => {
    mockOnAuthStateChanged(callback);
    return () => {};
  },
  getRedirectResult: vi.fn(() => Promise.resolve(null)),
}));

const mockGetDoc = vi.fn();
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((_db: any, _coll: string, id: string) => ({ id })),
  getDoc: (ref: any) => mockGetDoc(ref),
  onSnapshot: vi.fn(() => () => {}),
  collection: vi.fn((_db: any, coll: string) => ({ coll })),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

// Mock del modulo virtuale PWA
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  })),
}));

// Mock di pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

// Mock della feature admin per evitare side effects complessi
vi.mock('@/features/admin', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    PDFUploader: () => <div data-testid="pdf-uploader">PDF Uploader Component</div>,
    ADMAutoUpdater: () => <div data-testid="auto-updater">Auto Updater Component</div>,
  };
});

describe('Admin Page Smoke Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simula utente ADMIN loggato per tutti i test in questo file
    mockOnAuthStateChanged.mockImplementation((callback) => callback({ uid: 'admin123', email: 'admin@test.com' }));
    mockGetDoc.mockResolvedValue({ exists: () => true });
  });

  it('renders the Admin Page with default "Pilota Auto" tab', async () => {
    render(
      <MemoryRouter>
        <SessionProvider>
          <AdminPage />
        </SessionProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Pannello Admin/i)).toBeDefined();
      expect(screen.getByTestId('auto-updater')).toBeDefined();
    });
  });

  it('switches to "Lettore PDF" tab when clicked', async () => {
    render(
      <MemoryRouter>
        <SessionProvider>
          <AdminPage />
        </SessionProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Lettore PDF/i)).toBeDefined();
    });

    const pdfTabButton = screen.getByText(/Lettore PDF/i);
    fireEvent.click(pdfTabButton);

    await waitFor(() => {
      expect(screen.getByTestId('pdf-uploader')).toBeDefined();
      expect(screen.queryByTestId('auto-updater')).toBeNull();
    });
  });
});
