import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './providers/AuthProvider';

// 1. Mock delle dipendenze esterne
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

// Setup base per Firebase Auth e Firestore
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

// Mock del servizio catalogo (per evitare errori nel boot di App)
vi.mock('@/entities/product', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    catalogService: {
      subscribeToConfig: vi.fn((onSuccess: (config: any) => void) => {
        onSuccess({ lastUpdateDate: '01/01/2026', syncId: 'test', totalChunks: 0 });
        return () => {};
      }),
      fetchCatalogInChunks: vi.fn(() => Promise.resolve([])),
    },
  };
});

// Mock scrollTo
if (typeof window !== 'undefined') {
  Element.prototype.scrollTo = vi.fn();
}

describe('Auth & Route Protection Smoke Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies access to /admin for unauthenticated users', async () => {
    // Simula utente non loggato
    mockOnAuthStateChanged.mockImplementation((callback) => callback(null));

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verifichiamo che appaia il messaggio di Accesso Negato
    await waitFor(() => {
      expect(screen.getByText(/Accesso Negato/i)).toBeDefined();
      expect(screen.getByText(/riservata agli amministratori/i)).toBeDefined();
    });
  });

  it('denies access to /admin for logged-in but non-admin users', async () => {
    // Simula utente loggato
    mockOnAuthStateChanged.mockImplementation((callback) => callback({ uid: 'user123', email: 'user@test.com' }));
    // Simula che NON sia admin nel database
    mockGetDoc.mockResolvedValue({ exists: () => false });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Accesso Negato/i)).toBeDefined();
    });
  });

  it('grants access to /admin for authorized admins', async () => {
    // Simula utente loggato
    mockOnAuthStateChanged.mockImplementation((callback) => callback({ uid: 'admin123', email: 'admin@test.com' }));
    // Simula che SIA admin nel database
    mockGetDoc.mockResolvedValue({ exists: () => true });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verifichiamo che appaia il titolo del Pannello Admin (e non Accesso Negato)
    await waitFor(() => {
      // Usiamo findAll perché il titolo appare nell'Header e nella pagina (Pannello Admin)
      expect(screen.queryByText(/Accesso Negato/i)).toBeNull();
      const adminTitles = screen.getAllByText(/Pannello Admin/i);
      expect(adminTitles.length).toBeGreaterThan(0);
    });
  });

  it('should redirect back to catalog if session is lost on admin page', async () => {
    // Start as admin
    mockOnAuthStateChanged.mockImplementation((callback) => callback({ uid: 'admin123' }));
    mockGetDoc.mockResolvedValue({ exists: () => true });

    const { rerender } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.queryByText(/Pannello Admin/i)).toBeDefined();
    });

    // Simulate session loss by triggering the stored callback
    const authCallback = mockOnAuthStateChanged.mock.calls[0][0];
    await act(async () => {
        authCallback(null);
    });
    
    await waitFor(() => {
        expect(screen.getByText(/Accesso Negato/i)).toBeDefined();
    });
  });
});
