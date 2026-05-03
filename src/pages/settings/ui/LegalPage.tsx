import React from 'react';
import { Scale, Cookie, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LegalPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-grow overflow-y-auto min-h-full">
      <div className="p-6 max-w-lg mx-auto space-y-8 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Scale className="w-16 h-16 mx-auto mb-4 text-neutral-900 dark:text-white" strokeWidth={1.5} />
          <h2 className="text-2xl font-black tracking-tight">{t('legalPage.title')}</h2>
          <p className="text-neutral-400 text-xs uppercase tracking-[0.3em] font-bold">
             {t('legalPage.lastCheck', { date: '22 Apr 2026' })}
          </p>
        </div>

        <div className="w-full space-y-6 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
          <p>
            {t('legalPage.description')}
          </p>
        </div>

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 text-neutral-900 dark:text-white">
            <UserCheck className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('legalPage.gdprTitle')}</h3>
          </div>
          
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            <p>
              {t('legalPage.gdprDesc1')}
            </p>
            <p>
              {t('legalPage.gdprDesc2')}
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 text-neutral-900 dark:text-white">
            <Cookie className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('legalPage.cacheTitle')}</h3>
          </div>
          
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            <p>
              {t('legalPage.cacheDesc1')}
            </p>
            <p>
              {t('legalPage.cacheDesc2')}
            </p>
            <p className="text-xs border-l-2 border-neutral-200 dark:border-neutral-800 pl-3 italic">
              {t('legalPage.cacheDesc3')}
            </p>
          </div>
        </div>

        <div className="pt-8 text-center">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">{t('legalPage.effectiveDate', { date: '22/04/2026' })}</p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
