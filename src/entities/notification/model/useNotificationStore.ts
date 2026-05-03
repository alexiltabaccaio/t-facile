
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

      set({ isInitialized: true });

      // Initialize install date if not present
      let installDateStr = localStorage.getItem('appInstallDate');
      if (!installDateStr) {
        installDateStr = Date.now().toString();
        localStorage.setItem('appInstallDate', installDateStr);
      }
      const installDate = parseInt(installDateStr);

      const unsubscribe = notificationService.subscribeToNotifications(
        (allUpdates) => {
          // Get deleted notification IDs
          const deletedIdsJson = localStorage.getItem('deletedNotificationIds');
          const deletedIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];

          // Filter by install date and deleted IDs
          const updates = (allUpdates as any[]).filter(u => {
            const isDeleted = deletedIds.includes(u.id);
            // Handle Firestore Timestamp or numeric timestamp
            const timestamp = u.timestamp?.toMillis ? u.timestamp.toMillis() : 
                            (u.timestamp?.seconds ? u.timestamp.seconds * 1000 : 0);
            
            // If timestamp is missing, we might want to show it or filter it. 
            // Given the requirement, we filter out if it's before install.
            const isAfterInstall = timestamp >= installDate;
            return !isDeleted && isAfterInstall;
          });

          if (updates.length === 0) {
            set({ updates: [], hasUnread: false, isInitialized: true });
            return;
          }

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
      const deletedIdsJson = localStorage.getItem('deletedNotificationIds');
      const deletedIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];
      
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('deletedNotificationIds', JSON.stringify(deletedIds));
        
        // Update local state immediately
        const { updates } = get();
        const filteredUpdates = updates.filter(u => u.id !== id);
        set({ updates: filteredUpdates });
      }
    },

    handleDeleteAllNotifications: async () => {
      const { updates } = get();
      const idsToDelete = updates.map(u => u.id);
      
      const deletedIdsJson = localStorage.getItem('deletedNotificationIds');
      const deletedIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];
      
      const newDeletedIds = Array.from(new Set([...deletedIds, ...idsToDelete]));
      localStorage.setItem('deletedNotificationIds', JSON.stringify(newDeletedIds));
      
      set({ updates: [], hasUnread: false, selectedUpdate: null });
    },
  }
}));

export const useNotificationActions = () => useNotificationStore(state => state.actions);

