import { GoogleGenAI } from "@google/genai";
import { getDb } from '../firebaseAdmin.js';
import { getFirebaseConfig } from '../utils/config.js';

interface PromptTemplate {
  systemPrompt: string;
  userPromptTemplate: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const promptCache: Record<string, { data: PromptTemplate; timestamp: number }> = {};

function getFileMetadata(fileName: string, textData: string = "") {
  const fileNameLower = fileName.toLowerCase();
  const textLower = textData.toLowerCase();
  
  const isRadiato = fileNameLower.startsWith('rad_') || textLower.includes('tabacchi radiati');
  const isAttivo = fileNameLower.startsWith('att_') || textLower.includes('listino aggiornato al');
  const isEmissione = fileNameLower.startsWith('emi_') || textLower.includes('livelli di emissione');
  
  let forcedCategory = "";
  const combinedText = fileNameLower + " " + textLower;

  if (combinedText.includes('trinciati')) forcedCategory = "Trinciati";
  else if (combinedText.includes('sigaretti')) forcedCategory = "Sigaretti";
  else if (combinedText.includes('sigari')) forcedCategory = "Sigari";
  else if (combinedText.includes('sigarette')) forcedCategory = "Sigarette";
  else if (combinedText.includes('fiuto') || combinedText.includes('mastico')) forcedCategory = "Fiuto e Mastico";
  else if (combinedText.includes('inalazione') || combinedText.includes('liquidi') || combinedText.includes('senza combustione')) forcedCategory = "Prodotti da inalazione senza combustione";

  const forcedStatus: 'Attivo' | 'Radiato' | '' = isRadiato ? 'Radiato' : ((isAttivo || isEmissione) ? 'Attivo' : '');
  const type = isEmissione ? 'Emissione' : (isRadiato ? 'Radiato' : 'Attivo');

  return { forcedCategory, forcedStatus, type };
}

async function getPromptsFromDb(type: string): Promise<PromptTemplate> {
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
      throw new Error(`Documento prompt "${docId}" non trovato nella collezione 'prompts' su Firestore.`);
    }
  } catch (error: any) {
    console.error(`[AI-Analyzer] Error fetching prompt for ${type} from Firestore:`, error);
    throw new Error(`Impossibile recuperare le istruzioni AI per i listini di tipo "${type}". Verifica la collezione 'prompts' su Firebase. Dettagli: ${error.message}`);
  }
}

async function createBackendPrompts(fileName: string, textData: string) {
  const { forcedCategory, forcedStatus, type } = getFileMetadata(fileName, textData);
  
  // Fetch the actual template from DB. Will throw an error if it doesn't exist.
  const template = await getPromptsFromDb(type);

  // Apply template replacements
  const finalUserPrompt = template.userPromptTemplate
    .replace(/{{textData}}/g, textData)
    .replace(/{{forcedCategory}}/g, forcedCategory || 'Deduci dal contesto')
    .replace(/{{forcedStatus}}/g, forcedStatus || 'Attivo');

  return {
    systemPrompt: template.systemPrompt,
    userPrompt: finalUserPrompt
  };
}


export async function analyzeTextWithAI(
  fileName: string,
  textData: string,
  aiModel: string = "gemini-3-flash-preview"
) {
  let apiKey = process.env.GEMINI_API_KEY;
  
  // Se non c'è in .env, proviamo a leggerla in modo sicuro dal database Firestore usando l'Admin SDK
  if (!apiKey) {
    try {
      const { firestoreDatabaseId: databaseId = '(default)' } = getFirebaseConfig();
      const db = getDb(databaseId);
      const secretDoc = await db.collection('secrets').doc('gemini').get();
      if (secretDoc.exists) {
        apiKey = secretDoc.data()?.key;
      }
    } catch (e) {
      console.error("Errore nel recupero della chiave Gemini da Firestore tramite Admin SDK:", e);
    }
  }
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY non configurata sul server (né in .env né in Firestore /secrets/gemini).");
  }
    
  const ai = new GoogleGenAI({ apiKey });
  const { systemPrompt, userPrompt } = await createBackendPrompts(fileName, textData);

  try {
    const modelId = aiModel;
    
    let response: any;
    try {
      response = await ai.models.generateContent({
        model: modelId,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
    } catch(err: any) {
      if (err?.message?.includes("429") || err?.status === 429 || err?.message?.includes("RESOURCE_EXHAUSTED")) {
        console.warn("Quota ecceduta, retry in 10s...");
        await new Promise(r => setTimeout(r, 10000));
        response = await ai.models.generateContent({
          model: modelId,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json"
          }
        });
      } else {
        throw err;
      }
    }

    if (!response.text) throw new Error("L'IA ha restituito una risposta vuota.");
    
    let text = response.text.trim();
    if (text.startsWith("```json")) {
       text = text.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (text.startsWith("```")) {
       text = text.replace(/^```/, "").replace(/```$/, "").trim();
    }
    
    const result = JSON.parse(text);

    // Validazione data aggiornamento
    if (result.updateDate && !/^\d{4}-\d{2}-\d{2}$/.test(result.updateDate)) {
      delete result.updateDate;
    }

    return result;
  } catch (error: any) {
    console.error(`Gemini AI Analysis Error (${aiModel}):`, error);
    throw new Error(`Errore durante l'interpretazione dei dati (${aiModel}): ${error.message}`);
  }
}

