import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Load Service Account
const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
        console.error("Errore nel parsing di FIREBASE_SERVICE_ACCOUNT_KEY da variabile d'ambiente", e);
    }
} else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
  });
  console.log("Firebase Admin SDK initialized successfully.");
}

export const adminAuth = admin.auth();
export const adminDb = getFirestore();

/**
 * Gets a Firestore instance for a specific database ID.
 */
export function getDb(databaseId: string = '(default)') {
    if (databaseId === '(default)') return adminDb;
    return getFirestore(databaseId);
}

export default admin;
