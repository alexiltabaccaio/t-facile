import { useEffect } from 'react';
import { useThemeStore } from './useThemeStore';

/**
 * Hook to synchronize the application theme with the system theme.
 * Specifically listens for OS-level theme changes when the 'system' preference is active.
 */
export const useThemeSync = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // System theme handling
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        const isDark = mediaQuery.matches;
        root.classList.toggle('dark', isDark);
        
        // Update theme-color meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        const color = isDark ? '#121212' : '#F5F5F7';
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', color);
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
};
