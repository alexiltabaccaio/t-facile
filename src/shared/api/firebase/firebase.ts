/* eslint-disable feature-sliced/layers-slices */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
// If the database ID is "(default)", do not pass it at all to avoid resolution issues on some clients
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Standardized Firestore error interface
export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
}

/**
 * Enhanced error handler for Firestore permission issues
 */
export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  if (error?.message?.includes('Missing or insufficient permissions')) {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType: operation,
      path: path
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
        // No problem: it means Firebase is online and security rules are working!
        console.log("Firebase connection established securely (permissions active).");
      }
    }
  }
}

