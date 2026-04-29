import { GoogleGenAI } from "@google/genai";
import { getFirebaseConfig } from '../utils/config.js';

export async function analyzeTextWithAI(
  systemPrompt: string,
  userPrompt: string,
  aiModel: string = "gemini-3-flash-preview",
  authHeader?: string
) {
  let apiKey = null;
  
  if (authHeader) {
      const { projectId, firestoreDatabaseId: databaseId = '(default)' } = getFirebaseConfig();
      
      const firestoreRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/secrets/gemini`;
      try {
        const response = await fetch(firestoreRestUrl, {
          headers: { Authorization: authHeader }
        });
        if (response.ok) {
           const data = await response.json();
           apiKey = data?.fields?.key?.stringValue?.trim();
           console.log("Successfully fetched API key from Firestore", !!apiKey);
        } else {
           console.log("Failed to fetch API key from Firestore, HTTP status:", response.status);
        }
      } catch (e) {
        console.error("Failed to fetch api key from firestore", e);
      }
  }

  if (!apiKey) {
    throw new Error("API Key mancante nel database. Configurala in /secrets/gemini.");
  }
    
  const ai = new GoogleGenAI({ apiKey });

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
