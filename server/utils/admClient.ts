export const BASE_URL = 'https://www.adm.gov.it';
export const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (T-Facile-Bot; +https://github.com/alexiltabaccaio/t-facile)';

/**
 * ADMClient handles pure HTTP fetching logic for the ADM website.
 */
export const ADMClient = {
  /**
   * Fetches the HTML content of a given URL.
   */
  fetchHTML: async (url: string) => {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  },

  /**
   * Downloads a PDF file and returns it as an ArrayBuffer.
   * Includes security check for hostname.
   */
  downloadPdfAsBuffer: async (path: string) => {
    const fullUrl = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    const finalUrl = new URL(fullUrl);
    
    if (finalUrl.hostname !== 'www.adm.gov.it') {
      throw new Error("Hostname not authorized");
    }

    const response = await fetch(finalUrl.toString(), {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    return await response.arrayBuffer();
  }
};
