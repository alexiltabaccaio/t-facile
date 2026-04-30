
import React, { useState } from 'react';
import { SearchIcon, FilterIcon, RefreshIcon } from '@/shared/ui';
import { useCatalogStore, useCatalogActions } from '@/entities/product';
import { useCatalogUiStore, useCatalogUiActions } from '@/features/product-sort';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

const SearchBar: React.FC = () => {
  const { t } = useTranslation();
  const { searchTerm, sortOption, lastUpdateDate, isOnline } = useCatalogStore(useShallow(state => ({
    searchTerm: state.searchTerm,
    sortOption: state.sortOption,
    lastUpdateDate: state.lastUpdateDate,
    isOnline: state.isOnline
  })));
  const { setSearchTerm } = useCatalogActions();
  const showSortModal = useCatalogUiStore((state) => state.showSortModal);
  const { setShowSortModal } = useCatalogUiActions();
  const [isFocused, setIsFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const isEmissionSort = ['nicotine', 'tar', 'co'].includes(sortOption.key);
  
  const placeholderText = isEmissionSort 
    ? t('catalog.searchEmissions') 
    : t('catalog.searchPlaceholder');

  return (
    <footer className="px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-light-bg dark:bg-dark-bg flex-shrink-0 sticky bottom-0 border-t border-neutral-200/80 dark:border-dark-border/50 z-50 lg:px-8 lg:py-6 lg:border-t-0">
      <div className="max-w-7xl mx-auto w-full flex items-center lg:gap-4">
        <div className={`relative flex items-center w-full flex-grow bg-white dark:bg-dark-card-bg rounded-full shadow-lg border ${isFocused ? 'ring-4 ring-blue-500/20 border-blue-500 shadow-blue-500/10' : 'border-neutral-300/70 dark:border-neutral-700/70 shadow-neutral-200/50 dark:shadow-none'}`}>
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <SearchIcon className="text-neutral-400" />
          </div>
          <input
            type="search"
            name="search-catalog-field"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder={placeholderText}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-14 bg-transparent pl-14 pr-24 text-light-text dark:text-dark-text-primary placeholder-neutral-500 dark:placeholder-dark-text-secondary focus:outline-none text-base"
            aria-label={t('catalog.searchAria')}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" aria-hidden="true"></div>
              <button
                onClick={() => setShowSortModal(!showSortModal)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all relative ml-1 ${showSortModal ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-dark-text-secondary'}`}
                aria-label={t('catalog.filterAria')}
                title={t('catalog.filterAria')}
              >
                <FilterIcon className="h-5 w-5" />
                <span className="hidden sm:inline font-bold text-sm">{t('catalog.filters')}</span>
              </button>
          </div>
        </div>

        {/* Desktop System Info */}
        <div className="hidden lg:flex items-center gap-4 shrink-0 px-5 h-14 bg-white dark:bg-dark-card-bg rounded-full shadow-lg border border-neutral-300/70 dark:border-neutral-700/70 shadow-neutral-200/50 dark:shadow-none text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2" title={isOnline ? t('layout.header.online') : t('layout.header.offline')}>
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
            <span className={isOnline ? 'text-light-text dark:text-dark-text-primary' : 'text-red-500'}>
              {isOnline ? t('layout.header.online') : t('layout.header.offline')}
            </span>
          </div>
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-bold text-light-text dark:text-dark-text-primary">{t('layout.header.updatedAt', { date: lastUpdateDate })}</span>
            <button 
              onClick={handleManualRefresh} 
              className={`p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-light-text dark:text-dark-text-primary transition-all active:scale-90 ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
              title={t('catalog.refreshAria')}
              aria-label={t('catalog.refreshAria')}
            >
              <RefreshIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SearchBar;
