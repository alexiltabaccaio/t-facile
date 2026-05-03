import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Logo } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex-grow overflow-y-auto min-h-full">
      <div className="p-6 max-w-lg mx-auto space-y-8 flex flex-col items-center">
        
        {/* Logo/Icon */}
        <Logo size={96} />

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight">T-Facile</h2>
          <p className="text-neutral-400 text-xs uppercase tracking-[0.3em] font-bold">{t('about.version', { version: import.meta.env.VITE_APP_VERSION })}</p>
        </div>

        <div className="w-full space-y-6 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
          <p>
            <strong className="text-neutral-900 dark:text-white">T-Facile</strong> {t('about.description').replace("T-Facile ", "")}
          </p>
          <p>
            {t('about.objective')}
          </p>
        </div>

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

        <div className="w-full flex flex-col items-center gap-1 mt-4">
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{t('about.developer')}</span>
          <a 
            href="https://www.linkedin.com/in/alexgiustizieri/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center gap-2 hover:underline"
          >
            Alex Giustizieri
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="pt-8 text-center">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">{t('about.rights')}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

