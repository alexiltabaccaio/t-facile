import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { ShieldAlert, Zap, FileText, Cpu } from 'lucide-react';
import { PDFUploader, ADMAutoUpdater, useADMSyncStore, useADMSyncActions } from '@/features/admin';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const aiModel = useADMSyncStore(s => s.aiModel);
  const { setAiModel } = useADMSyncActions();

  if (!isAdmin) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-neutral-900/40">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Accesso Negato</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          Questa area è riservata agli amministratori del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/40 pb-20 lg:pb-10 min-h-full">
      <div className="p-3 lg:p-6 space-y-4 w-full max-w-5xl mx-auto">
        
        {/* Desktop Header for Admin */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tight">
              Pannello Admin
            </h1>
            <p className="text-sm text-neutral-500 font-medium">Gestione automatizzata dei listini</p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-2xl px-4 py-2 border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center gap-2 mr-3 border-r border-neutral-100 dark:border-neutral-700 pr-3">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Modello IA</span>
            </div>
            <select 
              value={aiModel} 
              onChange={(e) => setAiModel(e.target.value)}
              className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider bg-transparent border-none focus:ring-0 p-0 outline-none cursor-pointer"
            >
              <option value="gemini-3-flash-preview">FLASH</option>
              <option value="gemini-3.1-flash-lite-preview">FLASH-LITE</option>
            </select>
          </div>
        </div>

        {/* Tab System */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 -mx-3 px-3 bg-white dark:bg-neutral-900 sticky top-0 z-10 lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:m-0 lg:gap-4 lg:mb-4">
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 lg:py-4 text-xs lg:text-sm font-black uppercase tracking-widest border-b-2 lg:rounded-2xl lg:border-2 ${
              activeTab === 'auto' 
                ? 'border-blue-600 text-blue-600 lg:bg-blue-50 dark:lg:bg-blue-900/10 lg:shadow-lg lg:shadow-blue-500/10' 
                : 'border-transparent text-neutral-400 hover:text-neutral-600 lg:bg-white dark:lg:bg-neutral-800 lg:border-neutral-200 dark:lg:border-neutral-700 shadow-sm'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 lg:w-5 lg:h-5 ${activeTab === 'auto' ? 'fill-current' : ''}`} />
            Pilota Auto
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-3 py-3 lg:py-4 text-xs lg:text-sm font-black uppercase tracking-widest border-b-2 lg:rounded-2xl lg:border-2 ${
              activeTab === 'manual' 
                ? 'border-blue-600 text-blue-600 lg:bg-blue-50 dark:lg:bg-blue-900/10 lg:shadow-lg lg:shadow-blue-500/10' 
                : 'border-transparent text-neutral-400 hover:text-neutral-600 lg:bg-white dark:lg:bg-neutral-800 lg:border-neutral-200 dark:lg:border-neutral-700 shadow-sm'
            }`}
          >
            <FileText className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
            Lettore PDF
          </button>
        </div>
 
        {/* Strumenti */}
        <section className="space-y-3 pt-2 lg:pt-0">
          <div className={`${activeTab === 'manual' ? 'lg:bg-white lg:dark:bg-neutral-900 lg:p-8 lg:rounded-3xl lg:shadow-xl lg:border lg:border-neutral-100 lg:dark:border-neutral-800' : 'w-full'}`}>
            {activeTab === 'auto' && <ADMAutoUpdater />}
            {activeTab === 'manual' && <PDFUploader />}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminPage;
