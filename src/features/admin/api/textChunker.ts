/**
 * Utility per la gestione del testo estratto dai PDF.
 * Si occupa di dividere il testo in blocchi (chunk) gestibili dai modelli LLM.
 */

/**
 * Divide il testo in chunk logici basati sulle pagine per non sovraccaricare il context window
 * e mantenere alta la precisione semantica.
 * 
 * @param text Il testo completo estratto dal PDF (con marcatori di pagina)
 * @param pagesPerChunk Numero di pagine da includere in ogni blocco (default 8)
 */
export const splitTextInChunks = (text: string, pagesPerChunk: number = 3): string[] => {
  // Usiamo una regex più flessibile per intercettare i marcatori di pagina
  const pages = text.split(/---\s*PAGE\s*\d+\s*---/i).filter(p => p.trim().length > 0);
  
  if (pages.length <= 1) {
    // Se lo split non ha funzionato o c'è una sola pagina, ma il testo è lungo,
    // usiamo un fallback basato sulla lunghezza dei caratteri (circa 4000 caratteri per chunk)
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
