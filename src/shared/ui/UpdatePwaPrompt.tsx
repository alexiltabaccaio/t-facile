import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react';

export const UpdatePwaPrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      // Setup periodic update checks
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000); // Check every hour
      }
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-[80px] left-4 right-4 z-[100] md:bottom-6 md:left-auto md:right-6 md:w-80"
      >
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-xl shadow-neutral-900/10 border border-neutral-200 dark:border-neutral-700 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Aggiornamento Disponibile
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                È disponibile una nuova versione dell'app. Aggiorna per accedere alle ultime funzionalità.
              </p>
            </div>
            <button 
              onClick={close}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 -mr-2 -mt-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => updateServiceWorker(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Aggiorna Ora
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
