import React, { useState } from 'react';
import { useAuth } from '@/entities/session';
import { ShieldAlert, Zap, FileText, Newspaper, MoreVertical } from 'lucide-react';
import { PDFUploader } from '@/features/pdf-upload';
import { ADMAutoUpdater, ADMNewsScanner, ADMSettings } from '@/features/system-update';
import { useTranslation } from 'react-i18next';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'news' | 'auto' | 'manual' | 'db'>('news');

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

          {/* Database/Settings Tab (Three Dots) */}
          <div className="relative flex items-center ml-1 lg:ml-2">
            <button 
              onClick={() => setActiveTab('db')}
              className={`p-3 lg:p-4 border-b-2 lg:rounded-2xl lg:border-2 shadow-sm transition-all ${
                activeTab === 'db' 
                  ? 'border-blue-600 text-blue-600 lg:bg-blue-50 dark:lg:bg-blue-900/10 lg:shadow-lg lg:shadow-blue-500/10' 
                  : 'border-transparent text-neutral-400 hover:text-neutral-600 lg:bg-white dark:lg:bg-neutral-800 lg:border-neutral-200 dark:lg:border-neutral-700'
              }`}
              aria-label="Database e Modelli"
            >
              <MoreVertical className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
 
        {/* Tools */}
        <section className="space-y-3 pt-2 lg:pt-0">
          <div className={`${activeTab === 'manual' ? 'lg:bg-white lg:dark:bg-neutral-900 lg:p-8 lg:rounded-3xl lg:shadow-xl lg:border lg:border-neutral-100 lg:dark:border-neutral-800' : 'w-full'}`}>
            {activeTab === 'news' && <ADMNewsScanner />}
            {activeTab === 'auto' && <ADMAutoUpdater />}
            {activeTab === 'manual' && <PDFUploader />}
            {activeTab === 'db' && <ADMSettings />}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminPage;
