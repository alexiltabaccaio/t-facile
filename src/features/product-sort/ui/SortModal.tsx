
import React from 'react';
import { SortKey, useCatalogStore, useCatalogActions } from '@/entities/product';
import { ArrowsUpDownIcon } from '@/shared/ui/Icons';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; label: string; id: string }> = ({ checked, onChange, label, id }) => (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-800">
        <span className="text-light-text dark:text-dark-text-primary font-medium">{label}</span>
        <div className="relative">
            <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`w-12 h-7 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
    </label>
);

const SortKeyButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 text-center py-3 px-2 rounded-lg text-sm font-semibold ${
      active
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-neutral-200 hover:bg-neutral-300 text-light-text dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-dark-text-primary'
    }`}
  >
    {label}
  </button>
);

interface SortModalProps {
  onClose: () => void;
}

const SortModal: React.FC<SortModalProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const { sortOption, showRetired, showOutOfCatalog } = useCatalogStore(useShallow((state) => ({
    sortOption: state.sortOption,
    showRetired: state.showRetired,
    showOutOfCatalog: state.showOutOfCatalog
  })));
  const { setSortOption, setShowRetired, setShowOutOfCatalog } = useCatalogActions();

  const handleSortKeyChange = (key: SortKey) => {
    if (key !== sortOption.key) {
        setSortOption({
          key,
          order: key === 'smart' ? 'desc' : 'asc'
        });
    }
  };

  const handleToggleOrder = () => {
    setSortOption({
      ...sortOption,
      order: sortOption.order === 'asc' ? 'desc' : 'asc'
    });
  };

  const isSmartSort = sortOption.key === 'smart';

  return (
    <div className="absolute inset-x-0 top-0 bottom-[80px] z-40 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] pointer-events-auto"
      />

      {/* Bottom Sheet wrapper */}
      <div
        className="relative bg-white dark:bg-dark-card-bg w-full rounded-t-xl shadow-2xl flex flex-col overflow-hidden border-t border-neutral-200 dark:border-dark-border pointer-events-auto"
        style={{ maxHeight: '75dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle & Header */}
        <div className="flex flex-col items-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mb-4" />
          <div className="w-full flex justify-between items-center px-6 mb-2">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text-primary">
              {t('catalog.sort.title')}
            </h2>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-500"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-8 overflow-y-auto space-y-8">
          <section>
            <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px] mb-3 px-1">
              {t('catalog.sort.visibility')}
            </h3>
            <ToggleSwitch
                id="retired-toggle"
                label={t('catalog.sort.showRetired')}
                checked={showRetired}
                onChange={() => setShowRetired(!showRetired)}
            />
            <div className="mt-2">
              <ToggleSwitch
                  id="out-of-catalog-toggle"
                  label={t('catalog.sort.showOutOfCatalog')}
                  checked={showOutOfCatalog}
                  onChange={() => setShowOutOfCatalog(!showOutOfCatalog)}
              />
            </div>
          </section>
          
          <section>
            <div className="flex justify-between items-center mb-3 px-1">
                 <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px]">
                   {t('catalog.sort.sortBy')}
                 </h3>
                 <button
                    onClick={handleToggleOrder}
                    disabled={isSmartSort}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 disabled:opacity-40"
                 >
                     <ArrowsUpDownIcon size={14} />
                     {sortOption.order === 'asc' ? t('catalog.sort.orderAsc') : t('catalog.sort.orderDesc')}
                 </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <SortKeyButton label={t('catalog.sort.relevance')} active={sortOption.key === 'smart'} onClick={() => handleSortKeyChange('smart')} />
                <SortKeyButton label={t('catalog.sort.name')} active={sortOption.key === 'name'} onClick={() => handleSortKeyChange('name')} />
                <SortKeyButton label={t('catalog.sort.price')} active={sortOption.key === 'price'} onClick={() => handleSortKeyChange('price')} />
                <SortKeyButton label={t('catalog.sort.code')} active={sortOption.key === 'code'} onClick={() => handleSortKeyChange('code')} />
            </div>
          </section>
          
          <section>
             <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px] mb-3 px-1">
               {t('catalog.sort.emissions')}
             </h3>
             <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <SortKeyButton label={t('catalog.sort.nicotine')} active={sortOption.key === 'nicotine'} onClick={() => handleSortKeyChange('nicotine')} />
                <SortKeyButton label={t('catalog.sort.tar')} active={sortOption.key === 'tar'} onClick={() => handleSortKeyChange('tar')} />
                <SortKeyButton label={t('catalog.sort.co')} active={sortOption.key === 'co'} onClick={() => handleSortKeyChange('co')} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SortModal;
