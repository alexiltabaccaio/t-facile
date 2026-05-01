
import { create } from 'zustand';
import { UpdateRecord } from './types';
import { notificationService } from '../api/notificationService';

interface NotificationState {
  updates: UpdateRecord[];
  selectedUpdate: UpdateRecord | null;
  hasUnread: boolean;
  isInitialized: boolean;

  actions: {
    init: () => () => void;
    setSelectedUpdate: (update: UpdateRecord | null) => void;
    handleUpdateClick: (update: UpdateRecord) => void;
    handleMarkAllAsRead: () => void;
    handleDeleteNotification: (id: string) => Promise<void>;
    handleDeleteAllNotifications: () => Promise<void>;
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  updates: [],
  selectedUpdate: null,
  hasUnread: false,
  isInitialized: false,

  actions: {
    init: () => {
      if (get().isInitialized) return () => {};

      const unsubscribe = notificationService.subscribeToNotifications(
        (updates) => {
          // Calculate hasUnread based on localStorage (linear tracking)
          const lastReadId = localStorage.getItem('lastReadUpdateId');
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
      localStorage.setItem('lastReadUpdateId', update.id);
      
      const { updates } = get();
      const updateIndex = updates.findIndex(u => u.id === update.id);
      
      const updatedUpdates = updates.map((u, index) => ({
        ...u,
        read: updateIndex !== -1 ? index >= updateIndex : u.read
      }));

      const hasUnread = updatedUpdates[0]?.id !== update.id && !updatedUpdates[0]?.read;

      set({ 
        selectedUpdate: update,
        updates: updatedUpdates,
        hasUnread
      });
    },

    handleMarkAllAsRead: () => {
      const { updates } = get();
      const latestId = updates[0]?.id;
      if (latestId) {
        localStorage.setItem('lastReadUpdateId', latestId);
        const updatedUpdates = updates.map(u => ({ ...u, read: true }));
        set({ hasUnread: false, updates: updatedUpdates });
      }
    },

    handleDeleteNotification: async (id: string) => {
      try {
        await notificationService.deleteNotification(id);
      } catch (err) {
        console.error("Errore eliminazione notifica:", err);
      }
    },

    handleDeleteAllNotifications: async () => {
      try {
        await notificationService.deleteAllNotifications();
      } catch (err) {
        console.error("Errore eliminazione totale notifiche:", err);
      }
    },
  }
}));

export const useNotificationActions = () => useNotificationStore(state => state.actions);

