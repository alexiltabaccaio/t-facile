import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
// Se il database ID è "(default)", non passarlo affatto per evitare problemi di risoluzione su alcuni client
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Standardized Firestore error interface
export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

/**
 * Enhanced error handler for Firestore permission issues
 */
export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  if (error?.message?.includes('Missing or insufficient permissions')) {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType: operation,
      path: path,
      authInfo: {
        userId: user?.uid || 'unauthenticated',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || false,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

// Critical connection test
export async function testConnection() {
  try {
    // Attempt to read a test document to verify the network connection
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("Firebase is offline. Please check your configuration and network.");
      } else if (error.message.includes('Missing or insufficient permissions')) {
        // Nessun problema: significa che Firebase è online e le regole di sicurezza stanno funzionando!
        console.log("Firebase connection established securely (permissions active).");
      }
    }
  }
}

