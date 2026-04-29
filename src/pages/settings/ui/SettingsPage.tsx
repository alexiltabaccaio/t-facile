import React, { useState } from 'react';
import { ChevronRightIcon } from '@/shared/ui/Icons';
import { useThemeStore, useThemeActions } from '@/shared/lib/theme/model';
import { useAuth } from '@/app/providers/AuthProvider';
import { signInWithGoogle, signOut } from '@/shared/api/firebase/auth';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ThemeButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
            active
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
        }`}
    >
        {label}
    </button>
);

const InfoRow: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex items-center justify-between w-full text-left px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/30"
    >
        <span className="text-sm font-semibold text-light-text dark:text-dark-text-primary">{label}</span>
        <ChevronRightIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-600" />
    </button>
);

const SettingsPage: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.theme);
  const { setTheme: onThemeChange } = useThemeActions();
  const navigate = useNavigate();
  const { user, isAdmin: globalIsAdmin } = useAuth();
  const [buildClickCount, setBuildClickCount] = useState(0);

  return (
    <div className="flex-grow overflow-y-auto bg-white dark:bg-neutral-900/40 min-h-full">
        <div className="p-4 lg:p-8 space-y-8 w-full max-w-3xl mx-auto">
          {/* Theme Section */}
          <section>
            <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px] mb-3 px-1">Tema Applicazione</h3>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800">
              <ThemeButton label="Chiaro" active={currentTheme === 'light'} onClick={() => onThemeChange('light')} />
              <ThemeButton label="Scuro" active={currentTheme === 'dark'} onClick={() => onThemeChange('dark')} />
              <ThemeButton label="Sistema" active={currentTheme === 'system'} onClick={() => onThemeChange('system')} />
            </div>
          </section>

          {/* Info Section */}
          <section>
            <h3 className="text-neutral-500 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px] mb-3 px-1">Informazioni</h3>
            <div className="flex flex-col bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
              <InfoRow label="Info su T-Facile" onClick={() => navigate('/settings/about')} />
              <InfoRow label="Fonte Dati & Note Legali" onClick={() => navigate('/settings/legal')} />
              <InfoRow label="Segnala un problema" onClick={() => navigate('/settings/report')} />
            </div>

            {globalIsAdmin && (
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => navigate('/admin')}
                  className="text-xs font-bold text-red-600 dark:text-red-500 hover:underline uppercase tracking-widest flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  Admin
                </button>
              </div>
            )}
            
            <div className="mt-8 text-center space-y-2">
                <button 
                  onClick={() => setBuildClickCount(c => c + 1)}
                  className="text-[10px] text-neutral-400 dark:text-neutral-600 font-medium uppercase tracking-widest cursor-default"
                >
                  Versione 2.4.1 (Build 82)
                </button>
                
                {(buildClickCount >= 5 || user) && (
                   <div className="pt-2">
                      {user ? (
                         <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                           <p>Accesso effettuato come:</p>
                           <p className="font-bold">{user.email}</p>
                           <button onClick={() => signOut()} className="text-red-500 underline mt-1">Esci</button>
                         </div>
                      ) : (
                          <button 
                            onClick={() => signInWithGoogle()}
                            className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-3 py-1 rounded"
                          >
                          Accedi
                          </button>
                      )}
                   </div>
                )}
            </div>
          </section>
        </div>
    </div>
  );
};

export default SettingsPage;
