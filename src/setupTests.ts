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
      // Funzione ricorsiva per navigare l'oggetto delle traduzioni tramite stringa con punti (es. 'layout.header.catalog')
      const keys = key.split('.');
      let result: any = itTranslations;
      for (const k of keys) {
        result = result?.[k];
      }
      
      if (typeof result === 'string') {
        // Gestione base delle variabili (es. {{version}})
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
