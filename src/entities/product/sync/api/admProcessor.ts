import { Listino, downloadListinoAsFile } from './admApiService';
import { ParsedPDFResult, analyzePdfChunks } from './pdfAnalyzer';

export interface ProcessingProgress {
  setStatus: (status: string) => void;
  signal?: AbortSignal;
}

export async function processListiniBatch(
  selectedListini: Listino[],
  aiModel: string,
  progress: ProcessingProgress
): Promise<ParsedPDFResult> {
  const allFiles: File[] = [];
  let latestDate = "";
  
  for (const listino of selectedListini) {
    if (progress.signal?.aborted) throw new Error("Operazione annullata dall'utente.");
    
    progress.setStatus(`Scaricamento di ${listino.title}...`);
    try {
      const file = await downloadListinoAsFile(listino, progress.signal);
      allFiles.push(file);
      if (!latestDate || listino.date > latestDate) latestDate = listino.date;
    } catch (err: any) {
      console.warn(`Salto listino ${listino.title} per errore:`, err.message);
      // Do not block the entire batch if a single download fails, unless it's an abort
      if (err.name === 'AbortError') throw err;
    }
  }

  if (allFiles.length === 0) {
    throw new Error("Nessun listino scaricato correttamente.");
  }

  const combinedParsedData = await analyzePdfChunks(
    allFiles, 
    progress.setStatus,
    progress.signal,
    aiModel
  );
  
  // Data enrichment: assign the specific listino date to each product by category
  combinedParsedData.products.forEach(p => {
    const foundListino = selectedListini.find(s => s.category === p.category);
    if (foundListino) {
      p.listinoDate = foundListino.date;
    }
  });
  
  if (latestDate && (!combinedParsedData.updateDate || latestDate > combinedParsedData.updateDate)) {
      combinedParsedData.updateDate = latestDate;
  }

  return combinedParsedData;
}
