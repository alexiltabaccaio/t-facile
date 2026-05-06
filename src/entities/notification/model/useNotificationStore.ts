import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UpdateRecord } from './types';
import { notificationService } from '../api/notificationService';

interface NotificationState {
  updates: UpdateRecord[];
  selectedUpdate: UpdateRecord | null;
  hasUnread: boolean;
  isInitialized: boolean;
  
  // Persisted state
  deletedIds: string[];
  lastReadId: string | null;
  installDate: number | null;

  actions: {
    init: () => () => void;
    setSelectedUpdate: (update: UpdateRecord | null) => void;
    handleUpdateClick: (update: UpdateRecord) => void;
    handleMarkAllAsRead: () => void;
    handleDeleteNotification: (id: string) => Promise<void>;
    handleDeleteAllNotifications: () => Promise<void>;
  };
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      updates: [],
      selectedUpdate: null,
      hasUnread: false,
      isInitialized: false,
      
      deletedIds: [],
      lastReadId: null,
      installDate: null,

      actions: {
        init: () => {
          if (get().isInitialized) return () => {};

          set({ isInitialized: true });

          // Migration and initialization of installDate
          let currentInstallDate = get().installDate;
          if (!currentInstallDate) {
             // Try to migrate from old localStorage key
             const legacyInstallDate = localStorage.getItem('appInstallDate');
             currentInstallDate = legacyInstallDate ? parseInt(legacyInstallDate) : Date.now();
             set({ installDate: currentInstallDate });
             if (!legacyInstallDate) localStorage.setItem('appInstallDate', currentInstallDate.toString());
          }

          // Legacy migration for deletedIds and lastReadId if store is empty but localStorage has data
          if (get().deletedIds.length === 0) {
            const legacyDeleted = localStorage.getItem('deletedNotificationIds');
            if (legacyDeleted) set({ deletedIds: JSON.parse(legacyDeleted) });
          }
          if (!get().lastReadId) {
            const legacyLastRead = localStorage.getItem('lastReadUpdateId');
            if (legacyLastRead) set({ lastReadId: legacyLastRead });
          }

          const unsubscribe = notificationService.subscribeToNotifications(
            (allUpdates) => {
              const { deletedIds, lastReadId, installDate } = get();

              // Filter by install date and deleted IDs
              const updates = (allUpdates as any[]).filter(u => {
                const isDeleted = deletedIds.includes(u.id);
                const timestamp = u.timestamp?.toMillis ? u.timestamp.toMillis() : 
                                (u.timestamp?.seconds ? u.timestamp.seconds * 1000 : 0);
                
                const isAfterInstall = installDate ? timestamp >= installDate : true;
                return !isDeleted && isAfterInstall;
              });

              if (updates.length === 0) {
                set({ updates: [], hasUnread: false, isInitialized: true });
                return;
              }

              const lastReadIndex = updates.findIndex(u => u.id === lastReadId);
              
              const processedUpdates = updates.map((u, index) => ({
                ...u,
                read: lastReadIndex !== -1 ? index >= lastReadIndex : false
              }));

              const latestId = updates[0]?.id;
              const hasUnread = latestId ? latestId !== lastReadId : false;

              set({ updates: processedUpdates, hasUnread, isInitialized: true });
            },
            (err) => {
              console.error("[useNotificationStore] Error during subscription:", err);
            }
          );

          return unsubscribe;
        },

        setSelectedUpdate: (update) => set({ selectedUpdate: update }),

        handleUpdateClick: (update: UpdateRecord) => {
          const { updates } = get();
          const updateIndex = updates.findIndex(u => u.id === update.id);
          
          const updatedUpdates = updates.map((u, index) => ({
            ...u,
            read: updateIndex !== -1 ? index >= updateIndex : u.read
          }));

          const hasUnread = updatedUpdates[0]?.id !== update.id && !updatedUpdates[0]?.read;

          set({ 
            lastReadId: update.id,
            selectedUpdate: update,
            updates: updatedUpdates,
            hasUnread
          });
        },

        handleMarkAllAsRead: () => {
          const { updates } = get();
          const latestId = updates[0]?.id;
          if (latestId) {
            const updatedUpdates = updates.map(u => ({ ...u, read: true }));
            set({ lastReadId: latestId, hasUnread: false, updates: updatedUpdates });
          }
        },

        handleDeleteNotification: async (id: string) => {
          const { deletedIds, updates } = get();
          
          if (!deletedIds.includes(id)) {
            const newDeletedIds = [...deletedIds, id];
            const filteredUpdates = updates.filter(u => u.id !== id);
            set({ deletedIds: newDeletedIds, updates: filteredUpdates });
          }
        },

        handleDeleteAllNotifications: async () => {
          const { updates, deletedIds } = get();
          const idsToDelete = updates.map(u => u.id);
          const newDeletedIds = Array.from(new Set([...deletedIds, ...idsToDelete]));
          
          set({ deletedIds: newDeletedIds, updates: [], hasUnread: false, selectedUpdate: null });
        },
      }
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        deletedIds: state.deletedIds,
        lastReadId: state.lastReadId,
        installDate: state.installDate
      }),
    }
  )
);

export const useNotificationActions = () => useNotificationStore(state => state.actions);

