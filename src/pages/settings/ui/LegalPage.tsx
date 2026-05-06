import React from 'react';
import { Cookie, UserCheck, AlertTriangle, Globe, Activity, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LegalPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-grow overflow-y-auto min-h-full">
      <div className="p-6 max-w-lg mx-auto space-y-8 flex flex-col items-center pb-20">
        <div className="w-full space-y-6 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
          <p>
            {t('legalPage.description')}
          </p>
        </div>

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 text-neutral-900 dark:text-white">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('legalPage.disclaimerTitle')}</h3>
          </div>
          <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            <p>{t('legalPage.disclaimerDesc')}</p>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 text-neutral-900 dark:text-white">
            <Globe className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('legalPage.affiliationTitle')}</h3>
          </div>
          <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            <p>{t('legalPage.affiliationDesc')}</p>
          </div>
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

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 text-neutral-900 dark:text-white">
            <Activity className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('legalPage.analyticsTitle')}</h3>
          </div>
          <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            <p>{t('legalPage.analyticsDesc')}</p>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 text-neutral-900 dark:text-white">
            <Bookmark className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">{t('legalPage.trademarksTitle')}</h3>
          </div>
          <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
            <p>{t('legalPage.trademarksDesc')}</p>
          </div>
        </div>

        <div className="pt-8 text-center pb-8">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">{t('legalPage.effectiveDate', { date: '06/05/2026' })}</p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
