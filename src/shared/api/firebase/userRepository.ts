import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { SupportTicket } from './types';

export const userRepository = {
  /**
   * Sends a problem report (support ticket)
   */
  reportProblem: async (ticket: Omit<SupportTicket, 'status'>) => {
    return await addDoc(collection(db, 'support_tickets'), {
      ...ticket,
      createdAt: serverTimestamp(),
      status: 'new'
    });
  }
};
