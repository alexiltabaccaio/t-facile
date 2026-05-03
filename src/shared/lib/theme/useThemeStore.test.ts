import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    const { setState } = useThemeStore;
    setState({
      theme: 'system',
    });
    localStorage.clear();
  });

  it('should update theme and save to localStorage', () => {
    const { setTheme } = useThemeStore.getState().actions;
    
    setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    
    // Check persist storage (Zustand persist format)
    const stored = JSON.parse(localStorage.getItem('theme-storage') || '{}');
    expect(stored.state.theme).toBe('dark');
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should apply correct theme colors for dark mode', () => {
    const { setTheme } = useThemeStore.getState().actions;
    setTheme('dark');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    expect(metaThemeColor?.getAttribute('content')).toBe('#121212');
  });

  it('should apply correct theme colors for light mode', () => {
    const { setTheme } = useThemeStore.getState().actions;
    setTheme('light');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    expect(metaThemeColor?.getAttribute('content')).toBe('#F5F5F7');
  });
});
