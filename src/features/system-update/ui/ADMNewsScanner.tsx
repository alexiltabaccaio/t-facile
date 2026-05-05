import React from 'react';
import { CheckCircle, Loader2, ArrowRight, XCircle, AlertTriangle, Newspaper } from 'lucide-react';
import { useADMSyncStore, useADMSyncActions, PDFPreviewTable } from '@/entities/product';
import { useCatalogStore, useCatalogActions } from '@/entities/product';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

import { ADMUpdateItem } from './ADMUpdateItem';

export const ADMNewsScanner: React.FC = () => {
  const { t } = useTranslation();
  const {
    isChecking,
    isProcessing,
    statusMsg,
    availableUpdates,
    processedData,
    error,
    success,
    currentNews,
    hasScannedNews
  } = useADMSyncStore(useShallow((state: any) => ({
    isChecking: state.isChecking,
    isProcessing: state.isProcessing,
    statusMsg: state.statusMsg,
    availableUpdates: state.availableUpdates,
    processedData: state.processedData,
    error: state.error,
    success: state.success,
    currentNews: state.currentNews,
    hasScannedNews: state.hasScannedNews
  })));

  const {
    checkNewsUpdates,
    toggleSelection,
    toggleAll,
    processSelectedListini,
    finalSaveToDatabase,
    cancelStaging,
    cancelProcessing
  } = useADMSyncActions();

  const { lastUpdateDate, products, categoryDates } = useCatalogStore(useShallow((state: any) => ({
    lastUpdateDate: state.lastUpdateDate,
    products: state.products,
    categoryDates: state.categoryDates
  })));
  const { setLastUpdateDate } = useCatalogActions();

  const handleFinalSave = async () => {
    await finalSaveToDatabase({
      lastUpdateDate,
      products,
      categoryDates,
      onSuccess: (finalDate: string) => setLastUpdateDate(finalDate)
    });
  };

  const isNovitaMode = availableUpdates.length > 0 && availableUpdates[0].type === 'Novità';
  const isMyProcessing = isProcessing && currentNews !== null;
  const isMyStaging = processedData && !isProcessing && currentNews !== null;
  const isMySuccess = success && !isProcessing && currentNews !== null;
  const isMyError = error && !isProcessing && currentNews !== null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/5 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-4 lg:p-6 shadow-sm w-full mb-6 transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <button 
          onClick={checkNewsUpdates}
          disabled={isChecking || isProcessing}
          className="w-full px-6 py-3 bg-amber-600 text-white font-black text-[10px] sm:text-xs rounded-xl hover:bg-amber-700 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {t('admin.news.checking')}
            </>
          ) : t('admin.news.search')}
        </button>
      </div>

      {/* Processing Status Area */}
      {isMyProcessing && (
         <div className="bg-amber-100/50 dark:bg-amber-900/30 rounded p-4 flex flex-col items-center justify-center mt-4 border border-amber-200 dark:border-amber-800">
           <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
           <p className="text-sm font-bold text-amber-800 dark:text-amber-200 text-center mb-4 leading-relaxed max-w-sm">{statusMsg}</p>
           <button 
             onClick={cancelProcessing}
             className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold uppercase rounded-lg transition-colors border border-red-200 dark:border-red-800/50"
           >
             <XCircle className="w-4 h-4" />
             {t('admin.auto.stop')}
           </button>
         </div>
      )}

      {/* Staging Control (Summary Table) */}
      {isMyStaging && (
          <PDFPreviewTable 
            parsedData={processedData} 
            onCancel={cancelStaging}
            onSave={handleFinalSave}
          />
      )}

      {/* Success */}
      {isMySuccess && (
        <div className="bg-green-100/50 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded p-3 flex items-center gap-2 text-xs font-bold mt-4">
          <CheckCircle className="w-4 h-4 text-green-500" />
          {t('admin.news.success')}
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
         </div>
      )}

      {/* List of found news updates */}
      {availableUpdates.length > 0 && isNovitaMode && !isProcessing && !processedData && (
        <div className="mt-4 flex flex-col">
          <div className="mb-3 space-y-4">
            <button 
              onClick={processSelectedListini}
              disabled={availableUpdates.filter((u: any) => u.selected).length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 shadow-md disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              {t('admin.news.analyze')} ({availableUpdates.filter((u: any) => u.selected).length})
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="flex justify-between items-center px-1">
              <button 
                onClick={toggleAll}
                className="text-[10px] font-bold text-neutral-500 uppercase hover:text-amber-600 transition-colors"
              >
                {availableUpdates.every((u: any) => u.selected) ? t('admin.auto.deselectAll') : t('admin.auto.selectAll')}
              </button>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                {availableUpdates.filter((u: any) => u.selected).length} selezionati
              </span>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[55vh] pr-2 pb-2 scrollbar-thin scrollbar-thumb-amber-300 dark:scrollbar-thumb-amber-600">
            {availableUpdates.map((listino: any, i: number) => (
              <ADMUpdateItem 
                key={i} 
                listino={{...listino, category: listino.title}} // Show title instead of category
                categoryDate={categoryDates[listino.category] || ''} 
                onToggle={() => toggleSelection(i)} 
              />
            ))}
          </div>
        </div>
      )}
      
      {!isChecking && hasScannedNews && availableUpdates.length === 0 && !processedData && !success && !error && (
        <div className="py-8 flex flex-col items-center justify-center text-amber-800/40 dark:text-amber-400/20">
          <Newspaper className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-xs font-black uppercase tracking-widest text-center px-4">
            {t('admin.news.noNovita')}
          </p>
        </div>
      )}
    </div>
  );
};
