import { getFirebaseConfig } from '../utils/config.js';

export const requireAdmin = async (req: any, res: any, next: any) => {
  const { projectId, firestoreDatabaseId: databaseId = '(default)' } = getFirebaseConfig();
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Manca token di autorizzazione' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    // Decode JWT locally to extract uid.
    // The actual signature verification is implicitly done by Firestore REST API.
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error("Formato token non valido");
    }
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf8'));
    const uid = payload.user_id || payload.sub;
    
    if (!uid) {
      throw new Error("Impossibile estrarre UID dal token");
    }
    
    // Check if the user exists in the 'admins' collection in Firestore
    // We use the Firestore REST API and pass the user's token directly so it's authorized
    // according to firestore.rules
    const firestoreRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/admins/${uid}`;
    
    const response = await fetch(firestoreRestUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const isAdmin = response.status === 200;
    
    if (!isAdmin) {
      console.warn(`Admin access denied. Firestore REST API returned ${response.status} for UID: ${uid}`);
      return res.status(401).json({ success: false, error: 'Accesso negato: Solo amministratori' });
    }
    
    req.user = payload;
    next();
  } catch (error: any) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, error: 'Token invalido o scaduto' });
  }
};

