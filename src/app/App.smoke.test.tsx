import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './providers/AuthProvider';

// 1. Mock delle dipendenze esterne "rumorose"
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

// Mock di Firebase per evitare inizializzazioni reali
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simula un utente non loggato inizialmente
    callback(null);
    return () => {};
  }),
  getRedirectResult: vi.fn(() => Promise.resolve(null)),
}));

// Mock scrollTo per JSDOM che non lo supporta
if (typeof window !== 'undefined') {
  Element.prototype.scrollTo = vi.fn();
}

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}));

// Mock di pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

// Mock del modulo virtuale PWA
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  })),
}));

// Mock del servizio catalogo per evitare chiamate reali a Firestore
vi.mock('@/entities/product', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    catalogService: {
      subscribeToConfig: vi.fn((onSuccess) => {
        onSuccess({
          lastUpdateDate: '01/01/2026',
          syncId: 'test-sync-id',
          totalChunks: 0,
        });
        return () => {};
      }),
      fetchCatalogInChunks: vi.fn(() => Promise.resolve([])),
    },
  };
});

// Mock delle notifiche
vi.mock('@/features/notifications', () => ({
  useNotificationInit: vi.fn(),
}));

describe('App Smoke Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the application and redirects to catalog', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verifichiamo che venga renderizzato il titolo (Header o Sidebar)
    const titles = await screen.findAllByText(/T-Facile/i);
    expect(titles.length).toBeGreaterThan(0);

    // Verifichiamo che il contenitore principale sia presente
    expect(screen.getByRole('main')).toBeDefined();
  });

  it('navigates to settings page correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verifichiamo che il titolo della pagina o il menu mostrino "Impostazioni"
    const settingsTitles = await screen.findAllByText(/Impostazioni/i);
    expect(settingsTitles.length).toBeGreaterThan(0);
  });
});
