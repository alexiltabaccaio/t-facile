import { getDb } from '../firebaseAdmin.js';
import { getFirebaseConfig } from '../utils/config.js';

/**
 * Fetches the Gemini API key from environment variables or Firestore.
 * @returns The Gemini API key.
 */
export async function getGeminiApiKey(): Promise<string | undefined> {
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    try {
      const { firestoreDatabaseId: databaseId = '(default)' } = getFirebaseConfig();
      const db = getDb(databaseId);
      const secretDoc = await db.collection('secrets').doc('gemini').get();
      if (secretDoc.exists) {
        apiKey = secretDoc.data()?.key;
      }
    } catch (e) {
      console.error("[SecretRepository] Error retrieving Gemini key from Firestore:", e);
    }
  }
  
  return apiKey;
}
