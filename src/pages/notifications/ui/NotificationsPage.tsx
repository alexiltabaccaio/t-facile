import React, { useState } from 'react';
import { BellIcon, ChevronRightIcon, TrashIcon } from '@/shared/ui';
import { useNotificationStore, useNotificationActions } from '@/entities/notification';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  const { updates, hasUnread } = useNotificationStore(useShallow(state => ({
    updates: state.updates,
    hasUnread: state.hasUnread
  })));
  const { 
    handleUpdateClick, 
    handleMarkAllAsRead, 
    handleDeleteNotification,
    handleDeleteAllNotifications
  } = useNotificationActions();

  if (updates.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <h3 className="text-xl font-semibold text-light-text dark:text-dark-text-primary">{t('notifications.emptyTitle')}</h3>
        <p className="text-neutral-600 dark:text-dark-text-secondary mt-2">{t('notifications.emptySubtitle')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 border-b border-neutral-200 dark:border-dark-border flex items-center h-12">
        {isConfirming ? (
          <div className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-sm font-bold text-light-text dark:text-dark-text-primary">{t('notifications.clearConfirm')}</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsConfirming(false)} 
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                {t('notifications.cancel')}
              </button>
              <button 
                onClick={() => {
                  handleDeleteAllNotifications();
                  setIsConfirming(false);
                }} 
                className="text-sm font-bold text-red-600 dark:text-red-500 hover:text-red-700"
              >
                {t('notifications.confirmDelete')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full animate-in fade-in">
            {hasUnread ? (
                <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    aria-label={t('notifications.aria.markAllRead')}
                >
                    {t('notifications.markAllRead')}
                </button>
            ) : <div />}
            {updates.length > 0 && (
                <button
                    onClick={() => setIsConfirming(true)}
                    className="text-sm font-semibold text-red-600 dark:text-red-500 hover:underline"
                    aria-label={t('notifications.aria.deleteAll')}
                >
                    {t('notifications.deleteAll')}
                </button>
            )}
          </div>
        )}
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-dark-border">
      {updates.map(update => {
        const isUnread = !update.read;
        const Icon = BellIcon;

        return (
          <div
            key={update.id}
            onClick={() => {
              handleUpdateClick(update);
              navigate(`/notifications/${update.id}`);
            }}
            className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-left group border-b border-neutral-200 dark:border-dark-border cursor-pointer hover:bg-white dark:hover:bg-dark-card-bg/50 ${isUnread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUpdateClick(update);
                navigate(`/notifications/${update.id}`);
              }
            }}
          >
            <div className="flex items-center gap-4 flex-grow min-w-0">
               <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover:bg-white dark:group-hover:bg-dark-card-bg`}>
                 <Icon className="h-5 w-5" />
               </div>
               <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                     <p className="font-semibold text-sm text-light-text dark:text-dark-text-primary truncate">{update.title}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] text-neutral-500 dark:text-dark-text-secondary">
                      {update.date === "Non disponibile" ? t('notifications.noDateDetected') : update.date}
                    </p>
                    {update.stats && (
                      <div className="flex gap-1.5 text-[9px] font-bold">
                        {update.stats.new > 0 && <span className="text-green-600 dark:text-green-400">+{update.stats.new} {t('notifications.stats.new')}</span>}
                        {update.stats.price > 0 && <span className="text-blue-600 dark:text-blue-400">-{update.stats.price} {t('notifications.stats.prices')}</span>}
                        {update.stats.status > 0 && <span className="text-red-600 dark:text-red-400">-{update.stats.status} {t('notifications.stats.retired')}</span>}
                      </div>
                    )}
                  </div>
               </div>
            </div>
            
            <div className="flex items-center flex-shrink-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(update.id);
                    }}
                    className="p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-500 transition-colors rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={t('notifications.aria.deleteSingle', { title: update.title })}
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
                <ChevronRightIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500 flex-shrink-0 ml-1" />
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default NotificationsPage;

