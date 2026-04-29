import * as cheerio from 'cheerio';

/**
 * Servizio per interagire con il sito ADM (Agenzia Dogane e Monopoli)
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

  // Ordina per categoria: Prezzi, Emissioni, Radiati, e per rilevanza (Sigarette e Trinciati per primi)
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
  
  // Priorità ai tipi specifici prima di "sigarette" generico
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

  // Regex per cercare una data gg/mm/aaaa o gg.mm.aaaa o gg-mm-aaaa
  const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;

  // Scansione di tutti i link PDF
  $('a[href*=".pdf"]').each((_, el) => {
    let title = $(el).parent().text().trim().replace(/\s+/g, ' ');
    if (!title || title.length < 5) {
      title = $(el).text().trim().replace(/\s+/g, ' ');
    }
    
    // Cerchiamo una data nel testo del nodo, o nei nodi vicini
    let date = 'Non disponibile';
    const textAround = $(el).parent().parent().text();
    const dateMatch = title.match(dateRegex) || textAround.match(dateRegex);
    if (dateMatch) {
      date = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
      // se l'anno ha due cifre, aggiungiamo 20 (es 24 -> 2024)
      if (dateMatch[3].length === 2) {
        date = `${dateMatch[1]}/${dateMatch[2]}/20${dateMatch[3]}`;
      }
    }
    
    // Rimuoviamo il testo inutile " - pdf"
    title = title.replace(/\s*-\s*pdf/i, '');
    
    // Aggiungiamo il tipo se non è già chiaro
    if (type === 'Radiati' && !title.toLowerCase().includes('radiati')) {
      title = `${title} (Radiati)`;
    }
    
    const href = $(el).attr('href');
    
    // Filtro per listini rilevanti (assicuriamoci che sia un link sensato)
    const isRelevant = /sigarette|sigari|sigaretti|trinciati|fiuto|mastico|radiati|emissioni|prezzi|altri tabacchi|inalazione|combustione/i.test(title);
    
    if (href && isRelevant) {
      const fullUrl = href.startsWith('http') ? href : `https://www.adm.gov.it${href}`;
      const category = getCategoryFromTitle(title);
      
      // Evitiamo duplicati
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

  // Ordinamento RIGIDO richiesto dall'utente
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
 * Scarica un file PDF dal sito ADM e lo converte in stringa Base64
 */
export async function downloadADMPdfAsBase64(pdfUrl: string) {
  try {
    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Download fallito con status ${response.status}`);
    }

    // Usiamo arrayBuffer per gestire dati binari sui server Cloud Run
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (error: any) {
    console.error("downloadADMPdfAsBase64 Error:", error.message);
    throw new Error(`Errore durante il download del PDF: ${error.message}`);
  }
}
