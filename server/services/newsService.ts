import { getDb } from '../firebaseAdmin.js';
import { getFirebaseConfig } from '../utils/config.js';

const COLLECTION_NAME = 'scanned_news';

export async function getAnalyzedNewsUrls(): Promise<string[]> {
  try {
    const { firestoreDatabaseId: databaseId = '(default)' } = getFirebaseConfig();
    const db = getDb(databaseId);
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => doc.data().url);
  } catch (error: unknown) {
    console.error('Error fetching analyzed news:', error);
    return [];
  }
}

export async function markNewsAsAnalyzed(url: string, title: string) {
  try {
    const { firestoreDatabaseId: databaseId = '(default)' } = getFirebaseConfig();
    const db = getDb(databaseId);
    
    // Use hash of URL as ID to avoid special characters issues
    const docId = Buffer.from(url).toString('base64').replace(/[/+=]/g, '_');
    
    await db.collection(COLLECTION_NAME).doc(docId).set({
      url,
      title,
      processedAt: new Date().toISOString(),
      status: 'analyzed'
    });
  } catch (error: unknown) {
    console.error('Error marking news as analyzed:', error);
  }
}
