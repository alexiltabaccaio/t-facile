import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "../repositories/secretRepository.js";
import { createBackendPrompts } from "./promptBuilder.js";
import { getErrorMessage } from "../utils/errorUtils.js";

export interface ParsedProduct {
  code: string;
  name?: string;
  category?: string;
  packageInfo?: string;
  package?: {
    type?: string;
    quantity?: number;
    unit?: string;
  };
  oldPricePerKg?: number;
  pricePerKg?: number;
  price?: number;
  status?: 'Attivo' | 'Radiato';
  tar?: number;
  nicotine?: number;
  co?: number;
  radiationDate?: string;
  listinoDate?: string;
}

export interface ParsedPDFResult {
  updateDate: string;
  products: ParsedProduct[];
}

/**
 * Orchestrates the AI analysis of text extracted from a document.
 * Handles API keys, prompt construction, LLM calls with retry logic, and JSON parsing.
 */
export async function analyzeTextWithAI(
  fileName: string,
  textData: string,
  aiModel: string = "gemini-3-flash-preview"
): Promise<ParsedPDFResult> {
  const apiKey = await getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY non configurata sul server (né in .env né in Firestore /secrets/gemini).");
  }
    
  const ai = new GoogleGenAI({ apiKey });
  const { systemPrompt, userPrompt } = await createBackendPrompts(fileName, textData);

  try {
    const modelId = aiModel;
    
    let response: { text?: string } | null = null;
    const maxRetries = 6;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: modelId,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json"
          }
        }) as { text?: string };
        break; // Success, exit loop
      } catch(err: unknown) {
        const errorMessage = getErrorMessage(err);
        const status = (err as { status?: number })?.status; 
        
        const isRetryableError = 
          status === 429 || 
          status === 503 ||
          errorMessage.includes("429") || 
          errorMessage.includes("503") ||
          errorMessage.includes("RESOURCE_EXHAUSTED") ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("high demand");

        if (isRetryableError && attempt < maxRetries - 1) {
          const delayMs = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s, 40s...
          console.warn(`Errore AI (Sovraccarico/503/429). Riprovo tra ${delayMs/1000}s... (Tentativo ${attempt + 1} di ${maxRetries - 1})`);
          await new Promise(r => setTimeout(r, delayMs));
        } else {
          throw err;
        }
      }
    }

    if (!response || !response.text) throw new Error("L'IA ha restituito una risposta vuota.");
    
    let text = response.text.trim();
    if (text.startsWith("```json")) {
       text = text.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (text.startsWith("```")) {
       text = text.replace(/^```/, "").replace(/```$/, "").trim();
    }
    
    const result = JSON.parse(text) as ParsedPDFResult;
    console.log("=== AI ANALYZER DEBUG ===");
    console.log("TEXT DATA RECEIVED (first 500 chars):\n", textData.substring(0, 500));
    console.log("==========================");

    // Update date validation
    if (result.updateDate && !/^\d{4}-\d{2}-\d{2}$/.test(result.updateDate)) {
      result.updateDate = "";
    }

    return result;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error(`Gemini AI Analysis Error (${aiModel}):`, error);
    throw new Error(`Errore durante l'interpretazione dei dati (${aiModel}): ${message}`);
  }
}
