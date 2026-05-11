import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Fix for window.matchMedia is not a function in jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver
  });
}

import itTranslations from './shared/lib/i18n/locales/it.json';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const keys = key.split('.');
      let result: unknown = itTranslations;
      for (const k of keys) {
        result = (result as Record<string, unknown>)?.[k];
      }
      
      if (typeof result === 'string') {
        if (options) {
          let replaced = result;
          Object.keys(options).forEach(optKey => {
            replaced = replaced.replace(`{{${optKey}}}`, options[optKey]);
          });
          return replaced;
        }
        return result;
      }
      return key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'it',
      resolvedLanguage: 'it',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock idb-keyval for IndexedDB storage in tests
vi.mock('idb-keyval', () => ({
  get: vi.fn(() => Promise.resolve(null)),
  set: vi.fn(() => Promise.resolve()),
  del: vi.fn(() => Promise.resolve()),
  clear: vi.fn(() => Promise.resolve()),
  keys: vi.fn(() => Promise.resolve([])),
  values: vi.fn(() => Promise.resolve([])),
  entries: vi.fn(() => Promise.resolve([])),
}));

// Mock virtual:pwa-register/react
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

// Mock OrientationLockOverlay to avoid interfering with tests
vi.mock('@/shared/ui', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    OrientationLockOverlay: () => null,
  };
});

// Ensure stores are always "hydrated" in tests
vi.mock('./entities/product', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const catalogDataStore = actual.useCatalogDataStore as { persist: { hasHydrated: () => boolean, onFinishHydration: (cb: () => void) => () => void } };
  const catalogSyncStore = actual.useCatalogSyncStore as { persist: { hasHydrated: () => boolean, onFinishHydration: (cb: () => void) => () => void } };

  return {
    ...actual,
    useCatalogDataStore: Object.assign(actual.useCatalogDataStore as object, {
        persist: {
            ...catalogDataStore.persist,
            hasHydrated: () => true,
            onFinishHydration: (cb: () => void) => { cb(); return () => {}; },
        }
    }),
    useCatalogSyncStore: Object.assign(actual.useCatalogSyncStore as object, {
        persist: {
            ...catalogSyncStore.persist,
            hasHydrated: () => true,
            onFinishHydration: (cb: () => void) => { cb(); return () => {}; },
        }
    }),
  };
});
