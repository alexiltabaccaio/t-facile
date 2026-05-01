import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { SessionProvider } from '@/entities/session';

// 1. Mock "noisy" external dependencies
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

// Mock Firebase to avoid real initializations
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Simulate a user not logged in initially
    callback(null);
    return () => {};
  }),
  getRedirectResult: vi.fn(() => Promise.resolve(null)),
}));

// Mock scrollTo for JSDOM which does not support it
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

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

// Mock the virtual PWA module
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  })),
}));

// Mock the catalog service to avoid real calls to Firestore
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

// Mock notifications
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
        <SessionProvider>
          <App />
        </SessionProvider>
      </MemoryRouter>
    );

    // Verify that the title is rendered (Header or Sidebar)
    const titles = await screen.findAllByText(/T-Facile/i);
    expect(titles.length).toBeGreaterThan(0);

    // Verify that the main container is present
    expect(screen.getByRole('main')).toBeDefined();
  });

  it('navigates to settings page correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <SessionProvider>
          <App />
        </SessionProvider>
      </MemoryRouter>
    );

    // Verify that the page title or menu shows "Settings"
    const settingsTitles = await screen.findAllByText(/Impostazioni/i);
    expect(settingsTitles.length).toBeGreaterThan(0);
  });
});
