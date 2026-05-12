import { extractTextFromPDF } from './pdfExtractor';
import { splitTextInChunks } from './textChunker';
import { analyzeTextWithAI } from './aiService';
import { 
  extractDateFromFilename, 
  normalizeUpdateDate, 
  mergeSessionProducts 
} from '../lib/pdfAnalysisUtils';
import { ParsedProduct, ParsedPDFResult } from '@/entities/product/lib/syncUtils';

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

    // Reducing to 1 page per block to ensure 100% extraction precision with Lite models
    const textChunks = splitTextInChunks(fullText, 1);
    
    for (let chunkIdx = 0; chunkIdx < textChunks.length; chunkIdx++) {
      if (signal?.aborted) throw new Error("Operazione annullata dall'utente.");
      onStatusUpdate(`Interpretazione IA ${file.name} - Blocco ${chunkIdx + 1} di ${textChunks.length}...`);
      
      const textData = textChunks[chunkIdx];

      // PHASE 4: Call Gemini SDK
      const analysisResult = await analyzeTextWithAI(
        file.name, 
        textData, 
        aiModel || "gemini-3.1-flash-lite-preview", 
        signal
      );

      // RATE LIMITING: Wait 2 seconds before the next call (except for the last block)
      if (chunkIdx < textChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (analysisResult.products) {
        allProducts.push(...analysisResult.products);
      }
      
      // Date extraction and normalization
      const filenameDate = extractDateFromFilename(file.name);
      const normalizedUpdateDate = normalizeUpdateDate(filenameDate || analysisResult.updateDate);

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
  return {
    updateDate: finalUpdateDate || "",
    products: mergeSessionProducts(allProducts)
  };
};


