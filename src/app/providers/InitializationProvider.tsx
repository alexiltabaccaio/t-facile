import React from 'react';
import { useCatalogSync } from '@/features/catalog';
import { useNotificationInit } from '@/features/notifications';
import { useThemeSync } from '@/shared/lib/theme/useThemeSync';
import { useOrientationLock } from '@/shared/hooks/useOrientationLock';

interface InitializationProviderProps {
  children: React.ReactNode;
}

export const InitializationProvider: React.FC<InitializationProviderProps> = ({ children }) => {
  // Global Initialization side effects
  useCatalogSync();
  useNotificationInit();
  useThemeSync();
  useOrientationLock();

  return <>{children}</>;
};
