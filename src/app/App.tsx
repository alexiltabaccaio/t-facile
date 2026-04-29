import React, { useRef } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";

// Pages
import { CatalogPage } from '@/pages/catalog';
import { NotificationDetailPage, NotificationsPage } from '@/pages/notifications';
import { SettingsPage, LegalPage, ReportProblemPage, AboutPage } from '@/pages/settings';
import { AdminPage } from '@/pages/admin';

// Widgets
import { MainLayout } from '@/widgets/layout';

// Features
import { SortModal, useCatalogUiStore, useCatalogUiActions, useCatalogSync } from '@/features/catalog';
import { useNotificationInit } from '@/features/notifications';

// Shared
import { InstallPwaPrompt, UpdatePwaPrompt } from '@/shared/ui';
import { useThemeSync } from '@/shared/lib/theme/useThemeSync';
import { useOrientationLock } from '@/shared/hooks/useOrientationLock';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';

const App: React.FC = () => {
  const mainContentRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const showSortModal = useCatalogUiStore((state) => state.showSortModal);
  const { setShowSortModal } = useCatalogUiActions();

  // Initialization side effects
  useCatalogSync();
  useNotificationInit();
  useThemeSync();
  useOrientationLock();
  useScrollToTop(mainContentRef);

  const isCatalogRoute = location.pathname === '/' || location.pathname.startsWith('/catalog');

  return (
    <>
      {/* Orientation Lock Overlay */}
      <div className="fixed inset-0 z-[1000] bg-neutral-900 flex-col items-center justify-center p-8 text-center orientation-landscape-overlay">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-8 h-8 text-white rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Ruota il dispositivo</h2>
        <p className="text-neutral-400 text-sm max-w-[240px]">Questa applicazione è ottimizzata per la visualizzazione in verticale.</p>
      </div>

      <MainLayout
        mainRef={mainContentRef}
        showSubHeader={isCatalogRoute}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:id" element={<CatalogPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/notifications/:id" element={<NotificationDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/legal" element={<LegalPage />} />
          <Route path="/settings/report" element={<ReportProblemPage />} />
          <Route path="/settings/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
        
        {showSortModal && (
          <SortModal
              onClose={() => setShowSortModal(false)}
          />
        )}
        
        <InstallPwaPrompt />
        <UpdatePwaPrompt />
      </MainLayout>
      <Analytics />
    </>
  );
}

export default App;
