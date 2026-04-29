import React, { useState } from 'react';
import { SettingsIcon, BellIcon, RefreshIcon } from '@/shared/ui/Icons';
import { useNotificationStore } from '@/entities/notification';
import { useCatalogStore } from '@/entities/product';
import { useADMSyncStore, useADMSyncActions } from '@/features/admin';
import { useLocation, useNavigate } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { hasUnread: hasUnreadNotifications } = useNotificationStore();
  const isOnline = useCatalogStore(state => state.isOnline);
  const lastUpdateDate = useCatalogStore(state => state.lastUpdateDate);
  const aiModel = useADMSyncStore(s => s.aiModel);
  const { setAiModel } = useADMSyncActions();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isCatalog = location.pathname === '/catalog' || location.pathname === '/';
  const showBackButton = !isCatalog;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/catalog/')) return t('common.details');
    if (path === '/notifications') return t('layout.sidebar.updates');
    if (path.startsWith('/notifications/')) return t('common.details');
    if (path === '/settings') return t('layout.sidebar.settings');
    if (path === '/settings/legal') return t('layout.sidebar.legal');
    if (path === '/settings/report') return t('layout.sidebar.report');
    if (path === '/settings/about') return t('layout.sidebar.info');
    if (path === '/admin') return t('layout.sidebar.admin');
    return t('layout.header.catalog');
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }

    const path = location.pathname;
    if (path.startsWith('/catalog/')) {
        navigate('/catalog', { replace: true });
    } else if (path === '/notifications') {
        navigate('/catalog', { replace: true });
    } else if (path.startsWith('/notifications/')) {
        navigate('/notifications', { replace: true });
    } else if (path === '/settings') {
        navigate('/catalog', { replace: true });
    } else if (path.startsWith('/settings/')) {
        navigate('/settings', { replace: true });
    } else {
        navigate('/catalog', { replace: true });
    }
  };

  const formatUpdateDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Gestione formato DD/MM/YYYY (già corretto)
    if (dateStr.includes('/') && dateStr.split('/').length === 3) return dateStr;
    // Gestione formato YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  return (
    <header className="relative flex items-center px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] flex-shrink-0 h-16 lg:h-20 lg:px-8 lg:bg-white lg:dark:bg-dark-bg lg:border-b lg:border-neutral-100 lg:dark:border-neutral-800/50">
      <div className="relative flex items-center justify-between w-full h-8">
        {/* Left Slot: Icon + Online Status */}
        <div className="relative z-10 flex items-center flex-1 h-full">
          <div className="absolute left-0 flex items-center h-full">
            {showBackButton ? (
              <BackButton onClick={handleBack} />
            ) : (
              <button 
                className="text-neutral-600 hover:text-light-text dark:text-dark-text-secondary dark:hover:text-dark-text-primary p-1 lg:hidden"
                onClick={() => navigate('/settings')}
                title="Impostazioni"
                aria-label="Impostazioni"
              >
                <SettingsIcon size={20} />
              </button>
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
              <h1 className="text-lg font-display font-black text-light-text dark:text-dark-text-primary tracking-tighter uppercase truncate lg:text-2xl leading-tight">
                {getTitle()}
              </h1>
              {import.meta.env.DEV && (
                <span className="absolute top-[calc(100%-2px)] left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest leading-none">
                  (dev)
                </span>
              )}
            </div>
            
            {location.pathname === '/admin' && (
              <div className="absolute left-full ml-3 flex items-center gap-1 bg-white dark:bg-neutral-800/80 backdrop-blur-sm rounded-full px-2 py-0.5 border border-neutral-200 dark:border-neutral-700 shadow-sm z-[100] cursor-pointer">
                <Cpu className="w-2.5 h-2.5 text-blue-500" />
                <select 
                  value={aiModel} 
                  onChange={(e) => setAiModel(e.target.value)}
                  className="text-[8px] font-extrabold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest bg-transparent border-none focus:ring-0 p-0 outline-none cursor-pointer pr-1"
                >
                  <option value="gemini-3-flash-preview">FLASH</option>
                  <option value="gemini-3.1-flash-lite-preview">FLASH-LITE</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Slot: Data Aggiornamento + Notification Icon */}
        <div className="relative z-10 flex items-center flex-1 justify-end h-full">
          {isCatalog && (
            <div className="flex-1 flex items-center justify-center gap-1.5 overflow-hidden h-full">
              <span className="text-[10px] text-neutral-500 font-medium whitespace-nowrap">{t('layout.header.updatedAt', { date: formatUpdateDate(lastUpdateDate) })}</span>
              <button 
                onClick={handleManualRefresh}
                className={`p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all active:scale-90 ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                title={t('layout.header.refresh')}
              >
                <RefreshIcon size={14} className="text-neutral-400" />
              </button>
            </div>
          )}
          
          <div className="absolute right-0 flex items-center h-full">
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
