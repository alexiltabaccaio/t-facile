import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SettingsIcon, BellIcon, RefreshIcon } from '@/shared/ui';
import { formatToDisplayDate } from '@/shared/lib/utils/dateUtils';
import { usePresentationMode } from '@/shared/lib/hooks/usePresentationMode';
import { useAppNavigation } from '@/shared/lib/hooks/useAppNavigation';

import { useNotificationStore } from '@/entities/notification';
import { useCatalogStore } from '@/entities/product';

import { AIModelSelector } from '@/features/ai-settings';
import { ProductShareButton } from '@/features/product-share';

import { useHeaderData } from '../model/useHeaderData';

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} className="text-neutral-600 hover:text-light-text dark:text-dark-text-secondary dark:hover:text-dark-text-primary" aria-label={t('common.back')}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { 
    isCatalog, 
    showBackButton, 
    title, 
    isProductDetail, 
    currentProduct, 
    location 
  } = useHeaderData();
  
  const { handleBack } = useAppNavigation();
  const isPresentation = usePresentationMode();
  
  const { hasUnread: hasUnreadNotifications } = useNotificationStore();
  const isOnline = useCatalogStore(state => state.isOnline);
  const lastUpdateDate = useCatalogStore(state => state.lastUpdateDate);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <header className="relative flex items-center px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] flex-shrink-0 h-16 lg:h-20 lg:px-8 lg:bg-white lg:dark:bg-dark-bg lg:border-b lg:border-neutral-100 lg:dark:border-neutral-800/50">
      <div className="relative flex items-center justify-between w-full h-8">
        {/* Left Slot: Icon + Online Status */}
        <div className="relative z-10 flex items-center flex-1 h-full">
          <div className="absolute left-0 flex items-center h-full gap-3">
            {showBackButton ? (
              <BackButton onClick={handleBack} />
            ) : (
              <>
                <button 
                  className="text-neutral-600 hover:text-light-text dark:text-dark-text-secondary dark:hover:text-dark-text-primary p-1 lg:hidden"
                  onClick={() => navigate('/settings')}
                  title={t('settings.title')}
                  aria-label={t('settings.title')}
                >
                  <SettingsIcon size={20} />
                </button>
              </>
            )}
          </div>

          {isCatalog && (
            <div className="flex-1 flex items-center justify-center gap-1.5 h-full">
              <span 
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} 
                title={isOnline ? t('layout.header.online') : t('layout.header.offline')}
              />
              <span className={`text-[10px] font-bold tracking-tight ${isOnline ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {isOnline ? t('layout.header.online') : t('layout.header.offline')}
              </span>
            </div>
          )}
        </div>

        {/* Center Slot: Title (Absolutely Centered) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center pointer-events-auto">
            <div className="relative flex items-center justify-center">
              <h1 className="text-[15px] sm:text-lg font-display font-black text-light-text dark:text-dark-text-primary tracking-tighter uppercase lg:truncate lg:text-2xl leading-tight text-center">
                {title.isProduct ? (
                  <>
                    <span className="lg:hidden block line-clamp-2 max-w-[50vw] sm:max-w-[60vw] text-balance">{title.mobile}</span>
                    <span className="hidden lg:inline">{title.desktop}</span>
                  </>
                ) : (
                  title.mobile
                )}
              </h1>
              {(import.meta.env.DEV || import.meta.env.VITE_GIT_BRANCH === 'dev') && !isPresentation && (
                <span className="absolute top-[calc(100%-2px)] left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest leading-none">
                  (dev)
                </span>
              )}
            </div>
            
            {location.pathname === '/admin' && <AIModelSelector />}
          </div>
        </div>

        {/* Right Slot: Update Date + Notification Icon */}
        <div className="relative z-10 flex items-center flex-1 justify-end h-full">
          {isCatalog && (
            <div className="flex-1 flex items-center justify-center gap-1.5 overflow-hidden h-full">
              <span className="text-[10px] text-neutral-500 font-medium whitespace-nowrap">
                {t('layout.header.updatedAt', { date: formatToDisplayDate(lastUpdateDate) })}
              </span>
              <button 
                onClick={handleManualRefresh}
                className={`p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all active:scale-90 ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                title={t('layout.header.refresh')}
                aria-label={t('layout.header.refresh')}
              >
                <RefreshIcon size={14} className="text-neutral-400" />
              </button>
            </div>
          )}
          
          <div className="absolute right-0 flex items-center h-full gap-1">
            {isProductDetail && currentProduct && (
              <ProductShareButton product={currentProduct} />
            )}
            <button 
              onClick={() => navigate('/notifications')}
              className="relative text-neutral-600 hover:text-light-text dark:text-dark-text-secondary dark:hover:text-dark-text-primary p-1"
              title={t('layout.header.notifications')}
            >
              <BellIcon size={20} />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-light-bg dark:ring-dark-bg" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
