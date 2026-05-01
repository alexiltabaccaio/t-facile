import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  FirestoreError
} from 'firebase/firestore';
import { db } from './firebase';

export const notificationRepository = {
  /**
   * Subscription to notifications (last 100)
   */
  subscribeToNotifications: (
    onUpdate: (data: any[]) => void,
    onError: (error: FirestoreError) => void
  ) => {
    const q = query(
      collection(db, 'update_history'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    return onSnapshot(
      q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        onUpdate(data);
      },
      onError
    );
  },

  /**
   * Marks a notification as read
   */
  markAsRead: async (notificationId: string) => {
    const docRef = doc(db, 'update_history', notificationId);
    await updateDoc(docRef, { read: true });
  },

  /**
   * Marks all notifications as read
   */
  markAllAsRead: async (notificationIds: string[]) => {
    const batch = writeBatch(db);
    notificationIds.forEach(id => {
      const docRef = doc(db, 'update_history', id);
      batch.update(docRef, { read: true });
    });
    await batch.commit();
  },

  /**
   * Deletes a notification
   */
  deleteNotification: async (notificationId: string) => {
    const docRef = doc(db, 'update_history', notificationId);
    await deleteDoc(docRef);
  },

  /**
   * Deletes all notifications
   */
  deleteAllNotifications: async () => {
    const q = query(collection(db, 'update_history'));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
      batch.delete(d.ref);
    });
    await batch.commit();
  }
};
