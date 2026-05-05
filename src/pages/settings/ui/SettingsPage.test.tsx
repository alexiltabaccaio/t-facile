import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from './SettingsPage';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore, useThemeActions } from '@/shared/lib';
import { useAuth } from '@/entities/session';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('@/shared/lib', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useThemeStore: vi.fn(),
    useThemeActions: vi.fn(),
  };
});

vi.mock('@/entities/session', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth', () => ({
  AuthAvatar: () => <div data-testid="auth-avatar" />,
}));

describe('SettingsPage', () => {
  const mockNavigate = vi.fn();
  const mockChangeLanguage = vi.fn();
  const mockSetTheme = vi.fn();
  const mockT = vi.fn((key) => key);

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useTranslation as any).mockReturnValue({
      t: mockT,
      i18n: {
        changeLanguage: mockChangeLanguage,
        resolvedLanguage: 'it',
      },
    });
    (useThemeStore as any).mockImplementation((selector: any) => selector({ theme: 'system' }));
    (useThemeActions as any).mockReturnValue({ setTheme: mockSetTheme });
    (useAuth as any).mockReturnValue({ isAdmin: false });
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('settings.theme.title')).toBeDefined();
    expect(screen.getByText('settings.language.title')).toBeDefined();
    expect(screen.getByTestId('auth-avatar')).toBeDefined();
  });

  it('handles theme change', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const lightThemeButton = screen.getByText('settings.theme.light');
    fireEvent.click(lightThemeButton);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('handles language change', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const enButton = screen.getByText('settings.language.en');
    fireEvent.click(enButton);

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('shows admin section for admin users', () => {
    (useAuth as any).mockReturnValue({ isAdmin: true });
    
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const adminButton = screen.getByText('settings.admin');
    expect(adminButton).toBeDefined();

    fireEvent.click(adminButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('hides admin section for non-admin users', () => {
    (useAuth as any).mockReturnValue({ isAdmin: false });
    
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.queryByText('settings.admin')).toBeNull();
  });

  it('navigates to info pages', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const aboutButton = screen.getByText('settings.info.about');
    fireEvent.click(aboutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/settings/about');
  });
});
