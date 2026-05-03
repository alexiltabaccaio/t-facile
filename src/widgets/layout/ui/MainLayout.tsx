
import React, { useState, useEffect } from 'react';
import Header from './Header';
import DesktopSidebar from './DesktopSidebar';
import { useCatalogStore } from '@/entities/product';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
  children: React.ReactNode;
  mainRef?: React.RefObject<HTMLElement | null>;
  footer?: React.ReactNode;
  showSubHeader?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  mainRef,
  footer,
  showSubHeader = false
}) => {
  const isOnline = useCatalogStore(state => state.isOnline);
  const syncError = useCatalogStore(state => state.syncError);
  const location = useLocation();
  const { t } = useTranslation();

  const isCatalogRoute = location.pathname === '/' || location.pathname.startsWith('/catalog');
  const isListView = isCatalogRoute;

  const [showExperimentalBanner, setShowExperimentalBanner] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('hideExperimentalBanner');
    if (isDismissed !== 'true') {
      setShowExperimentalBanner(true);
    }
  }, []);

  const dismissBanner = () => {
    setShowExperimentalBanner(false);
    localStorage.setItem('hideExperimentalBanner', 'true');
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 fixed inset-0 lg:static lg:h-screen lg:flex lg:items-stretch p-0 text-sm overflow-hidden">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Container */}
      <div className="flex-grow flex flex-col h-full lg:h-screen flex-1 min-w-0 overflow-hidden relative lg:items-stretch">
        <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text-primary font-sans h-full w-full lg:h-full lg:max-w-none lg:max-h-none flex flex-col overflow-hidden relative lg:rounded-none lg:border-0 overscroll-none">
          <div className="lg:hidden sticky top-0 z-40 bg-light-bg dark:bg-dark-bg border-b border-neutral-200 dark:border-dark-border flex flex-col shrink-0">
            <Header />
            
            {showSubHeader && !isOnline && syncError && (
              <div className="px-4 pb-3 flex-shrink-0 overscroll-none">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-1.5 rounded text-[10px] text-red-600 dark:text-red-400 flex items-start gap-1 justify-center leading-tight overscroll-none">
                  <span className="font-bold shrink-0">ERRORE:</span>
                  <span className="line-clamp-2">{syncError}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Experimental Banner */}
          {showExperimentalBanner && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-900/40 px-4 py-2.5 sm:py-2 flex items-start sm:items-center justify-between text-amber-800 dark:text-amber-400 text-xs shrink-0 z-30">
              <div className="flex items-center gap-2.5 pr-4">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-1 rounded-full shrink-0">
                  <AlertTriangle size={14} className="text-amber-600 dark:text-amber-500" />
                </div>
                <span className="leading-relaxed">
                  <strong className="font-medium text-amber-900 dark:text-amber-300">{t('layout.banner.experimental')}</strong>{' '}
                  <span className="opacity-90">{t('layout.banner.verify')}</span>
                </span>
              </div>
              <button 
                onClick={dismissBanner} 
                className="p-1.5 -mr-1.5 hover:bg-amber-200/50 dark:hover:bg-amber-900/40 rounded-full shrink-0 flex-none text-amber-600 dark:text-amber-400 transition-colors"
                aria-label={t('layout.banner.close')}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <main 
            ref={mainRef} 
            className={`flex-grow relative min-h-0 flex flex-col ${isListView ? 'overflow-hidden' : 'overflow-y-auto scroll-smooth'} overscroll-none`} 
            id="main-content"
          >
            <div className={`w-full min-h-0 flex flex-col flex-grow ${isListView ? 'h-full absolute inset-0' : 'relative'}`}>
              {children}
            </div>
          </main>

          {footer}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
