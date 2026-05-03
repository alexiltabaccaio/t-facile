import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc,
  writeBatch,
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
      limit(10)
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

  markAllAsRead: async (notificationIds: string[]) => {
    const batchSize = 400;
    for (let i = 0; i < notificationIds.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = notificationIds.slice(i, i + batchSize);
      chunk.forEach(id => {
        const docRef = doc(db, 'update_history', id);
        batch.update(docRef, { read: true });
      });
      await batch.commit();
    }
  }
};
