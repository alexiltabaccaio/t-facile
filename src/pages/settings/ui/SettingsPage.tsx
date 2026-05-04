import React from 'react';
import { ChevronRightIcon } from '@/shared/ui';
import { useThemeStore, useThemeActions } from '@/shared/lib';
import { useAuth } from '@/entities/session';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthAvatar } from '@/features/auth';

const SegmentedButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
            active
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
        }`}
    >
        {label}
    </button>
);

const InfoRow: React.FC<{ label: string; onClick: () => void; disabled?: boolean }> = ({ label, onClick, disabled }) => (
    <button 
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`flex items-center justify-between w-full text-left px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 transition-all ${
            disabled 
                ? 'opacity-40 cursor-not-allowed' 
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/30'
        }`}
    >
        <span className={`text-sm font-semibold ${disabled ? 'text-neutral-400 dark:text-neutral-600' : 'text-light-text dark:text-dark-text-primary'}`}>{label}</span>
        <ChevronRightIcon className={`h-4 w-4 ${disabled ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-400 dark:text-neutral-600'}`} />
    </button>
);

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentTheme = useThemeStore((state) => state.theme);
  const { setTheme: onThemeChange } = useThemeActions();
  const navigate = useNavigate();
  const { user, isAdmin: globalIsAdmin } = useAuth();

  const currentLanguage = i18n.resolvedLanguage || 'it';

  return (
    <div className="flex-grow overflow-y-auto min-h-full">
        <div className="p-4 lg:p-8 space-y-8 w-full max-w-3xl mx-auto">
          {/* Auth Section (Mobile Only) */}
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <AuthAvatar showLabel centered />
            {globalIsAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="text-[11px] font-bold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                 <Shield className="w-3.5 h-3.5" />
                {t('settings.admin')}
              </button>
            )}
          </div>

          {/* Theme Section */}
          <section>
            <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px] mb-3 px-1">{t('settings.theme.title')}</h3>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
              <SegmentedButton label={t('settings.theme.light')} active={currentTheme === 'light'} onClick={() => onThemeChange('light')} />
              <SegmentedButton label={t('settings.theme.dark')} active={currentTheme === 'dark'} onClick={() => onThemeChange('dark')} />
              <SegmentedButton label={t('settings.theme.system')} active={currentTheme === 'system'} onClick={() => onThemeChange('system')} />
            </div>
          </section>

          {/* Language Section */}
          <section>
            <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px] mb-3 px-1">{t('settings.language.title')}</h3>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
              <SegmentedButton 
                label={t('settings.language.it')} 
                active={currentLanguage === 'it'} 
                onClick={() => i18n.changeLanguage('it')} 
              />
              <SegmentedButton 
                label={t('settings.language.en')} 
                active={currentLanguage === 'en'} 
                onClick={() => i18n.changeLanguage('en')} 
              />
            </div>
          </section>

          {/* Info Section */}
          <section className="lg:hidden">
            <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px] mb-3 px-1">{t('settings.info.title')}</h3>
            <div className="flex flex-col bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
              <InfoRow label={t('settings.info.about')} onClick={() => navigate('/settings/about')} />
              <InfoRow label={t('settings.info.legal')} onClick={() => navigate('/settings/legal')} />
              <InfoRow label={t('settings.info.report')} onClick={() => navigate('/settings/report')} disabled={!user} />
            </div>


            <div className="mt-8 text-center">
                <div className="text-[10px] text-neutral-400 dark:text-neutral-600 font-medium uppercase tracking-widest">
                  {t('settings.version', { version: import.meta.env.VITE_APP_VERSION, build: import.meta.env.VITE_APP_BUILD })}
                </div>
            </div>
          </section>
        </div>
    </div>
  );
};

export default SettingsPage;

