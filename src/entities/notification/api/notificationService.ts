
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
import { db } from '@/shared/api/firebase/firebase';
import { UpdateRecord } from '../model/types';

export const notificationService = {
  /**
   * Sottoscrizione alle notifiche (le ultime 50)
   */
  subscribeToNotifications: (
    onUpdate: (notifications: UpdateRecord[]) => void,
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
        const notifications = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as UpdateRecord[];
        onUpdate(notifications);
      },
      onError
    );
  },

  /**
   * Segna una notifica come letta
   */
  markAsRead: async (notificationId: string) => {
    const docRef = doc(db, 'update_history', notificationId);
    await updateDoc(docRef, { read: true });
  },

  /**
   * Segna tutte le notifiche come lette
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
   * Elimina una notifica
   */
  deleteNotification: async (notificationId: string) => {
    const docRef = doc(db, 'update_history', notificationId);
    await deleteDoc(docRef);
  },

  /**
   * Elimina tutte le notifiche
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
