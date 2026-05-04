
import React from 'react';
import { useNotificationStore } from '@/entities/notification';
import { useAuth } from '@/entities/session';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  SettingsIcon, 
  BellIcon, 
  LockIcon,
  SearchIcon
} from '@/shared/ui';
import { Info, Shield, Flag } from 'lucide-react';
import { Logo } from '@/shared/ui';
import { useTranslation } from 'react-i18next';
import { AuthAvatar } from '@/features/auth';

const DesktopSidebar: React.FC = () => {
  const { t } = useTranslation();
  const hasUnreadNotifications = useNotificationStore(state => state.hasUnread);
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCatalog = location.pathname === '/catalog' || location.pathname.startsWith('/catalog/');
  const isNotifications = location.pathname === '/notifications' || location.pathname.startsWith('/notifications/');
  const isSettings = location.pathname.startsWith('/settings');
  const isAdminView = location.pathname === '/admin';

  const navItems = [
    { 
      id: 'list', 
      label: t('layout.sidebar.catalog'), 
      icon: SearchIcon, 
      active: isCatalog,
      onClick: () => navigate('/catalog')
    },
    { 
      id: 'notifications', 
      label: t('layout.sidebar.updates'), 
      icon: BellIcon, 
      active: isNotifications,
      onClick: () => navigate('/notifications'),
      badge: hasUnreadNotifications
    },
    { 
      id: 'settings', 
      label: t('layout.sidebar.settings'), 
      icon: SettingsIcon, 
      active: isSettings,
      onClick: () => navigate('/settings') 
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen bg-white dark:bg-dark-bg border-r border-neutral-200 dark:border-dark-border py-8 px-6 shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <Logo size={40} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display font-black text-neutral-900 dark:text-white tracking-tight">{t('layout.header.catalog')}</span>
            {(import.meta.env.DEV || import.meta.env.VITE_GIT_BRANCH === 'dev') && (
              <span className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest leading-none">
                (dev)
              </span>
            )}
          </div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider">{t('layout.sidebar.subtitle')}</span>
        </div>
      </div>

      {/* User Section */}
      <div className="px-2 mb-10">
        <AuthAvatar showLabel />
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-2">
        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-4">{t('layout.sidebar.navigation')}</p>
        
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl group ${
              item.active 
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-lg shadow-neutral-200 dark:shadow-none' 
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} strokeWidth={item.active ? 2.5 : 2} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            {item.badge && !item.active && (
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            )}
            {item.active && (
              <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900 opacity-50"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Info, Legal, Report Links */}
      <div className="mt-8 flex flex-col gap-2">
        {[
          { label: t('layout.sidebar.info'), path: '/settings/about', icon: Info },
          { label: t('layout.sidebar.legal'), path: '/settings/legal', icon: Shield },
          { label: t('layout.sidebar.report'), path: '/settings/report', icon: Flag, requiresAuth: true },
        ].map((item) => {
          const isActive = location.pathname === item.path;
          const isDisabled = item.requiresAuth && !user;

          return (
            <button
              key={item.path}
              onClick={() => !isDisabled && navigate(item.path)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl group transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-lg shadow-neutral-200 dark:shadow-none'
                  : isDisabled
                    ? 'opacity-40 cursor-not-allowed text-neutral-400 dark:text-neutral-600'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900 opacity-50"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="mt-4 pt-6 border-t border-neutral-100 dark:border-neutral-800/50">
          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all group border ${
              isAdminView
                ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
                : 'border-transparent text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <LockIcon size={18} />
            <span className="font-bold text-sm">{t('layout.sidebar.admin')}</span>
          </button>
        </div>
      )}

    </aside>
  );
};

export default DesktopSidebar;

