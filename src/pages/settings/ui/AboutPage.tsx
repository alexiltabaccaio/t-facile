import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Logo } from '@/shared/ui/Logo';

const AboutPage: React.FC = () => {
  return (
    <div className="flex-grow overflow-y-auto bg-white dark:bg-neutral-900/40 min-h-full">
      <div className="p-6 max-w-lg mx-auto space-y-8 flex flex-col items-center">
        
        {/* Logo/Icon */}
        <Logo size={96} />

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight">T-Facile</h2>
          <p className="text-neutral-400 text-xs uppercase tracking-[0.3em] font-bold">Versione 1.0.0</p>
        </div>

        <div className="w-full space-y-6 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
          <p>
            <strong className="text-neutral-900 dark:text-white">T-Facile</strong> nasce dall'esigenza di semplificare il lavoro quotidiano dei tabaccai italiani. 
          </p>
          <p>
            L'obiettivo è fornire uno strumento rapido, moderno e sempre accessibile per consultare il catalogo prodotti e gestire i prezzi con la massima precisione, eliminando la necessità di sfogliare fogli excel o documenti cartacei.
          </p>
        </div>

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-[10px]">Il Progetto</h3>
          </div>
          
          <div className="bg-neutral-50 dark:bg-dark-card-bg border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6">
            <p className="text-sm italic leading-relaxed">
              "T-Facile è un'applicazione indipendente, concepita e sviluppata per portare l'innovazione digitale all'interno delle tabaccherie."
            </p>
            
            <div className="mt-6 flex flex-col gap-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Ideatore e Sviluppatore</span>
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
          </div>
        </div>

        <div className="pt-8 text-center">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">© 2026 T-Facile. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
