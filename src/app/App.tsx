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

// Shared
import { InstallPwaPrompt, UpdatePwaPrompt, OrientationLockOverlay } from '@/shared/ui';
import { useScrollToTop } from '@/shared/hooks';

// App Providers
import { InitializationProvider } from './providers';
import { useCatalogStore } from '@/entities/product';
import { useAuth } from '@/entities/session';

const App: React.FC = () => {
  const mainContentRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // Check initial hydration state
    setIsHydrated(useCatalogStore.persist.hasHydrated());
    
    // Subscribe to hydration events
    const unsubFinishHydration = useCatalogStore.persist.onFinishHydration(() => setIsHydrated(true));
    
    return () => {
      unsubFinishHydration();
    };
  }, []);

  // Scroll management
  useScrollToTop(mainContentRef);

  const isCatalogRoute = location.pathname === '/' || location.pathname.startsWith('/catalog');

  if (!isHydrated) {
    return null; // Prevents UI flicker before loading from IndexedDB
  }

  return (
    <InitializationProvider>
      <OrientationLockOverlay />

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
          <Route 
            path="/settings/report" 
            element={user ? <ReportProblemPage /> : <Navigate to="/settings" replace />} 
          />
          <Route path="/settings/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
        
        <InstallPwaPrompt />
        <UpdatePwaPrompt />
      </MainLayout>
      <Analytics />
    </InitializationProvider>
  );
}

export default App;
