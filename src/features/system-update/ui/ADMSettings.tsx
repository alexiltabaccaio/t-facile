import React, { useState } from 'react';
import { Cpu, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { useADMSyncStore, useADMSyncActions } from '@/entities/product';
import { productRepository } from '@/shared/api';
import { useTranslation } from 'react-i18next';

export const ADMSettings: React.FC = () => {
  const { t } = useTranslation();
  const aiModel = useADMSyncStore(s => s.aiModel);
  const { setAiModel } = useADMSyncActions();
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const performRestore = async () => {
    if (confirmText.toLowerCase() !== t('admin.settings.restore.confirmationString').toLowerCase()) return;
    setIsRestoring(true);
    setShowRestoreConfirm(false);
    setConfirmText('');
    try {
      await productRepository.restoreCatalogBackup();
      alert(t('admin.settings.restore.success'));
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(err.message || t('admin.settings.restore.error'));
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 lg:p-6 shadow-sm transition-all mb-4">
        <div className="w-full">
          {!showRestoreConfirm ? (
            <button
              onClick={() => setShowRestoreConfirm(true)}
              disabled={isRestoring}
              className="group relative w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-black text-[10px] sm:text-xs rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 overflow-hidden uppercase tracking-widest"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <RotateCcw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRestoring ? 'animate-spin' : ''}`} />
              <span>{t('admin.settings.restore.button')}</span>
            </button>
          ) : (
            <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder={t('admin.settings.restore.confirmPlaceholder')}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/40 rounded-xl text-red-900 dark:text-red-100 text-[10px] sm:text-xs font-bold placeholder:text-red-400 dark:placeholder:text-red-800/60 focus:outline-none focus:border-red-500 transition-all uppercase tracking-widest"
                />
                {confirmText.toLowerCase() === t('admin.settings.restore.confirmationString').toLowerCase() && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => { setShowRestoreConfirm(false); setConfirmText(''); }}
                  className="flex-1 py-3 px-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-500 text-[10px] font-black uppercase rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {t('admin.settings.restore.cancel')}
                </button>
                <button 
                  disabled={confirmText.toLowerCase() !== t('admin.settings.restore.confirmationString').toLowerCase() || isRestoring}
                  onClick={performRestore}
                  className="flex-[2] py-3 px-4 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  {isRestoring ? t('admin.settings.restore.restoring') : t('admin.settings.restore.confirm')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Model Selection Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 lg:p-6 shadow-sm transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            {t('admin.settings.ai.title')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={() => { setAiModel('gemini-3-flash-preview'); }}
            className={`group relative flex items-center justify-center gap-2 px-6 py-3 font-black text-[10px] sm:text-xs rounded-xl transition-all uppercase tracking-widest border-2 ${
              aiModel === 'gemini-3-flash-preview' 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-blue-200 dark:hover:border-blue-800'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${aiModel === 'gemini-3-flash-preview' ? 'text-white' : 'text-neutral-400'}`} />
            <span>{t('admin.settings.ai.flash')}</span>
          </button>

          <button 
            onClick={() => { setAiModel('gemini-3.1-flash-lite-preview'); }}
            className={`group relative flex items-center justify-center gap-2 px-6 py-3 font-black text-[10px] sm:text-xs rounded-xl transition-all uppercase tracking-widest border-2 ${
              aiModel === 'gemini-3.1-flash-lite-preview' 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-blue-200 dark:hover:border-blue-800'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${aiModel === 'gemini-3.1-flash-lite-preview' ? 'text-white' : 'text-neutral-400'}`} />
            <span>{t('admin.settings.ai.lite')}</span>
          </button>
        </div>
      </div>


    </>
  );
};
