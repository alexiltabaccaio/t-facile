import { extractTextFromPDF } from './pdfExtractor';
import { splitTextInChunks } from './textChunker';
import { analyzeTextWithAI } from './aiService';

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
    }, signal);

    if (signal?.aborted) throw new Error("Operazione annullata dall'utente.");

    // Reducing to 1 page per block to ensure 100% extraction precision with Lite models (Gemini Flash Lite).
    // This prevents output truncation caused by 8192 output token limit when dealing with dense tables.
    const textChunks = splitTextInChunks(fullText, 1);
    
    for (let chunkIdx = 0; chunkIdx < textChunks.length; chunkIdx++) {
      if (signal?.aborted) throw new Error("Operazione annullata dall'utente.");
      onStatusUpdate(`Interpretazione IA ${file.name} - Blocco ${chunkIdx + 1} di ${textChunks.length}...`);
      
      const textData = textChunks[chunkIdx];

      // PHASE 4: Call Gemini SDK (Frontend calls Backend)
      // Standardized default model to gemini-3.1-flash-lite-preview
      const analysisResult = await analyzeTextWithAI(file.name, textData, aiModel ? aiModel : "gemini-3.1-flash-lite-preview", signal);

      // RATE LIMITING: Wait 2 seconds before the next call (except for the last block)
      if (chunkIdx < textChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

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
  let noCodeCounter = 0;
  
  allProducts.forEach(p => {
    const code = p.code ? p.code.trim() : "";
    if (code) {
      const existing = mergedMap.get(code);
      mergedMap.set(code, existing ? { ...existing, ...p } : p);
    } else {
      // If there's no code, we don't merge them because we can't reliably know if they are the same
      noCodeCounter++;
      mergedMap.set(`NO_CODE_${noCodeCounter}`, { ...p, code: "" });
    }
  });

  return {
    updateDate: finalUpdateDate || new Date().toISOString().split('T')[0],
    products: Array.from(mergedMap.values())
  };
};


