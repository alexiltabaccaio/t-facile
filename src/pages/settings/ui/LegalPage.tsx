import React from 'react';
import { Scale, Cookie, UserCheck, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LegalPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-grow overflow-y-auto bg-white dark:bg-neutral-900/40 min-h-full">
      <div className="p-4 max-w-lg mx-auto space-y-6 pb-20">
        <section className="bg-neutral-50 dark:bg-dark-card-bg border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <Scale className="w-6 h-6" />
            <h2 className="font-bold uppercase tracking-widest text-xs">{t('legalPage.title')}</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
            {t('legalPage.description')}
          </p>
          <div className="pt-2 text-[10px] text-neutral-400 dark:text-neutral-600 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            <span>{t('legalPage.lastCheck', { date: '22 Aprile 2026' })}</span>
          </div>
        </section>

        <section className="bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <UserCheck className="w-6 h-6" />
            <h2 className="font-bold uppercase tracking-widest text-xs">{t('legalPage.gdprTitle')}</h2>
          </div>
          <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <p>
              {t('legalPage.gdprDesc1')}
            </p>
            <p>
              {t('legalPage.gdprDesc2')}
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <Cookie className="w-6 h-6" />
            <h2 className="font-bold uppercase tracking-widest text-xs">{t('legalPage.cacheTitle')}</h2>
          </div>
          <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <p>
              {t('legalPage.cacheDesc1')}
            </p>
            <p>
              {t('legalPage.cacheDesc2')}
            </p>
            <p className="text-xs border-l-2 border-amber-200 dark:border-amber-900 pl-3 italic">
              {t('legalPage.cacheDesc3')}
            </p>
          </div>
        </section>

        <div className="pt-8 text-center">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">{t('legalPage.effectiveDate', { date: '22/04/2026' })}</p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
