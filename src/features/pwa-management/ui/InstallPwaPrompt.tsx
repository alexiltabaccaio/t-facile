import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Extend the BeforeInstallPromptEvent type for TypeScript
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if previously dismissed (optional: persist this in localStorage)
    const isDismissed = localStorage.getItem('t-facile-pwa-dismissed') === 'true';
    if (isDismissed) {
        setDismissed(true);
    }
      
    // Listen for the prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Update UI notify the user they can install the PWA
      if (!isDismissed) {
          setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If it's already installed, let's hide it
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('t-facile-pwa-dismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

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
                <Download className="w-4 h-4 text-primary" />
                Installa T-Facile
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Aggiungi l'app alla schermata Home per un accesso rapido e veloce.
              </p>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 -mr-2 -mt-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleInstallClick}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Aggiungi alla Home
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
