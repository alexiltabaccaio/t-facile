import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/entities/session';
import { signInWithGoogle, signOut } from '@/shared/api';
import { User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AuthAvatar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarClick = () => {
    if (!user) {
      signInWithGoogle();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleLogout = () => {
    signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        onClick={handleAvatarClick}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-all hover:ring-2 hover:ring-blue-500/50"
        aria-label={user ? t('settings.auth.logout') : t('settings.auth.login')}
      >
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
        ) : (
          <User size={18} className="text-neutral-500 dark:text-neutral-400" />
        )}
      </button>

      {isOpen && user && (
        <div className="absolute top-full mt-2 left-0 z-50 min-w-[160px] bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
           <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
             <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-tight">{t('settings.auth.loggedInAs')}</p>
             <p className="text-[11px] font-semibold truncate text-light-text dark:text-dark-text-primary leading-tight mt-0.5">{user.email}</p>
           </div>
           <button
             onClick={handleLogout}
             className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
           >
             <LogOut size={14} />
             {t('settings.auth.logout')}
           </button>
        </div>
      )}
    </div>
  );
};
