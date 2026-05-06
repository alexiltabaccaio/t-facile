import * as cheerio from 'cheerio';
import { BASE_URL } from './admClient.js';

export interface ADMListItem {
  title: string;
  url: string;
  date: string;
  type: string;
  category?: string;
  status?: string;
}

export interface ADMNewsItem extends ADMListItem {
  effectiveDate: string;
}

/**
 * ADMParser handles the extraction of structured data from ADM HTML pages.
 */
export const ADMParser = {
  /**
   * Parses price list tables from HTML.
   */
  parseListini: (html: string, type: string): ADMListItem[] => {
    const $ = cheerio.load(html);
    const results: ADMListItem[] = [];
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

  /**
   * Parses news items (price variations) from HTML.
   */
  parseNews: (html: string): ADMNewsItem[] => {
    const $ = cheerio.load(html);
    const results: ADMNewsItem[] = [];
    const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
    const monthsMap: Record<string, string> = {
      gennaio: '01', febbraio: '02', marzo: '03', aprile: '04', maggio: '05', giugno: '06',
      luglio: '07', agosto: '08', settembre: '09', ottobre: '10', novembre: '11', dicembre: '12'
    };

    $('a[href*=".pdf"]').each((_, el) => {
      const href = $(el).attr('href');
      let title = $(el).text().trim().replace(/\s+/g, ' ');
      
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
        
        const dateMatch = title.match(dateRegex) || parentText.match(dateRegex);
        if (dateMatch) {
          date = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
          if (dateMatch[3].length === 2) date = `${dateMatch[1]}/${dateMatch[2]}/20${dateMatch[3]}`;
        }

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
          const day = effDigitMatch[1].padStart(2, '0');
          const month = effDigitMatch[2].padStart(2, '0');
          let year = effDigitMatch[3];
          if (year.length === 2) year = `20${year}`;
          effectiveDate = `${day}/${month}/${year}`;
        } else if (date !== 'Non disponibile') {
          try {
            const [d, m, y] = date.split('/').map(Number);
            const pubDate = new Date(y, m - 1, d);
            const nextDay = new Date(pubDate);
            nextDay.setDate(pubDate.getDate() + 1);
            effectiveDate = `${String(nextDay.getDate()).padStart(2, '0')}/${String(nextDay.getMonth() + 1).padStart(2, '0')}/${nextDay.getFullYear()}`;
          } catch (e) {
            console.warn("[ADMParser] Fallback date calculation failed:", e);
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
  },

  /**
   * Derives a product category from its title.
   */
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
