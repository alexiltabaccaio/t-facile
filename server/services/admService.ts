import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.adm.gov.it';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (T-Facile-Bot; +https://github.com/alexiltabaccaio/t-facile)';

/**
 * ADMClient: Pure HTTP fetching logic
 */
const ADMClient = {
  fetchHTML: async (url: string) => {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  },

  downloadPdfAsBuffer: async (path: string) => {
    const fullUrl = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const finalUrl = new URL(fullUrl);
    
    if (finalUrl.hostname !== 'www.adm.gov.it') {
      throw new Error("Hostname non autorizzato");
    }

    const response = await fetch(finalUrl.toString(), {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    return await response.arrayBuffer();
  }
};

/**
 * ADMParser: Logic for extracting data from HTML
 */
const ADMParser = {
  parseListini: (html: string, type: string) => {
    const $ = cheerio.load(html);
    const results: any[] = [];
    const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;

    $('a[href*=".pdf"]').each((_, el) => {
      let title = $(el).parent().text().trim().replace(/\s+/g, ' ');
      if (!title || title.length < 5) title = $(el).text().trim().replace(/\s+/g, ' ');
      
      let date = 'Non disponibile';
      const textAround = $(el).parent().parent().text();
      const dateMatch = title.match(dateRegex) || textAround.match(dateRegex);
      if (dateMatch) {
        date = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
        if (dateMatch[3].length === 2) date = `${dateMatch[1]}/${dateMatch[2]}/20${dateMatch[3]}`;
      }
      
      title = title.replace(/\s*-\s*pdf/i, '');
      if (type === 'Radiati' && !title.toLowerCase().includes('radiati')) title = `${title} (Radiati)`;
      
      const href = $(el).attr('href');
      const isRelevant = /sigarette|sigari|sigaretti|trinciati|fiuto|mastico|radiati|emissioni|prezzi|altri tabacchi|inalazione|combustione/i.test(title);
      
      if (href && isRelevant) {
        results.push({ title, url: href, date, type });
      }
    });
    return results;
  },

  getCategoryFromTitle: (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('trinciati')) return 'Trinciati';
    if (t.includes('sigaretti')) return 'Sigaretti';
    if (t.includes('sigari')) return 'Sigari';
    if (t.includes('sigarette')) return 'Sigarette';
    if (t.includes('fiuto') || t.includes('mastico')) return 'Fiuto e Mastico';
    if (t.includes('inalazione') || t.includes('liquidi') || t.includes('senza combustione')) return 'Prodotti da inalazione senza combustione';
    return 'Altri Tabacchi';
  }
};

/**
 * ADMService: High-level business logic
 */
export async function fetchADMListini() {
  const sources = [
    { url: `${BASE_URL}/portale/monopoli/tabacchi/prezzi/prezzi_pubblico`, type: 'Prezzi' },
    { url: `${BASE_URL}/portale/monopoli/tabacchi/prezzi/tabacchi-radiati`, type: 'Radiati' },
    { url: `${BASE_URL}/portale/livelli-di-emissioni-delle-sigarette`, type: 'Emissioni' }
  ];
  
  const allListini: any[] = [];

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
    } catch (error: any) {
      console.error(`Error fetching source ${url}:`, error.message);
    }
  }));

  return sortListini(allListini);
}

function sortListini(listini: any[]) {
  const typeOrder: Record<string, number> = { 'Prezzi': 0, 'Emissioni': 1, 'Radiati': 2 };
  const categoryOrder: Record<string, number> = {
    'Sigarette': 1, 'Sigari': 2, 'Sigaretti': 3, 'Fiuto e Mastico': 4,
    'Trinciati': 5, 'Altri Tabacchi': 6, 'Prodotti da inalazione senza combustione': 7
  };

  return listini.sort((a, b) => {
    if (typeOrder[a.type] !== typeOrder[b.type]) return typeOrder[a.type] - typeOrder[b.type];
    const rankA = categoryOrder[a.category] || 99;
    const rankB = categoryOrder[b.category] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return a.title.localeCompare(b.title);
  });
}

