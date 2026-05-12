import React from 'react';
import { CheckCircle, Loader2, ArrowRight, XCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { 
  useADMSyncStore, 
  useADMSyncActions, 
  PDFPreviewTable, 
  useCatalogDataStore, 
  useCatalogSyncStore, 
  useCatalogSyncActions 
} from '@/entities/product';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

import { ADMUpdateItem } from './ADMUpdateItem';

export const ADMAutoUpdater: React.FC = () => {
  const { t } = useTranslation();
  const {
    isChecking,
    isProcessing,
    statusMsg,
    availableUpdates,
    processedData,
    error,
    success,
    currentNews
  } = useADMSyncStore(useShallow(state => ({
    isChecking: state.isChecking,
    isProcessing: state.isProcessing,
    statusMsg: state.statusMsg,
    availableUpdates: state.availableUpdates,
    processedData: state.processedData,
    error: state.error,
    success: state.success,
    currentNews: state.currentNews
  })));

  const {
    checkUpdates,
    toggleSelection,
    toggleAll,
    processSelectedListini,
    finalSaveToDatabase,
    cancelStaging,
    cancelProcessing,
    downloadSelectedListini
  } = useADMSyncActions();

  // Selected from Catalog Stores to decouple it from ADM Sync Store logic
  const { lastUpdateDate, categoryDates } = useCatalogSyncStore(useShallow(state => ({
    lastUpdateDate: state.lastUpdateDate,
    categoryDates: state.categoryDates
  })));
  
  const products = useCatalogDataStore(state => state.products);
  
  const { setLastUpdateDate } = useCatalogSyncActions();

  const [sendNotification, setSendNotification] = React.useState<boolean>(true);

  const handleFinalSave = async () => {
    await finalSaveToDatabase({
      lastUpdateDate,
      products,
      categoryDates,
      skipNotifications: !sendNotification,
      onSuccess: (finalDate) => setLastUpdateDate(finalDate)
    });
  };

  const isMyProcessing = isProcessing && !currentNews;
  const isMyStaging = processedData && !isProcessing && !currentNews;
  const isMySuccess = success && !isProcessing && !currentNews;
  const isMyError = error && !isProcessing && !currentNews;

  const hasUpdates = availableUpdates.length > 0 && availableUpdates[0].type !== 'Novità' && !isProcessing && !processedData;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-4 lg:p-6 shadow-sm w-full mb-2 transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        {hasUpdates ? (
          <div className="flex w-full overflow-hidden rounded-xl shadow-lg shadow-blue-500/20">
            <button 
              onClick={processSelectedListini}
              disabled={availableUpdates.filter(u => u.selected).length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-black text-[10px] sm:text-xs hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest border-r border-blue-500/40"
            >
              {t('admin.auto.analyzeCount', { count: availableUpdates.filter(u => u.selected).length })}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={downloadSelectedListini}
              disabled={availableUpdates.filter(u => u.selected).length === 0 || isProcessing}
              className="w-12 sm:w-14 bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 flex items-center justify-center border-r border-blue-500/40 group"
              title={t('admin.auto.download')}
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={checkUpdates}
              disabled={isChecking || isProcessing}
              className="w-12 sm:w-14 bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 flex items-center justify-center group"
              title={t('admin.auto.search')}
            >
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              )}
            </button>
          </div>
        ) : (
          <button 
            onClick={checkUpdates}
            disabled={isChecking || isProcessing}
            className="w-full px-6 py-3 bg-blue-600 text-white font-black text-[10px] sm:text-xs rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t('admin.auto.checking')}
              </>
            ) : t('admin.auto.search')}
          </button>
        )}
      </div>

      {/* Processing Status Area */}
      {isMyProcessing && (
         <div className="bg-blue-100/50 dark:bg-blue-900/30 rounded p-4 flex flex-col items-center justify-center mt-4 border border-blue-200 dark:border-blue-800">
           <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
           {/* @ts-expect-error - dynamic translation key */}
           <p className="text-sm font-bold text-blue-800 dark:text-blue-200 text-center mb-4 leading-relaxed max-w-sm">{t(statusMsg)}</p>
           <button 
             onClick={cancelProcessing}
             className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold uppercase rounded-lg transition-colors border border-red-200 dark:border-red-800/50"
           >
             <XCircle className="w-4 h-4" />
             {t('admin.auto.stop')}
           </button>
         </div>
      )}

      {/* Staging Control (Human-in-the-loop) */}
      {isMyStaging && (
        <>
          {/* Notification Toggle Card */}
          <div 
            onClick={() => setSendNotification(!sendNotification)}
            className={`mb-4 bg-white dark:bg-neutral-800 border rounded-2xl p-4 shadow-sm cursor-pointer transition-all flex items-center justify-between group ${
              sendNotification 
                ? 'border-blue-200 dark:border-blue-900/40 bg-blue-50/10' 
                : 'border-neutral-200 dark:border-neutral-800'
            }`}
          >
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${
                sendNotification ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'
              }`}>
                {t('admin.news.notifyUsers')}
              </label>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-tight max-w-[200px]">
                {sendNotification 
                  ? t('admin.news.notifyUsersDesc')
                  : t('admin.news.silentUpdateDesc')}
              </p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${
              sendNotification ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                sendNotification ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </div>

          <PDFPreviewTable 
            parsedData={processedData} 
            onCancel={cancelStaging}
            onSave={handleFinalSave}
          />
        </>
      )}

      {/* Success */}
      {isMySuccess && (
        <div className="bg-green-100/50 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded p-3 flex items-center gap-2 text-xs font-bold mt-4">
          <CheckCircle className="w-4 h-4 text-green-500" />
          {t('admin.auto.success')}
        </div>
      )}

      {/* Errors */}
      {isMyError && (
         <div className="bg-red-100/50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-xl p-4 flex flex-col gap-2 mt-4 border border-red-200/50 dark:border-red-800/20 relative group">
           <div className="flex items-start gap-2 pr-8">
             <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
             <div className="text-xs font-medium break-words overflow-hidden">
               {error}
             </div>
           </div>
           <button 
             onClick={() => {
               navigator.clipboard.writeText(error!).then(() => {
                 const btn = document.getElementById('copy-btn-adm');
                 if (btn) btn.innerText = t('admin.auto.copied') as string;
                 setTimeout(() => { if(btn) btn.innerText = t('admin.auto.copy') as string; }, 2000);
               });
             }}
             id="copy-btn-adm"
             className="absolute top-4 right-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] uppercase font-black px-2 py-1 rounded border border-red-200 dark:border-red-700 hover:bg-red-200 transition-colors"
           >
             {t('admin.auto.copy')}
           </button>
         </div>
      )}

      {/* List of found updates */}
      {availableUpdates.length > 0 && availableUpdates[0].type !== 'Novità' && !isProcessing && !processedData && (
        <div className="mt-4 flex flex-col">
          <div className="mb-3 space-y-4">
            <div className="flex justify-between items-center px-1">
              <button 
                onClick={toggleAll}
                className="text-[10px] font-bold text-neutral-500 uppercase hover:text-blue-600 transition-colors"
              >
                {availableUpdates.every(u => u.selected) ? t('admin.auto.deselectAll') : t('admin.auto.selectAll')}
              </button>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                {t('admin.auto.selectedCount', { count: availableUpdates.filter(u => u.selected).length })}
              </span>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[55vh] pr-2 pb-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600">
            {availableUpdates.map((listino, i) => (
              <ADMUpdateItem 
                key={i} 
                listino={listino} 
                categoryDate={categoryDates[listino.category] || ''} 
                onToggle={() => toggleSelection(i)} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
