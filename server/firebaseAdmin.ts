import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Load Service Account
const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
let serviceAccount = null;

if (fs.existsSync(serviceAccountPath)) {
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
