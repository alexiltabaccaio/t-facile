import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../../types';

interface ThemeState {
  theme: Theme;
  actions: {
    setTheme: (theme: Theme) => void;
  };
}

const applyTheme = (t: Theme) => {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  const isDark =
    t === 'dark' ||
    (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const color = isDark ? '#121212' : '#F5F5F7';
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', color);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = color;
    document.head.appendChild(meta);
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      actions: {
        setTheme: (theme) => {
          set({ theme });
          applyTheme(theme);
        },
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
      // Only persist the theme string, not the actions object
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export const useThemeActions = () => useThemeStore((state) => state.actions);
