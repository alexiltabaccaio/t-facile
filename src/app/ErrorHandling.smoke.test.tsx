import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { SessionProvider } from '@/entities/session';
import { useCatalogStore } from '@/entities/product';

// Mock dependencies
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: (_auth: any, callback: (user: any) => void) => {
    callback(null);
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

// Mock for pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

// Mock for the PWA virtual module
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  })),
}));

// Mock catalogService to trigger error
let mockErrorTrigger: ((err: any) => void) | null = null;
vi.mock('@/entities/product', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    catalogService: {
      subscribeToConfig: vi.fn((_onSuccess: any, onError: any) => {
        mockErrorTrigger = onError;
        return () => {};
      }),
      fetchCatalogInChunks: vi.fn(),
    },
  };
});

// Mock scrollTo
if (typeof window !== 'undefined') {
  Element.prototype.scrollTo = vi.fn();
}

describe('Error Handling Smoke Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    const state = useCatalogStore.getState();
    state.actions.setSyncError(null);
    state.actions.setIsOnline(true);
    state.actions.setProducts([]);
  });

  it('displays connection error message when Firestore subscription fails', async () => {
    render(
      <MemoryRouter initialEntries={['/catalog']}>
        <SessionProvider>
          <App />
        </SessionProvider>
      </MemoryRouter>
    );

    // Simulate connection error
    const trigger = mockErrorTrigger;
    if (trigger) {
      await act(async () => {
        trigger(new Error('Connection failed'));
      });
    }

    await waitFor(() => {
      expect(screen.getByText(/Connessione assente o limitata/i)).toBeDefined();
    });
  });
});