export async function fetchADMNews() {
  const url = `${BASE_URL}/portale/novita-accise`;
  try {
    const html = await ADMClient.fetchHTML(url);
    const $ = cheerio.load(html);
    const results: any[] = [];
    const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;

    // Looking for links that mention price changes or tobacco brands
    $('a[href*=".pdf"]').each((_, el) => {
      const href = $(el).attr('href');
      let title = $(el).text().trim().replace(/\s+/g, ' ');
      
      // If title is empty or too short, look at parent text
      if (!title || title.length < 10) {
        title = $(el).closest('h3').text().trim().replace(/\s+/g, ' ') || 
                $(el).parent().text().trim().replace(/\s+/g, ' ');
      }

      const isPriceVariation = /varia(zione)?.*prezzo|listino.*aggiornato|tabacchi.*lavorati|marche.*tabacchi/i.test(title);
      
      if (href && isPriceVariation) {
        let date = 'Non disponibile';
        let effectiveDate = '';
        const parentText = $(el).parent().text().trim();
        const combinedText = (title + ' ' + parentText).replace(/\s+/g, ' ');
        
        // Extract publication date
        const dateMatch = title.match(dateRegex) || parentText.match(dateRegex);
        if (dateMatch) {
          date = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
          if (dateMatch[3].length === 2) date = `${dateMatch[1]}/${dateMatch[2]}/20${dateMatch[3]}`;
        }

        // Extract effective date (usually preceded by "decorrere dal" or "dal")
        // Supports: 06/05/2026, 6 maggio 2026, etc.
        const monthsMap: Record<string, string> = {
          gennaio: '01', febbraio: '02', marzo: '03', aprile: '04', maggio: '05', giugno: '06',
          luglio: '07', agosto: '08', settembre: '09', ottobre: '10', novembre: '11', dicembre: '12'
        };
        const dateDigitRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
        const dateTextRegex = /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/i;
        
        const effTextMatch = combinedText.match(new RegExp(`(?:decorrenza|decorrere dal|dal)\\s+${dateTextRegex.source}`, 'i'));
        const effDigitMatch = combinedText.match(new RegExp(`(?:decorrenza|decorrere dal|dal)\\s+${dateDigitRegex.source}`, 'i'));
        
        if (effTextMatch) {
          const day = effTextMatch[1].padStart(2, '0');
          const month = monthsMap[effTextMatch[2].toLowerCase()];
          const year = effTextMatch[3];
          effectiveDate = `${day}/${month}/${year}`;
        } else if (effDigitMatch) {
          effectiveDate = effDigitMatch[1].replace(/[\-\.]/g, '/');
          const day = effDigitMatch[1].padStart(2, '0');
          const month = effDigitMatch[2].padStart(2, '0');
          let year = effDigitMatch[3];
          if (year.length === 2) year = `20${year}`;
          effectiveDate = `${day}/${month}/${year}`;
        } else if (date !== 'Non disponibile') {
          // Fallback: Day after news publication
          try {
            const [d, m, y] = date.split('/').map(Number);
            const pubDate = new Date(y, m - 1, d);
            const nextDay = new Date(pubDate);
            nextDay.setDate(pubDate.getDate() + 1);
            effectiveDate = `${String(nextDay.getDate()).padStart(2, '0')}/${String(nextDay.getMonth() + 1).padStart(2, '0')}/${nextDay.getFullYear()}`;
          } catch (e) {
            console.warn("[ADM-News] Fallback date calculation failed:", e);
          }
        }

        const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
        
        if (!results.some(r => r.url === fullUrl)) {
          results.push({
            title: title.replace(/\s*-\s*pdf/i, '').trim(),
            url: fullUrl,
            date,
            effectiveDate,
            type: 'Novità',
            status: 'Novità',
            category: 'Variazioni Prezzi'
          });
        }
      }
    });

    return results;
  } catch (error: any) {
    console.error(`Error fetching ADM Novità:`, error.message);
    throw error;
  }
}

export async function downloadADMPdfAsBase64(path: string) {
  const buffer = await ADMClient.downloadPdfAsBuffer(path);
  return Buffer.from(buffer).toString('base64');
}
