import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { fetchADMListini, downloadADMPdfAsBase64 } from '../services/admService.js';
import { analyzeTextWithAI } from '../services/aiAnalyzer.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const admLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: { success: false, error: "Troppe richieste da questo IP, riprova più tardi." }
});

const router = Router();

// Applica rate limiter su tutte le rotte ADM
router.use(admLimiter);

/**
 * GET /api/adm/listini
 * Recupera l'elenco dei listini disponibili sul sito ADM
 */
router.get("/listini", requireAdmin, async (_req, res) => {
  try {
    const listini = await fetchADMListini();
    res.json({ success: true, listini });
  } catch (err: any) {
    console.error("Error in /api/adm/listini:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/adm/download
 * Scarica un PDF dal sito ADM e lo restituisce in Base64 (Protatto da SSRF e richiedenti non admin)
 */
router.get("/download", requireAdmin, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL obbligatorio" });
    }
    
    // SSRF Prevention: Robust URL Parsing to prevent bypass via '@' or other tricks
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== 'www.adm.gov.it') {
         return res.status(400).json({ error: "Accesso negato: Hostname non autorizzato. Sono permessi solo download diretti dal server ADM." });
      }
      if (parsedUrl.protocol !== 'https:') {
         return res.status(400).json({ error: "Accesso negato: Richiesto protocollo sicuro HTTPS." });
      }
    } catch (e) {
      return res.status(400).json({ error: "Formato URL malformato o non valido." });
    }
    
    const base64 = await downloadADMPdfAsBase64(url);
    res.json({ success: true, base64 });
  } catch (err: any) {
    console.error("Error in /api/adm/download:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/adm/analyze
 * Analizza testo estratto dal PDF tramite Gemini AI protetto nel Backend
 */
router.post("/analyze", requireAdmin, async (req, res) => {
  try {
    const { systemPrompt, userPrompt, aiModel } = req.body;
    if (!systemPrompt || !userPrompt) {
        return res.status(400).json({ error: "Parametri mancanti" });
    }
    const result = await analyzeTextWithAI(systemPrompt, userPrompt, aiModel, req.headers.authorization as string);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error("Error in /api/adm/analyze:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
