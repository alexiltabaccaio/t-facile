import { adminAuth, getDb } from '../firebaseAdmin.js';
import { getFirebaseConfig } from '../utils/config.js';
import { Request, Response, NextFunction } from 'express';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { firestoreDatabaseId: databaseId = '(default)' } = getFirebaseConfig();
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Manca token di autorizzazione' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    // 1. Cryptographic verification of the token (Signature, Expiration, Audience)
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // 2. Check admin privileges in Firestore database
    const db = getDb(databaseId);
    const adminDoc = await db.collection('admins').doc(uid).get();
    
    if (!adminDoc.exists) {
      console.warn(`Admin access denied. UID ${uid} non trovato nella collezione 'admins'.`);
      return res.status(403).json({ success: false, error: 'Accesso negato: Solo amministratori' });
    }
    
    // @ts-expect-error - Custom property on Request
    req.user = decodedToken;
    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Auth Middleware Error:", errorMessage);
    return res.status(401).json({ success: false, error: 'Token invalido o scaduto' });
  }
};

