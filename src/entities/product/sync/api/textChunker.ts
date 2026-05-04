/**
 * Utility for managing text extracted from PDFs.
 * It handles dividing the text into blocks (chunks) manageable by LLM models.
 */

/**
 * Divides the text into logical chunks based on pages to not overload the context window
 * and maintain high semantic precision.
 * 
 * @param text The complete text extracted from the PDF (with page markers)
 * @param pagesPerChunk Number of pages to include in each block (default 8)
 */
export const splitTextInChunks = (text: string, pagesPerChunk: number = 3): string[] => {
  // Use a more flexible regex to intercept page markers
  const pages = text.split(/---\s*PAGE\s*\d+\s*---/i).filter(p => p.trim().length > 0);
  
  if (pages.length <= 1) {
    // If the split did not work or there is only one page, but the text is long,
    // we use a fallback based on character length (approx 4000 characters per chunk)
    if (text.length > 6000) {
      const chunks: string[] = [];
      const chunkSize = 5000;
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
      }
      return chunks;
    }
    return text.trim() ? [text] : [];
  }
  
  const chunks: string[] = [];
  for (let i = 0; i < pages.length; i += pagesPerChunk) {
    const chunk = pages.slice(i, i + pagesPerChunk).join('\n');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
};
