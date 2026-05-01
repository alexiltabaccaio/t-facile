import { create } from 'zustand';
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

export const useThemeStore = create<ThemeState>((set) => {
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'system';
    try {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) return saved;
    } catch (e) {
      console.error('Failed to read theme from localStorage', e);
    }
    return 'system';
  };

  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    actions: {
      setTheme: (theme) => {
        set({ theme });
        try {
          localStorage.setItem('theme', theme);
        } catch (e) {
          console.error('Failed to save theme to localStorage', e);
        }
        applyTheme(theme);
      },
    }
  };
});

export const useThemeActions = () => useThemeStore((state) => state.actions);
