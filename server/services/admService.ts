import * as cheerio from 'cheerio';

/**
 * Service to interact with the ADM (Agenzia Dogane e Monopoli) website
 */
export async function fetchADMListini() {
  const urls = [
    { url: 'https://www.adm.gov.it/portale/monopoli/tabacchi/prezzi/prezzi_pubblico', type: 'Prezzi' },
    { url: 'https://www.adm.gov.it/portale/monopoli/tabacchi/prezzi/tabacchi-radiati', type: 'Radiati' },
    { url: 'https://www.adm.gov.it/portale/livelli-di-emissioni-delle-sigarette', type: 'Emissioni' }
  ];
  
  const listini: any[] = [];

  const fetchPromises = urls.map(async ({ url, type }) => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'follow'
      });

      if (response.ok) {
        const html = await response.text();
        const items = parseHTML(html, type);
        listini.push(...items);
      } else {
        console.warn(`Impossibile recuperare i listini ADM: ${url} (Status: ${response.status})`);
      }
    } catch (error: any) {
      console.error(`fetchADMListini Error for ${url}:`, error.message);
    }
  });
  
  await Promise.all(fetchPromises);

  // Sort by category: Prezzi, Emissioni, Radiati, and by relevance (Sigarette and Trinciati first)
  return listini.sort((a, b) => {
    const typeOrder: Record<string, number> = {
      'Prezzi': 0,
      'Emissioni': 1,
      'Radiati': 2
    };
    
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    
    const priority = (t: string) => /sigarette|trinciati/i.test(t) ? 0 : 1;
    return priority(a.title) - priority(b.title);
  });
}

function getCategoryFromTitle(title: string): string {
  const t = title.toLowerCase();
  
  // Priority to specific types before generic "sigarette"
  if (t.includes('trinciati')) return 'Trinciati';
  if (t.includes('sigaretti')) return 'Sigaretti';
  if (t.includes('sigari')) return 'Sigari';
  if (t.includes('sigarette')) return 'Sigarette';
  if (t.includes('fiuto') || t.includes('mastico')) return 'Fiuto e Mastico';
  if (t.includes('inalazione') || t.includes('liquidi') || t.includes('senza combustione')) return 'Prodotti da inalazione senza combustione';
  
  return 'Altri Tabacchi';
}

function parseHTML(html: string, type: string) {
  const $ = cheerio.load(html);
  const listini: any[] = [];

  // Regex to find a date dd/mm/yyyy or dd.mm.yyyy or dd-mm-yyyy
  const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;

  // Scan all PDF links
  $('a[href*=".pdf"]').each((_, el) => {
    let title = $(el).parent().text().trim().replace(/\s+/g, ' ');
    if (!title || title.length < 5) {
      title = $(el).text().trim().replace(/\s+/g, ' ');
    }
    
    // Look for a date in the node's text, or in nearby nodes
    let date = 'Non disponibile';
    const textAround = $(el).parent().parent().text();
    const dateMatch = title.match(dateRegex) || textAround.match(dateRegex);
    if (dateMatch) {
      date = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
      // if the year has two digits, add 20 (e.g. 24 -> 2024)
      if (dateMatch[3].length === 2) {
        date = `${dateMatch[1]}/${dateMatch[2]}/20${dateMatch[3]}`;
      }
    }
    
    // Remove useless text " - pdf"
    title = title.replace(/\s*-\s*pdf/i, '');
    
    // Add the type if not already clear
    if (type === 'Radiati' && !title.toLowerCase().includes('radiati')) {
      title = `${title} (Radiati)`;
    }
    
    const href = $(el).attr('href');
    
    // Filter for relevant price lists (ensure it's a valid link)
    const isRelevant = /sigarette|sigari|sigaretti|trinciati|fiuto|mastico|radiati|emissioni|prezzi|altri tabacchi|inalazione|combustione/i.test(title);
    
    if (href && isRelevant) {
      const fullUrl = href.startsWith('http') ? href : `https://www.adm.gov.it${href}`;
      const category = getCategoryFromTitle(title);
      
      // Avoid duplicates
      if (!listini.some(l => l.url === fullUrl)) {
        listini.push({
          title,
          url: fullUrl,
          date,
          type,
          category,
          status: type === 'Prezzi' ? 'Attivo' : (type === 'Radiati' ? 'Radiato' : 'Emissione')
        });
      }
    }
  });

  // STRICT sorting required by the user
  const categoryOrder: Record<string, number> = {
    'Sigarette': 1,
    'Sigari': 2,
    'Sigaretti': 3,
    'Fiuto e Mastico': 4,
    'Trinciati': 5,
    'Altri Tabacchi': 6,
    'Prodotti da inalazione senza combustione': 7
  };

  return listini.sort((a, b) => {
    const rankA = categoryOrder[a.category] || 99;
    const rankB = categoryOrder[b.category] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Downloads a PDF file from the ADM site and converts it to a Base64 string
 * Prevents SSRF by forcing the hostname
 */
export async function downloadADMPdfAsBase64(path: string) {
  try {
    const baseUrl = 'https://www.adm.gov.it';
    const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    
    // Additional security check: if for some reason a different hostname remains
    const finalUrl = new URL(fullUrl);
    if (finalUrl.hostname !== 'www.adm.gov.it') {
        throw new Error("Hostname non autorizzato nel servizio di download.");
    }

    const response = await fetch(finalUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Download fallito con status ${response.status}`);
    }

    // Use arrayBuffer to handle binary data on Cloud Run servers
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (error: any) {
    console.error("downloadADMPdfAsBase64 Error:", error.message);
    throw new Error(`Errore durante il download del PDF: ${error.message}`);
  }
}
