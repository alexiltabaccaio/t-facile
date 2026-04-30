import React from 'react';
import { useCatalogSync } from '@/features/catalog';
import { useNotificationInit } from '@/features/notifications';
import { useThemeSync } from '@/shared/lib';
import { useOrientationLock } from '@/shared/hooks';

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

