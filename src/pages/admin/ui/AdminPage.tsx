import React, { useState } from 'react';
import { useAuth } from '@/entities/session';
import { ShieldAlert, Zap, FileText, Cpu, Newspaper } from 'lucide-react';
import { PDFUploader } from '@/features/pdf-upload';
import { ADMAutoUpdater, ADMNewsScanner } from '@/features/system-update';
import { useADMSyncStore, useADMSyncActions } from '@/entities/product';
import { productRepository } from '@/shared/api';
import { useTranslation } from 'react-i18next';
import { MoreVertical, RotateCcw } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'news' | 'auto' | 'manual'>('news');
  const aiModel = useADMSyncStore(s => s.aiModel);
  const { setAiModel } = useADMSyncActions();
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (!window.confirm("Sei sicuro di voler ripristinare il catalogo dall'ultimo backup? Questa operazione sovrascriverà tutti i dati attuali.")) {
      return;
    }

    setIsRestoring(true);
    setShowBackupMenu(false);
    try {
      await productRepository.restoreCatalogBackup();
      alert("Catalogo ripristinato con successo! La pagina verrà ricaricata per applicare le modifiche.");
      // Force reload to sync the state
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Errore durante il ripristino del backup.");
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">{t('admin.denied')}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {t('admin.deniedSubtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-10 min-h-full">
      <div className="p-3 lg:p-6 space-y-4 w-full max-w-5xl mx-auto">
        


        {/* Tab System */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 -mx-3 px-3 bg-white dark:bg-neutral-900 sticky top-0 z-10 lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:m-0 lg:gap-4 lg:mb-4">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 text-xs lg:text-sm font-black uppercase tracking-widest border-b-2 lg:rounded-2xl lg:border-2 ${
              activeTab === 'news' 
                ? 'border-amber-600 text-amber-600 lg:bg-amber-50 dark:lg:bg-amber-900/10 lg:shadow-lg lg:shadow-amber-500/10' 
                : 'border-transparent text-neutral-400 hover:text-neutral-600 lg:bg-white dark:lg:bg-neutral-800 lg:border-neutral-200 dark:lg:border-neutral-700 shadow-sm'
            }`}
          >
            <Newspaper className={`w-3.5 h-3.5 lg:w-5 lg:h-5 ${activeTab === 'news' ? 'fill-current/20' : ''}`} />
            {t('admin.tabs.news')}
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 text-xs lg:text-sm font-black uppercase tracking-widest border-b-2 lg:rounded-2xl lg:border-2 ${
              activeTab === 'auto' 
                ? 'border-blue-600 text-blue-600 lg:bg-blue-50 dark:lg:bg-blue-900/10 lg:shadow-lg lg:shadow-blue-500/10' 
                : 'border-transparent text-neutral-400 hover:text-neutral-600 lg:bg-white dark:lg:bg-neutral-800 lg:border-neutral-200 dark:lg:border-neutral-700 shadow-sm'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 lg:w-5 lg:h-5 ${activeTab === 'auto' ? 'fill-current' : ''}`} />
            {t('admin.tabs.auto')}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 py-3 lg:py-4 text-xs lg:text-sm font-black uppercase tracking-widest border-b-2 lg:rounded-2xl lg:border-2 ${
              activeTab === 'manual' 
                ? 'border-blue-600 text-blue-600 lg:bg-blue-50 dark:lg:bg-blue-900/10 lg:shadow-lg lg:shadow-blue-500/10' 
                : 'border-transparent text-neutral-400 hover:text-neutral-600 lg:bg-white dark:lg:bg-neutral-800 lg:border-neutral-200 dark:lg:border-neutral-700 shadow-sm'
            }`}
          >
            <FileText className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
            {t('admin.tabs.manual')}
          </button>

          {/* Independent Backup/Restore Menu */}
          <div className="relative flex items-center ml-1 lg:ml-2">
            <button 
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="p-3 lg:p-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 bg-white dark:bg-neutral-900 border-b-2 border-transparent lg:bg-white dark:lg:bg-neutral-800 lg:border-2 lg:border-neutral-200 dark:lg:border-neutral-700 lg:rounded-2xl shadow-sm transition-all"
              aria-label="Opzioni Backup"
            >
              <MoreVertical className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>

            {/* Dropdown Menu */}
            {showBackupMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowBackupMenu(false)} />
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-700 z-30 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-700 mb-1">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Gestione Database</p>
                  </div>
                  <button
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                    RIPRISTINA ULTIMO BACKUP
                  </button>

                  <div className="px-4 py-2 border-b border-t border-neutral-100 dark:border-neutral-700 mt-2 mb-1 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t('admin.aiModel')}</p>
                  </div>
                  <div className="px-2 py-1 space-y-1">
                    <button 
                      onClick={() => { setAiModel('gemini-3-flash-preview'); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-colors ${aiModel === 'gemini-3-flash-preview' ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'}`}
                    >
                      Flash (Standard)
                    </button>
                    <button 
                      onClick={() => { setAiModel('gemini-3.1-flash-lite-preview'); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-colors ${aiModel === 'gemini-3.1-flash-lite-preview' ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'}`}
                    >
                      Flash-Lite (Veloce)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
 
        {/* Tools */}
        <section className="space-y-3 pt-2 lg:pt-0">
          <div className={`${activeTab === 'manual' ? 'lg:bg-white lg:dark:bg-neutral-900 lg:p-8 lg:rounded-3xl lg:shadow-xl lg:border lg:border-neutral-100 lg:dark:border-neutral-800' : 'w-full'}`}>
            {activeTab === 'news' && <ADMNewsScanner />}
            {activeTab === 'auto' && <ADMAutoUpdater />}
            {activeTab === 'manual' && <PDFUploader />}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminPage;
