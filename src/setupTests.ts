import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Fix for window.matchMedia is not a function in jsdom
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

import itTranslations from './shared/lib/i18n/locales/it.json';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Recursive function to navigate the translations object via dot-notation string (e.g., 'layout.header.catalog')
      const keys = key.split('.');
      let result: any = itTranslations;
      for (const k of keys) {
        result = result?.[k];
      }
      
      if (typeof result === 'string') {
        // Basic variable handling (e.g., {{version}})
        if (options) {
          Object.keys(options).forEach(optKey => {
            result = result.replace(`{{${optKey}}}`, options[optKey]);
          });
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
