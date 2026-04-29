import React from 'react';
import { CheckCircle, Loader2, ArrowRight, XCircle, AlertTriangle } from 'lucide-react';
import { useADMSyncStore, useADMSyncActions } from '../store/useADMSyncStore';
import { useCatalogStore } from '@/entities/product';
import { PDFPreviewTable } from './PDFPreviewTable';
import { useShallow } from 'zustand/react/shallow';

import { ADMUpdateItem } from './ADMUpdateItem';

export const ADMAutoUpdater: React.FC = () => {
  const {
    isChecking,
    isProcessing,
    statusMsg,
    availableUpdates,
    processedData,
    error,
    success
  } = useADMSyncStore(useShallow(state => ({
    isChecking: state.isChecking,
    isProcessing: state.isProcessing,
    statusMsg: state.statusMsg,
    availableUpdates: state.availableUpdates,
    processedData: state.processedData,
    error: state.error,
    success: state.success
  })));

  const {
    checkUpdates,
    toggleSelection,
    toggleAll,
    processSelectedListini,
    finalSaveToDatabase,
    cancelStaging,
    cancelProcessing
  } = useADMSyncActions();

  const categoryDates = useCatalogStore(state => state.categoryDates);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-4 lg:p-6 shadow-sm w-full mb-2 transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <button 
          onClick={checkUpdates}
          disabled={isChecking || isProcessing}
          className="w-full px-6 py-3 bg-blue-600 text-white font-black text-[10px] sm:text-xs rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Verifica in corso...
            </>
          ) : 'Cerca Nuovi Listini'}
        </button>
      </div>

      {/* Area Status Processing */}
      {isProcessing && (
         <div className="bg-blue-100/50 dark:bg-blue-900/30 rounded p-4 flex flex-col items-center justify-center mt-4 border border-blue-200 dark:border-blue-800">
           <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
           <p className="text-sm font-bold text-blue-800 dark:text-blue-200 text-center mb-4 leading-relaxed max-w-sm">{statusMsg}</p>
           <button 
             onClick={cancelProcessing}
             className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold uppercase rounded-lg transition-colors border border-red-200 dark:border-red-800/50"
           >
             <XCircle className="w-4 h-4" />
             Interrompi
           </button>
         </div>
      )}

      {/* Controllo Staging (Human-in-the-loop) */}
      {processedData && !isProcessing && (
          <PDFPreviewTable 
            parsedData={processedData} 
            onCancel={cancelStaging}
            onSave={finalSaveToDatabase}
          />
      )}

      {/* Success */}
      {success && !isProcessing && (
        <div className="bg-green-100/50 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded p-3 flex items-center gap-2 text-xs font-bold mt-4">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Database aggiornato con successo!
        </div>
      )}

      {/* Errori */}
      {error && !isProcessing && (
         <div className="bg-red-100/50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-xl p-4 flex flex-col gap-2 mt-4 border border-red-200/50 dark:border-red-800/20 relative group">
           <div className="flex items-start gap-2 pr-8">
             <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
             <div className="text-xs font-medium break-words overflow-hidden">
               {error}
             </div>
           </div>
           <button 
             onClick={() => {
               navigator.clipboard.writeText(error).then(() => {
                 const btn = document.getElementById('copy-btn-adm');
                 if (btn) btn.innerText = "Copiato!";
                 setTimeout(() => { if(btn) btn.innerText = "Copia"; }, 2000);
               });
             }}
             id="copy-btn-adm"
             className="absolute top-4 right-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] uppercase font-black px-2 py-1 rounded border border-red-200 dark:border-red-700 hover:bg-red-200 transition-colors"
           >
             Copia
           </button>
         </div>
      )}

      {/* Lista aggiornamenti trovati */}
      {availableUpdates.length > 0 && !isProcessing && !processedData && (
        <div className="mt-4 flex flex-col">
          <div className="mb-3 space-y-4">
            <button 
              onClick={processSelectedListini}
              disabled={availableUpdates.filter(u => u.selected).length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              Analizza {availableUpdates.filter(u => u.selected).length} listini con IA
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-center px-1">
              <button 
                onClick={toggleAll}
                className="text-[10px] font-bold text-neutral-500 uppercase hover:text-blue-600 transition-colors"
              >
                {availableUpdates.every(u => u.selected) ? 'Deseleziona tutto' : 'Seleziona tutto'}
              </button>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                {availableUpdates.filter(u => u.selected).length} selezionati
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
