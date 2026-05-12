import React, { useState } from 'react';
import { SortKey, useCatalogFilterStore, useCatalogFilterActions } from '@/entities/product';
import { ArrowsUpDownIcon, VerticalSlider } from '@/shared/ui';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; label: string; id: string; className?: string }> = ({ checked, onChange, label, id, className = '' }) => (
    <label htmlFor={id} className={`flex items-center justify-between cursor-pointer py-3 px-4 active:bg-neutral-200/50 dark:active:bg-neutral-800/50 transition-colors ${className}`}>
        <span className="text-light-text dark:text-dark-text-primary text-sm font-medium">{label}</span>
        <div className="relative">
            <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
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
    className={`flex-1 text-center py-2 px-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-neutral-200 hover:bg-neutral-300 text-light-text dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-dark-text-primary'
    }`}
  >
    {label}
  </button>
);

type TabKey = 'ordine' | 'visibilita' | 'emissioni';

interface SortModalProps {
  onClose: () => void;
}

const SortModal: React.FC<SortModalProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('ordine');
  const { sortOption, showRetired, showOutOfCatalog, maxNicotine, maxTar, maxCo, minNicotine, minTar, minCo } = useCatalogFilterStore(useShallow((state) => ({
    sortOption: state.sortOption,
    showRetired: state.showRetired,
    showOutOfCatalog: state.showOutOfCatalog,
    maxNicotine: state.maxNicotine,
    maxTar: state.maxTar,
    maxCo: state.maxCo,
    minNicotine: state.minNicotine,
    minTar: state.minTar,
    minCo: state.minCo
  })));
  const { setSortOption, setShowRetired, setShowOutOfCatalog, setMaxNicotine, setMaxTar, setMaxCo, setMinNicotine, setMinTar, setMinCo } = useCatalogFilterActions();

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
    <div className="absolute inset-x-0 top-0 bottom-[80px] lg:bottom-[104px] z-40 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] pointer-events-auto"
      />

      {/* Bottom Sheet wrapper */}
      <div
        className="relative bg-white dark:bg-dark-card-bg w-full rounded-t-xl shadow-2xl flex flex-col overflow-hidden border-t border-neutral-200 dark:border-dark-border pointer-events-auto"
        style={{ height: '420px', maxHeight: '75dvh' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tabs Header */}
          <div className="flex px-5 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setActiveTab('ordine')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ordine' ? 'border-blue-600 text-blue-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'}`}
            >
              {t('catalog.sort.order', 'Ordine')}
            </button>
            <button
              onClick={() => setActiveTab('visibilita')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'visibilita' ? 'border-blue-600 text-blue-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'}`}
            >
              {t('catalog.sort.visibility', 'Visibilità')}
            </button>
            <button
              onClick={() => setActiveTab('emissioni')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'emissioni' ? 'border-blue-600 text-blue-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'}`}
            >
              {t('catalog.sort.emissions', 'Emissioni')}
            </button>
          </div>

          <div className="px-5 py-5 overflow-y-auto space-y-5">
            {activeTab === 'ordine' && (
              <section>
                <div className="flex justify-between items-center mb-2 px-1">
                     <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px]">
                       {t('catalog.sort.sortBy')}
                     </h3>
                     <button
                        onClick={handleToggleOrder}
                        disabled={isSmartSort}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 disabled:opacity-40"
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
                    <SortKeyButton label={t('catalog.sort.nicotine')} active={sortOption.key === 'nicotine'} onClick={() => handleSortKeyChange('nicotine')} />
                    <SortKeyButton label={t('catalog.sort.tar')} active={sortOption.key === 'tar'} onClick={() => handleSortKeyChange('tar')} />
                    <SortKeyButton label={t('catalog.sort.co')} active={sortOption.key === 'co'} onClick={() => handleSortKeyChange('co')} />
                </div>
              </section>
            )}

            {activeTab === 'visibilita' && (
              <section>
                <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px] mb-2 px-1">
                  {t('catalog.sort.visibility')}
                </h3>
                <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50">
                    <ToggleSwitch
                        id="retired-toggle"
                        label={t('catalog.sort.showRetired')}
                        checked={showRetired}
                        onChange={() => setShowRetired(!showRetired)}
                        className="border-b border-neutral-200/50 dark:border-neutral-800/50"
                    />
                    <ToggleSwitch
                        id="out-of-catalog-toggle"
                        label={t('catalog.sort.showOutOfCatalog')}
                        checked={showOutOfCatalog}
                        onChange={() => setShowOutOfCatalog(!showOutOfCatalog)}
                    />
                </div>
              </section>
            )}

            {activeTab === 'emissioni' && (
              <section>
                 <div className="flex justify-between items-center mb-6 px-1">
                   <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px]">
                     {t('catalog.sort.emissions_limits', 'Limiti Massimi Emissioni')}
                   </h3>
                   <button 
                     onClick={() => {
                       setMaxNicotine(1.0); setMinNicotine(0.1);
                       setMaxTar(10); setMinTar(1);
                       setMaxCo(10); setMinCo(1);
                     }}
                     className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400"
                   >
                     Reset
                   </button>
                 </div>
                 
                 <div className="flex justify-between items-end pb-6 px-1">
                   {/* Nicotina Section */}
                   <div className="flex flex-col items-center">
                     <h4 className="text-[9px] font-bold uppercase tracking-[0.1em] text-neutral-400 dark:text-neutral-500 mb-2">Nicotina</h4>
                     <div className="flex gap-2">
                       <VerticalSlider 
                         label="Min" min={0.1} max={1.0} step={0.1} 
                         value={minNicotine} 
                         onChange={(val) => {
                           setMinNicotine(val);
                           if (val > maxNicotine) setMaxNicotine(val);
                         }} 
                         unit="mg" color="bg-orange-500 dark:bg-orange-600" 
                       />
                       <VerticalSlider 
                         label="Max" min={0.1} max={1.0} step={0.1} 
                         value={maxNicotine} 
                         onChange={(val) => {
                           setMaxNicotine(val);
                           if (val < minNicotine) setMinNicotine(val);
                         }} 
                         unit="mg" 
                       />
                     </div>
                   </div>

                   {/* Catrame Section */}
                   <div className="flex flex-col items-center">
                     <h4 className="text-[9px] font-bold uppercase tracking-[0.1em] text-neutral-400 dark:text-neutral-500 mb-2">Catrame</h4>
                     <div className="flex gap-2">
                       <VerticalSlider 
                         label="Min" min={1} max={10} step={1} 
                         value={minTar} 
                         onChange={(val) => {
                           setMinTar(val);
                           if (val > maxTar) setMaxTar(val);
                         }} 
                         unit="mg" color="bg-orange-500 dark:bg-orange-600" 
                       />
                       <VerticalSlider 
                         label="Max" min={1} max={10} step={1} 
                         value={maxTar} 
                         onChange={(val) => {
                           setMaxTar(val);
                           if (val < minTar) setMinTar(val);
                         }} 
                         unit="mg" 
                       />
                     </div>
                   </div>

                   {/* CO Section */}
                   <div className="flex flex-col items-center">
                     <h4 className="text-[9px] font-bold uppercase tracking-[0.1em] text-neutral-400 dark:text-neutral-500 mb-2">CO</h4>
                     <div className="flex gap-2">
                       <VerticalSlider 
                         label="Min" min={1} max={10} step={1} 
                         value={minCo} 
                         onChange={(val) => {
                           setMinCo(val);
                           if (val > maxCo) setMaxCo(val);
                         }} 
                         unit="mg" color="bg-orange-500 dark:bg-orange-600" 
                       />
                       <VerticalSlider 
                         label="Max" min={1} max={10} step={1} 
                         value={maxCo} 
                         onChange={(val) => {
                           setMaxCo(val);
                           if (val < minCo) setMinCo(val);
                         }} 
                         unit="mg" 
                       />
                     </div>
                   </div>
                 </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortModal;
