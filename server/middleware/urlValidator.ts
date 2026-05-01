import { Request, Response, NextFunction } from 'express';

const ALLOWED_HOSTNAMES = ['www.adm.gov.it'];

/**
 * Middleware to prevent SSRF by validating the 'url' query parameter
 */
export const validateADMUrl = (req: Request, res: Response, next: NextFunction) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: "URL obbligatorio" });
  }

  try {
    const parsedUrl = new URL(url);
    
    if (!ALLOWED_HOSTNAMES.includes(parsedUrl.hostname)) {
      return res.status(400).json({ 
        success: false, 
        error: `Accesso negato: Hostname '${parsedUrl.hostname}' non autorizzato.` 
      });
    }

    // Attach sanitized path to request for services to use
    (req as any).validatedPath = parsedUrl.pathname + parsedUrl.search;
    next();
  } catch (e) {
    // If it's not a valid absolute URL, check if it's a relative path starting with /
    if (url.startsWith('/')) {
      (req as any).validatedPath = url;
      return next();
    }
    
    return res.status(400).json({ success: false, error: "URL non valido" });
  }
};
