import { getDb } from '../firebaseAdmin.js';
import { getFirebaseConfig } from '../utils/config.js';

export interface PromptTemplate {
  systemPrompt: string;
  userPromptTemplate: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const promptCache: Record<string, { data: PromptTemplate; timestamp: number }> = {};

/**
 * Fetches prompt templates from Firestore with a 10-minute cache.
 * @param type The type of document (e.g., 'attivo', 'radiato', 'emissione').
 * @returns The prompt template.
 */
export async function getPromptTemplate(type: string): Promise<PromptTemplate> {
  const now = Date.now();
  if (promptCache[type] && (now - promptCache[type].timestamp < CACHE_TTL_MS)) {
    return promptCache[type].data;
  }

  try {
    const { firestoreDatabaseId: databaseId = '(default)' } = getFirebaseConfig();
    const db = getDb(databaseId);
    const docId = type.toLowerCase();
    const promptDoc = await db.collection('prompts').doc(docId).get();

    if (promptDoc.exists) {
      const data = promptDoc.data() as PromptTemplate;
      promptCache[type] = { data, timestamp: now };
      return data;
    } else {
      throw new Error(`Prompt document "${docId}" not found in 'prompts' collection.`);
    }
  } catch (error: any) {
    console.error(`[PromptRepository] Error fetching prompt for ${type} from Firestore:`, error);
    throw new Error(`Unable to retrieve AI instructions for lists of type "${type}". Details: ${error.message}`);
  }
}
