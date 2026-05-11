import { ADMClient, BASE_URL } from '../utils/admClient.js';
import { ADMParser, ADMListItem } from '../utils/admParser.js';

/**
 * ADMService orchestrates the fetching and processing of data from the ADM website.
 * It follows the Layered Architecture by delegating HTTP and parsing logic to utilities.
 */

/**
 * Fetches and sorts the current price lists from ADM.
 */
export async function fetchADMListini() {
  const sources = [
    { url: `${BASE_URL}/portale/monopoli/tabacchi/prezzi/prezzi_pubblico`, type: 'Prezzi' },
    { url: `${BASE_URL}/portale/monopoli/tabacchi/prezzi/tabacchi-radiati`, type: 'Radiati' },
    { url: `${BASE_URL}/portale/livelli-di-emissioni-delle-sigarette`, type: 'Emissioni' }
  ];
  
  const allListini: ADMListItem[] = [];

  await Promise.all(sources.map(async ({ url, type }) => {
    try {
      const html = await ADMClient.fetchHTML(url);
      const items = ADMParser.parseListini(html, type);
      
      items.forEach(item => {
        const fullUrl = item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`;
        if (!allListini.some(l => l.url === fullUrl)) {
          allListini.push({
            ...item,
            url: fullUrl,
            category: ADMParser.getCategoryFromTitle(item.title),
            status: type === 'Prezzi' ? 'Attivo' : (type === 'Radiati' ? 'Radiato' : 'Emissione')
          });
        }
      });
    } catch (error: unknown) {
      console.error(`[ADMService] Error fetching source ${url}:`, error instanceof Error ? error.message : String(error));
    }
  }));

  return sortListini(allListini);
}

/**
 * Sorts the price lists by type and category for the UI.
 */
function sortListini(listini: ADMListItem[]) {
  const typeOrder: Record<string, number> = { 'Prezzi': 0, 'Emissioni': 1, 'Radiati': 2 };
  const categoryOrder: Record<string, number> = {
    'Sigarette': 1, 'Sigari': 2, 'Sigaretti': 3, 'Fiuto e Mastico': 4,
    'Trinciati': 5, 'Altri Tabacchi': 6, 'Prodotti da inalazione senza combustione': 7
  };

  return listini.sort((a, b) => {
    if (typeOrder[a.type] !== typeOrder[b.type]) return typeOrder[a.type] - typeOrder[b.type];
    const rankA = categoryOrder[a.category!] || 99;
    const rankB = categoryOrder[b.category!] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Fetches the latest news and price variations from ADM.
 */
export async function fetchADMNews() {
  const url = `${BASE_URL}/portale/novita-accise`;
  try {
    const html = await ADMClient.fetchHTML(url);
    return ADMParser.parseNews(html);
  } catch (error: unknown) {
    console.error(`[ADMService] Error fetching ADM News:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Downloads a PDF from ADM and returns it as a Base64 string.
 */
export async function downloadADMPdfAsBase64(path: string) {
  const buffer = await ADMClient.downloadPdfAsBuffer(path);
  return Buffer.from(buffer).toString('base64');
}
