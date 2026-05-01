import { extractTextFromPDF } from './pdfExtractor';
import { splitTextInChunks } from './textChunker';
import { analyzeTextWithAI } from './aiService';
import { createPrompts } from '../lib/pdfPromptFactory';

export interface ParsedProduct {
  code: string;
  name?: string;
  category?: string;
  packageInfo?: string;
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

export const analyzePdfChunks = async (
  files: File[],
  onStatusUpdate: (status: string) => void,
  signal?: AbortSignal,
  aiModel?: string
): Promise<ParsedPDFResult> => {
  const allProducts: ParsedProduct[] = [];
  let finalUpdateDate = "";

  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) throw new Error("Operazione annullata dall'utente.");
    const file = files[i];
    onStatusUpdate(`Estrazione testo da ${file.name}...`);
    
    // PHASE 1: Extract raw TEXT via PDF.js
    const fullText = await extractTextFromPDF(file, (current, total) => {
      onStatusUpdate(`Lettura ${file.name}: pagina ${current} di ${total}...`);
    });

    if (signal?.aborted) throw new Error("Operazione annullata dall'utente.");

    // PHASE 2: Split into text chunks
    // Increasing the number of pages per block to 5 (instead of 1) drastically reduces the number of API requests (and avoids 429)
    const textChunks = splitTextInChunks(fullText, 5);
    
    for (let chunkIdx = 0; chunkIdx < textChunks.length; chunkIdx++) {
      if (signal?.aborted) throw new Error("Operazione annullata dall'utente.");
      onStatusUpdate(`Interpretazione IA ${file.name} - Blocco ${chunkIdx + 1} di ${textChunks.length}...`);
      
      const textData = textChunks[chunkIdx];

      // PHASE 3: Prompt generation
      const { systemPrompt, userPrompt } = createPrompts(file.name, textData);

      // PHASE 4: Call Gemini SDK (Frontend)
      const analysisResult = await analyzeTextWithAI(systemPrompt, userPrompt, aiModel ? aiModel : "gemini-3-flash-preview");

      if (analysisResult.products) {
        allProducts.push(...analysisResult.products);
      }
      
      // Date validation and normalization
      let normalizedUpdateDate = analysisResult.updateDate;
      if (!normalizedUpdateDate || normalizedUpdateDate === "Non disponibile" || !/^\d{4}-\d{2}-\d{2}$/.test(normalizedUpdateDate)) {
        normalizedUpdateDate = "";
      }

      if (normalizedUpdateDate && (!finalUpdateDate || normalizedUpdateDate > finalUpdateDate)) {
        finalUpdateDate = normalizedUpdateDate;
      }
    }
  }

  if (signal?.aborted) throw new Error("Operazione annullata dall'utente.");

  if (allProducts.length === 0) {
    throw new Error("L'estrazione non ha prodotto risultati. Verifica il contenuto del PDF.");
  }

  // De-duplication and final Merge
  const mergedMap = new Map<string, ParsedProduct>();
  allProducts.forEach(p => {
    const existing = mergedMap.get(p.code);
    mergedMap.set(p.code, existing ? { ...existing, ...p } : p);
  });

  return {
    updateDate: finalUpdateDate || new Date().toISOString().split('T')[0],
    products: Array.from(mergedMap.values())
  };
};


