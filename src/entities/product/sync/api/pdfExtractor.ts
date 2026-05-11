import * as pdfjs from 'pdfjs-dist';

// Local Worker configuration for Vite
const pdfWorker = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractTextFromPDF = async (file: File, onProgress?: (page: number, total: number) => void, signal?: AbortSignal): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    if (signal?.aborted) throw new Error("Operazione annullata dall'utente.");

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let pageText = '';
    let lastY = -1;

    content.items.forEach((item: unknown) => {
      if (typeof item !== 'object' || item === null || !('str' in item)) return;
      const pdfItem = item as { str: string, transform: number[] };
      
      const str = pdfItem.str.trim();
      if (!str) return; // Skip empty elements to avoid double separators
      
      const y = pdfItem.transform[5];
      // If the Y coordinate changes by more than 4 points, we assume it's a new line.
      if (lastY !== -1 && Math.abs(y - lastY) > 4) {
        pageText += '\\n';
      } else if (lastY !== -1) {
        // Add a pipe separator between items on the same line to create a clear table structure
        pageText += ' | ';
      }
      
      pageText += str;
      lastY = y;
    });
    
    fullText += `\\n--- PAGE ${i} ---\\n`;
    fullText += pageText.replace(/∞/g, '°');
    
    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return fullText;
};
