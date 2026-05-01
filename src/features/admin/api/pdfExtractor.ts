import * as pdfjs from 'pdfjs-dist';

// Local Worker configuration for Vite
const pdfWorker = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractTextFromPDF = async (file: File, onProgress?: (page: number, total: number) => void): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .filter((item: any) => 'str' in item)
      .map((item: any) => item.str);
    
    // Join the page strings with spaces
    fullText += `\n--- PAGE ${i} ---\n`;
    fullText += strings.join(' ');
    
    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return fullText;
};
